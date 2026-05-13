import { DossierForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";

export default async function NewDossierPage() {
  const [terminals, documents] = await Promise.all([
    prisma.terminal.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { name: "asc" } }),
    prisma.document.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { title: "asc" } })
  ]);
  return <><PageHeader title="Novo dossiê" description="Selecione documentos para montar um índice organizado." /><DossierForm terminals={terminals} documents={documents} /></>;
}
