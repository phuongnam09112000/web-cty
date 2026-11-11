import type { PrismaClient } from "../../db.js";
import { PERMISSIONS } from "./catalog.js";

export async function syncPermissions(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const permission of PERMISSIONS) {
      const existing = await tx.permission.findUnique({ where: { key: permission.key } });
      if (existing) {
        await tx.permission.update({
          where: { id: existing.id },
          data: { module: permission.module, label: permission.label },
        });
        continue;
      }
      const created = await tx.permission.create({
        data: { key: permission.key, module: permission.module, label: permission.label },
      });
      for (const roleName of permission.defaultRoles ?? []) {
        const role = await tx.role.findUnique({ where: { name: roleName } });
        if (role) {
          await tx.rolePermission.create({
            data: { roleId: role.id, permissionId: created.id },
          });
        }
      }
    }
    await tx.permission.deleteMany({
      where: { key: { notIn: PERMISSIONS.map((permission) => permission.key) } },
    });
  });
}
