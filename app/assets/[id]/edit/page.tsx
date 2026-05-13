import { notFound } from "next/navigation";
import { AssetForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [asset, terminals] = await Promise.all([
    prisma.asset.findFirst({ where: { id, companyId: DEMO_COMPANY_ID } }),
    prisma.terminal.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { name: "asc" } })
  ]);
  if (!asset) notFound();
  return <><PageHeader title="Editar ativo" /><AssetForm asset={asset} terminals={terminals} /></>;
}
