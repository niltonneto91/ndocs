import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, terminals] = await Promise.all([
    prisma.project.findFirst({ where: { id, companyId: DEMO_COMPANY_ID } }),
    prisma.terminal.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { name: "asc" } })
  ]);
  if (!project) notFound();
  return <><PageHeader title="Editar projeto" /><ProjectForm project={project} terminals={terminals} /></>;
}
