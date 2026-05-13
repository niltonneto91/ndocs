import { notFound } from "next/navigation";
import { TerminalForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";

export default async function EditTerminalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const terminal = await prisma.terminal.findFirst({ where: { id, companyId: DEMO_COMPANY_ID } });
  if (!terminal) notFound();
  return <><PageHeader title="Editar terminal" /><TerminalForm terminal={terminal} /></>;
}
