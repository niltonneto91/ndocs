import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DataTable, Td, Th } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await prisma.asset.findFirst({
    where: { id, companyId: DEMO_COMPANY_ID },
    include: { terminal: true, documents: { include: { category: true } } }
  });
  if (!asset) notFound();
  return (
    <>
      <PageHeader title={`${asset.code} - ${asset.name}`} description="Prontuário digital do ativo." action={<div className="flex gap-2"><Button href={`/documents/new?terminalId=${asset.terminalId}&assetId=${asset.id}`} variant="secondary">Adicionar documento</Button><Button href={`/assets/${asset.id}/edit`}>Editar</Button></div>} />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-muted-foreground">Terminal</p><p className="mt-2 font-semibold">{asset.terminal.name}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Tipo</p><p className="mt-2 font-semibold">{asset.type}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Capacidade</p><p className="mt-2 font-semibold">{formatNumber(asset.capacityM3, " m³")}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Status</p><div className="mt-2"><Badge value={asset.status} /></div></Card>
      </div>
      <Card className="mt-6">
        <CardHeader title="Dados técnicos" />
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <p><span className="text-muted-foreground">Produto:</span> {asset.product ?? "-"}</p>
          <p><span className="text-muted-foreground">Localização:</span> {asset.location ?? "-"}</p>
          <p><span className="text-muted-foreground">Norma:</span> {asset.designStandard ?? "-"}</p>
          <p><span className="text-muted-foreground">Comissionamento:</span> {formatDate(asset.commissioningDate)}</p>
          <p><span className="text-muted-foreground">Última inspeção:</span> {formatDate(asset.lastInspectionDate)}</p>
          <p><span className="text-muted-foreground">Próxima inspeção:</span> {formatDate(asset.nextInspectionDate)}</p>
        </div>
      </Card>
      <Card className="mt-6">
        <CardHeader title="Documentos associados" />
        <DataTable>
          <thead><tr><Th>Documento</Th><Th>Categoria</Th><Th>Validade</Th><Th>Status</Th></tr></thead>
          <tbody>{asset.documents.map((document) => <tr key={document.id}><Td><Link className="text-cyan-800" href={`/documents/${document.id}`}>{document.title}</Link></Td><Td>{document.category.name}</Td><Td>{formatDate(document.expirationDate)}</Td><Td><Badge value={document.status} /></Td></tr>)}</tbody>
        </DataTable>
      </Card>
    </>
  );
}
