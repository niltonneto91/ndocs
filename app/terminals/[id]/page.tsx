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

export default async function TerminalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const terminal = await prisma.terminal.findFirst({
    where: { id, companyId: DEMO_COMPANY_ID },
    include: { assets: true, projects: true, documents: { include: { category: true } } }
  });
  if (!terminal) notFound();
  const overdue = terminal.documents.filter((document) => document.status === "vencido" || document.status === "a_vencer");
  return (
    <>
      <PageHeader title={terminal.name} description={terminal.description ?? "Prontuário documental do terminal."} action={<div className="flex gap-2"><Button href={`/documents/new?terminalId=${terminal.id}`} variant="secondary">Adicionar documento</Button><Button href={`/terminals/${terminal.id}/edit`}>Editar</Button></div>} />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-muted-foreground">Status</p><div className="mt-2"><Badge value={terminal.status} /></div></Card>
        <Card><p className="text-sm text-muted-foreground">Capacidade</p><p className="mt-2 text-xl font-semibold">{formatNumber(terminal.totalCapacityM3, " m³")}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Ativos</p><p className="mt-2 text-xl font-semibold">{terminal.assets.length}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Pendências</p><p className="mt-2 text-xl font-semibold">{overdue.length}</p></Card>
      </div>
      <div className="mt-6 grid gap-6">
        <Card>
          <CardHeader title="Ativos" />
          <DataTable><thead><tr><Th>Código</Th><Th>Nome</Th><Th>Tipo</Th><Th>Status</Th></tr></thead><tbody>{terminal.assets.map((asset) => <tr key={asset.id}><Td><Link className="text-cyan-800" href={`/assets/${asset.id}`}>{asset.code}</Link></Td><Td>{asset.name}</Td><Td>{asset.type}</Td><Td><Badge value={asset.status} /></Td></tr>)}</tbody></DataTable>
        </Card>
        <Card>
          <CardHeader title="Projetos" />
          <DataTable><thead><tr><Th>Projeto</Th><Th>Disciplina</Th><Th>Status</Th></tr></thead><tbody>{terminal.projects.map((project) => <tr key={project.id}><Td><Link className="text-cyan-800" href={`/projects/${project.id}`}>{project.name}</Link></Td><Td>{project.discipline}</Td><Td><Badge value={project.status} /></Td></tr>)}</tbody></DataTable>
        </Card>
        <Card>
          <CardHeader title="Documentos" />
          <DataTable><thead><tr><Th>Documento</Th><Th>Categoria</Th><Th>Validade</Th><Th>Status</Th></tr></thead><tbody>{terminal.documents.map((document) => <tr key={document.id}><Td><Link className="text-cyan-800" href={`/documents/${document.id}`}>{document.title}</Link></Td><Td>{document.category.name}</Td><Td>{formatDate(document.expirationDate)}</Td><Td><Badge value={document.status} /></Td></tr>)}</tbody></DataTable>
        </Card>
      </div>
    </>
  );
}
