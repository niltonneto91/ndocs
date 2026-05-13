import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Td, Th } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    where: { companyId: DEMO_COMPANY_ID },
    include: { terminal: true, _count: { select: { documents: true } } },
    orderBy: { code: "asc" }
  });
  return (
    <>
      <PageHeader title="Ativos" description="Prontuários digitais de tanques, bombas, tubulações e sistemas críticos." action={<Button href="/assets/new">Novo ativo</Button>} />
      <DataTable>
        <thead><tr><Th>Ativo</Th><Th>Terminal</Th><Th>Tipo</Th><Th>Capacidade</Th><Th>Próxima inspeção</Th><Th>Documentos</Th><Th>Status</Th></tr></thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <Td><Link className="font-medium text-cyan-800" href={`/assets/${asset.id}`}>{asset.code} - {asset.name}</Link></Td>
              <Td>{asset.terminal.name}</Td>
              <Td>{asset.type}</Td>
              <Td>{formatNumber(asset.capacityM3, " m³")}</Td>
              <Td>{formatDate(asset.nextInspectionDate)}</Td>
              <Td>{asset._count.documents}</Td>
              <Td><Badge value={asset.status} /></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
