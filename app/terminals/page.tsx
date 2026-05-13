import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Td, Th } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";

export default async function TerminalsPage() {
  const terminals = await prisma.terminal.findMany({
    where: { companyId: DEMO_COMPANY_ID },
    include: { _count: { select: { assets: true, projects: true, documents: true } } },
    orderBy: { name: "asc" }
  });
  return (
    <>
      <PageHeader title="Terminais" description="Bases e terminais com visão documental, ativos e projetos." action={<Button href="/terminals/new">Novo terminal</Button>} />
      <DataTable>
        <thead><tr><Th>Terminal</Th><Th>Local</Th><Th>Capacidade</Th><Th>Ativos</Th><Th>Projetos</Th><Th>Documentos</Th><Th>Status</Th></tr></thead>
        <tbody>
          {terminals.map((terminal) => (
            <tr key={terminal.id}>
              <Td><Link className="font-medium text-cyan-800" href={`/terminals/${terminal.id}`}>{terminal.name}</Link><p className="text-xs text-muted-foreground">{terminal.code}</p></Td>
              <Td>{[terminal.city, terminal.state].filter(Boolean).join(" / ") || "-"}</Td>
              <Td>{formatNumber(terminal.totalCapacityM3, " m³")}</Td>
              <Td>{terminal._count.assets}</Td>
              <Td>{terminal._count.projects}</Td>
              <Td>{terminal._count.documents}</Td>
              <Td><Badge value={terminal.status} /></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
