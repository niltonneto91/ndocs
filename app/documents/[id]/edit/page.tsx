import { notFound } from "next/navigation";
import { DocumentWizard } from "@/components/document-wizard";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [document, terminals, assets, projects, categories, agencies, standards] = await Promise.all([
    prisma.document.findFirst({ where: { id, companyId: DEMO_COMPANY_ID }, include: { agencies: true } }),
    prisma.terminal.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { name: "asc" } }),
    prisma.asset.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { code: "asc" } }),
    prisma.project.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { name: "asc" } }),
    prisma.documentCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.regulatoryAgency.findMany({ orderBy: { name: "asc" } }),
    prisma.referenceStandard.findMany({ orderBy: { code: "asc" } })
  ]);
  if (!document) notFound();
  return (
    <>
      <PageHeader title="Editar documento" description="Atualize metadados, órgãos de destino e, se necessário, envie uma nova versão." />
      <DocumentWizard
        document={document}
        terminals={terminals}
        assets={assets}
        projects={projects}
        categories={categories}
        agencies={agencies}
        standards={standards}
        selectedAgencyIds={document.agencies.map((item) => item.agencyId)}
      />
    </>
  );
}
