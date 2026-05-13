import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { DataTable, Td, Th } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DossierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dossier = await prisma.dossier.findFirst({
    where: { id, companyId: DEMO_COMPANY_ID },
    include: {
      terminal: true,
      documents: { include: { document: { include: { category: true, terminal: true, agencies: { include: { agency: true } }, currentVersion: true } } }, orderBy: { order: "asc" } }
    }
  });
  if (!dossier) notFound();
  return (
    <>
      <PageHeader title={dossier.name} description={dossier.description ?? "Índice organizado do dossiê."} />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-muted-foreground">Tipo</p><p className="mt-2 font-semibold">{dossier.type}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Terminal</p><p className="mt-2 font-semibold">{dossier.terminal?.name ?? "Todos"}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Documentos</p><p className="mt-2 font-semibold">{dossier.documents.length}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Status</p><div className="mt-2"><Badge value={dossier.status} /></div></Card>
      </div>
      <Card className="mt-6">
        <CardHeader title="Índice do dossiê" description="Exportação inicial em formato navegável; ZIP/PDF fica preparado para fase posterior." />
        <DataTable>
          <thead><tr><Th>#</Th><Th>Documento</Th><Th>Órgãos</Th><Th>Terminal</Th><Th>Validade</Th><Th>Status</Th><Th>Arquivo</Th></tr></thead>
          <tbody>{dossier.documents.map((item) => <tr key={item.id}><Td>{item.order}</Td><Td><Link className="font-medium text-cyan-800" href={`/documents/${item.document.id}`}>{item.document.title}</Link><p className="text-xs text-muted-foreground">{item.document.category.name}</p></Td><Td><div className="flex flex-wrap gap-1">{item.document.agencies.length ? item.document.agencies.map((link) => <span key={link.id} className="rounded-full bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-800">{link.agency.name}</span>) : "-"}</div></Td><Td>{item.document.terminal?.name ?? "-"}</Td><Td>{formatDate(item.document.expirationDate)}</Td><Td><Badge value={item.document.status} /></Td><Td>{item.document.currentVersion ? <Link className="text-cyan-800" href={`/uploads/${item.document.currentVersion.filePath}`}>Baixar</Link> : "Sem arquivo"}</Td></tr>)}</tbody>
        </DataTable>
      </Card>
    </>
  );
}
