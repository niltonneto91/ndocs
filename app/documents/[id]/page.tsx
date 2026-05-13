import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DataTable, Td, Th } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await prisma.document.findFirst({
    where: { id, companyId: DEMO_COMPANY_ID },
    include: { terminal: true, asset: true, project: true, category: true, agencies: { include: { agency: true } }, standard: true, versions: { orderBy: { versionNumber: "desc" } }, currentVersion: true }
  });
  if (!document) notFound();
  return (
    <>
      <PageHeader title={document.title} description={document.description ?? "Registro documental técnico."} action={<div className="flex gap-2"><Button href="/documents" variant="ghost">Biblioteca</Button><Button href={`/documents/${document.id}/versions/new`} variant="secondary">Nova versão</Button><Button href={`/documents/${document.id}/edit`}>Editar metadados</Button></div>} />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-muted-foreground">Status</p><div className="mt-2"><Badge value={document.status} /></div></Card>
        <Card><p className="text-sm text-muted-foreground">Categoria</p><p className="mt-2 font-semibold">{document.category.name}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Revisão atual</p><p className="mt-2 font-semibold">{document.revision}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Validade</p><p className="mt-2 font-semibold">{formatDate(document.expirationDate)}</p></Card>
      </div>
      <Card className="mt-6">
        <CardHeader title="Metadados" />
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <p><span className="text-muted-foreground">Código:</span> {document.code ?? "-"}</p>
          <p><span className="text-muted-foreground">Terminal:</span> {document.terminal?.name ?? "-"}</p>
          <p><span className="text-muted-foreground">Ativo:</span> {document.asset ? `${document.asset.code} - ${document.asset.name}` : "-"}</p>
          <p><span className="text-muted-foreground">Projeto:</span> {document.project?.name ?? "-"}</p>
          <p><span className="text-muted-foreground">Norma:</span> {document.standard?.code ?? "-"}</p>
          <p><span className="text-muted-foreground">Emissão:</span> {formatDate(document.issueDate)}</p>
          <p><span className="text-muted-foreground">Responsável:</span> {document.responsible ?? "-"}</p>
          <p><span className="text-muted-foreground">Tags:</span> {document.tags ?? "-"}</p>
        </div>
        <div className="mt-5 border-t pt-4">
          <p className="text-sm font-medium text-slate-700">Órgãos de destino</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {document.agencies.length ? document.agencies.map((item) => <span key={item.id} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800">{item.agency.name}</span>) : <span className="text-sm text-slate-500">Nenhum órgão vinculado.</span>}
          </div>
        </div>
      </Card>
      <Card className="mt-6">
        <CardHeader title="Versão atual" description="Arquivo vigente para consulta ou envio." />
        {document.currentVersion ? (
          <div className="flex flex-col gap-3 rounded-md border bg-slate-50 p-4 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">v{document.currentVersion.versionNumber} / {document.currentVersion.revision}</p>
              <p className="text-muted-foreground">{document.currentVersion.originalFileName}</p>
            </div>
            <Button href={`/uploads/${document.currentVersion.filePath}`} variant="secondary">Baixar arquivo</Button>
          </div>
        ) : (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Documento sem arquivo atual. Envie uma nova versão para completar o registro.</p>
        )}
      </Card>
      <Card className="mt-6">
        <CardHeader title="Histórico de versões" />
        <DataTable>
          <thead><tr><Th>Versão</Th><Th>Arquivo</Th><Th>Revisão</Th><Th>Upload</Th><Th>Atual</Th><Th>Ações</Th></tr></thead>
          <tbody>{document.versions.map((version) => <tr key={version.id}><Td>v{version.versionNumber}</Td><Td>{version.originalFileName}</Td><Td>{version.revision}</Td><Td>{formatDate(version.createdAt)}</Td><Td>{version.isCurrent ? "Sim" : "Não"}</Td><Td><Link className="text-cyan-800" href={`/uploads/${version.filePath}`}>Baixar</Link></Td></tr>)}</tbody>
        </DataTable>
      </Card>
    </>
  );
}
