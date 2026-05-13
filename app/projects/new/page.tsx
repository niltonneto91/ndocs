import { ProjectForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";

export default async function NewProjectPage() {
  const terminals = await prisma.terminal.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { name: "asc" } });
  return <><PageHeader title="Novo projeto" /><ProjectForm terminals={terminals} /></>;
}
