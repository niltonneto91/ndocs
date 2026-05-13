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

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, companyId: DEMO_COMPANY_ID },
    include: { terminal: true, documents: { include: { category: true } } }
  });
  if (!project) notFound();
  return (
    <>
      <PageHeader title={project.name} description={project.description ?? "Documentação associada ao projeto."} action={<div className="flex gap-2"><Button href={`/documents/new?terminalId=${project.terminalId}&projectId=${project.id}`} variant="secondary">Adicionar documento</Button><Button href={`/projects/${project.id}/edit`}>Editar</Button></div>} />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-muted-foreground">Terminal</p><p className="mt-2 font-semibold">{project.terminal.name}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Disciplina</p><p className="mt-2 font-semibold">{project.discipline}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Período</p><p className="mt-2 font-semibold">{formatDate(project.startDate)} - {formatDate(project.endDate)}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Status</p><div className="mt-2"><Badge value={project.status} /></div></Card>
      </div>
      <Card className="mt-6">
        <CardHeader title="Documentos associados" />
        <DataTable>
          <thead><tr><Th>Documento</Th><Th>Categoria</Th><Th>Validade</Th><Th>Status</Th></tr></thead>
          <tbody>{project.documents.map((document) => <tr key={document.id}><Td><Link className="text-cyan-800" href={`/documents/${document.id}`}>{document.title}</Link></Td><Td>{document.category.name}</Td><Td>{formatDate(document.expirationDate)}</Td><Td><Badge value={document.status} /></Td></tr>)}</tbody>
        </DataTable>
      </Card>
    </>
  );
}
