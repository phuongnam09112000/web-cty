import type { PrismaClient } from "../../db.js";
import { PERMISSIONS } from "./catalog.js";

export async function syncPermissions(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const permission of PERMISSIONS) {
      await tx.permission.upsert({
        where: { key: permission.key },
        create: { key: permission.key, module: permission.module, label: permission.label },
        update: { module: permission.module, label: permission.label },
      });
    }
    await tx.permission.deleteMany({
      where: { key: { notIn: PERMISSIONS.map((permission) => permission.key) } },
    });
  });
}
