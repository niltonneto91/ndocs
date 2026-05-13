import { notFound } from "next/navigation";
import { addDocumentVersion } from "@/lib/actions";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default async function NewVersionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await prisma.document.findFirst({ where: { id, companyId: DEMO_COMPANY_ID } });
  if (!document) notFound();
  return (
    <>
      <PageHeader title="Nova versão" description={document.title} />
      <Card>
        <form action={addDocumentVersion} className="grid gap-5">
          <input type="hidden" name="documentId" value={document.id} />
          <Field label="Revisão"><Input required name="revision" defaultValue={document.revision} /></Field>
          <Field label="Arquivo"><Input required name="file" type="file" /></Field>
          <Field label="Notas"><Input name="notes" /></Field>
          <Button type="submit">Enviar versão</Button>
        </form>
      </Card>
    </>
  );
}
