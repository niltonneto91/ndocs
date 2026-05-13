import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, Td, Th } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DossiersPage() {
  const dossiers = await prisma.dossier.findMany({
    where: { companyId: DEMO_COMPANY_ID },
    include: { terminal: true, _count: { select: { documents: true } } },
    orderBy: { updatedAt: "desc" }
  });
  return (
    <>
      <PageHeader title="Dossiês" description="Pacotes documentais para auditorias, fiscalizações e clientes." action={<Button href="/dossiers/new">Novo dossiê</Button>} />
      <DataTable>
        <thead><tr><Th>Dossiê</Th><Th>Tipo</Th><Th>Terminal</Th><Th>Documentos</Th><Th>Atualização</Th><Th>Status</Th></tr></thead>
        <tbody>{dossiers.map((dossier) => <tr key={dossier.id}><Td><Link className="font-medium text-cyan-800" href={`/dossiers/${dossier.id}`}>{dossier.name}</Link></Td><Td>{dossier.type}</Td><Td>{dossier.terminal?.name ?? "Todos"}</Td><Td>{dossier._count.documents}</Td><Td>{formatDate(dossier.updatedAt)}</Td><Td><Badge value={dossier.status} /></Td></tr>)}</tbody>
      </DataTable>
    </>
  );
}
