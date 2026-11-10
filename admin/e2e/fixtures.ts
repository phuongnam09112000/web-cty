import { randomUUID } from "node:crypto";
import { test as base, expect, request, type APIRequestContext } from "@playwright/test";

export const ADMIN_EMAIL = "admin@istt.vn";
export const ADMIN_PASSWORD = "Matkhau@12345";
export const NEW_PASSWORD = "MatKhauMoi@2026";

const ORIGIN = "http://localhost:5173";

export type SeededUser = { id: number; email: string; password: string };

export type Seeder = {
  api: APIRequestContext;
  seedUser: (options?: { roleName?: string; permissions?: string[] }) => Promise<SeededUser>;
  deactivate: (userId: number) => Promise<void>;
};

async function expectOk(response: { ok(): boolean; status(): number; text(): Promise<string> }) {
  if (!response.ok()) throw new Error(`${response.status()} ${await response.text()}`);
}

export const test = base.extend<{ seeder: Seeder }>({
  seeder: async ({ baseURL }, use) => {
    const api = await request.newContext({
      baseURL: baseURL ?? ORIGIN,
      extraHTTPHeaders: { Origin: ORIGIN },
    });
    const login = await api.post("/api/admin/auth/login", {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    await expectOk(login);

    const seedUser: Seeder["seedUser"] = async (options = {}) => {
      const suffix = randomUUID().slice(0, 8);
      let roleId: number;
      if (options.roleName) {
        const created = await api.post("/api/admin/roles", { data: { name: `${options.roleName} ${suffix}` } });
        await expectOk(created);
        roleId = ((await created.json()) as { id: number }).id;
        if (options.permissions?.length) {
          await expectOk(
            await api.put(`/api/admin/roles/${roleId}/permissions`, { data: { permissions: options.permissions } }),
          );
        }
      } else {
        const roles = await api.get("/api/admin/roles");
        await expectOk(roles);
        const list = (await roles.json()) as { id: number; isSystem: boolean }[];
        roleId = list.find((role) => role.isSystem)!.id;
      }
      const email = `user-${suffix}@istt.vn`;
      const created = await api.post("/api/admin/users", {
        data: { email, fullName: `Người dùng ${suffix}`, roleId },
      });
      await expectOk(created);
      const body = (await created.json()) as { user: { id: number }; temporaryPassword: string };
      return { id: body.user.id, email, password: body.temporaryPassword };
    };

    const deactivate: Seeder["deactivate"] = async (userId) => {
      await expectOk(await api.patch(`/api/admin/users/${userId}`, { data: { isActive: false } }));
    };

    await use({ api, seedUser, deactivate });
    await api.dispose();
  },
});

export { expect };
