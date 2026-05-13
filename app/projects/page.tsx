import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, Td, Th } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { companyId: DEMO_COMPANY_ID },
    include: { terminal: true, _count: { select: { documents: true } } },
    orderBy: { updatedAt: "desc" }
  });
  return (
    <>
      <PageHeader title="Projetos" description="Projetos técnicos vinculados aos terminais e seus documentos." action={<Button href="/projects/new">Novo projeto</Button>} />
      <DataTable>
        <thead><tr><Th>Projeto</Th><Th>Terminal</Th><Th>Disciplina</Th><Th>Período</Th><Th>Documentos</Th><Th>Status</Th></tr></thead>
        <tbody>{projects.map((project) => <tr key={project.id}><Td><Link className="font-medium text-cyan-800" href={`/projects/${project.id}`}>{project.name}</Link><p className="text-xs text-muted-foreground">{project.code}</p></Td><Td>{project.terminal.name}</Td><Td>{project.discipline}</Td><Td>{formatDate(project.startDate)} - {formatDate(project.endDate)}</Td><Td>{project._count.documents}</Td><Td><Badge value={project.status} /></Td></tr>)}</tbody>
      </DataTable>
    </>
  );
}
