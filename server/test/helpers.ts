import type { PrismaClient } from "../src/db.js";
import { EDITOR_ROLE_NAME, SYSTEM_ROLE_NAME } from "../src/modules/permissions/catalog.js";
import { syncPermissions } from "../src/modules/permissions/sync.js";

export async function resetDb(prisma: PrismaClient): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.role.deleteMany({
    where: { name: { notIn: [SYSTEM_ROLE_NAME, EDITOR_ROLE_NAME] } },
  });
  await prisma.permission.deleteMany();
  await syncPermissions(prisma);
}
