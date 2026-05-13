import { prisma } from "@/lib/prisma";
import { getCurrentDemoContext } from "@/lib/demo-context";
import type { Prisma } from "@prisma/client";

type AuditInput = {
  entityType: string;
  entityId: string;
  action: string;
  description: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createAuditLog(input: AuditInput) {
  const { currentCompanyId, currentUserId } = await getCurrentDemoContext();
  await prisma.auditLog.create({
    data: {
      companyId: currentCompanyId,
      userId: currentUserId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      description: input.description,
      metadata: input.metadata
    }
  });
}
