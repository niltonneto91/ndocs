import { DocumentWizard } from "@/components/document-wizard";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";

export default async function NewDocumentPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const defaults = await searchParams;
  const [terminals, assets, projects, categories, agencies, standards] = await Promise.all([
    prisma.terminal.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { name: "asc" } }),
    prisma.asset.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { code: "asc" } }),
    prisma.project.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { name: "asc" } }),
    prisma.documentCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.regulatoryAgency.findMany({ orderBy: { name: "asc" } }),
    prisma.referenceStandard.findMany({ orderBy: { code: "asc" } })
  ]);
  return (
    <>
      <PageHeader title="Novo documento" description="Cadastre o documento em etapas, selecione múltiplos órgãos e vincule-o ao contexto técnico correto." />
      <DocumentWizard
        terminals={terminals}
        assets={assets}
        projects={projects}
        categories={categories}
        agencies={agencies}
        standards={standards}
        defaults={{
          terminalId: defaults.terminalId,
          assetId: defaults.assetId,
          projectId: defaults.projectId
        }}
      />
    </>
  );
}
