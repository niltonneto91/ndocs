import { Card, CardHeader } from "@/components/ui/card";
import { DataTable, Td, Th } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <>
      <PageHeader title="Logs de auditoria" description="Registro simples de ações principais executadas no contexto demo." />
      <Card>
        <CardHeader title="Eventos recentes" />
        <DataTable>
          <thead><tr><Th>Data</Th><Th>Entidade</Th><Th>Ação</Th><Th>Descrição</Th><Th>Usuário</Th></tr></thead>
          <tbody>{logs.map((log) => <tr key={log.id}><Td>{formatDate(log.createdAt)}</Td><Td>{log.entityType}</Td><Td>{log.action}</Td><Td>{log.description}</Td><Td>{log.userId}</Td></tr>)}</tbody>
        </DataTable>
      </Card>
    </>
  );
}
