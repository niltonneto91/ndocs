import { upsertAgency, upsertCategory, upsertStandard } from "@/lib/actions";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { DataTable, Td, Th } from "@/components/ui/table";

export default async function SettingsPage() {
  const [company, categories, agencies, standards] = await Promise.all([
    prisma.company.findUnique({ where: { id: DEMO_COMPANY_ID } }),
    prisma.documentCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.regulatoryAgency.findMany({ orderBy: { name: "asc" } }),
    prisma.referenceStandard.findMany({ orderBy: { code: "asc" } })
  ]);
  return (
    <>
      <PageHeader title="Configurações" description="Cadastros básicos do MVP sem autenticação." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Empresa demo" />
          <div className="grid gap-2 text-sm">
            <p><span className="text-muted-foreground">Nome:</span> {company?.name}</p>
            <p><span className="text-muted-foreground">Razão social:</span> {company?.legalName ?? "-"}</p>
            <p><span className="text-muted-foreground">CNPJ:</span> {company?.cnpj ?? "-"}</p>
          </div>
        </Card>
        <Card>
          <CardHeader title="Nova categoria" />
          <form action={upsertCategory} className="grid gap-3 md:grid-cols-3">
            <Field label="Nome"><Input required name="name" /></Field>
            <Field label="Cor"><Input name="color" placeholder="#0e7490" /></Field>
            <Field label="Descrição"><Input name="description" /></Field>
            <Button type="submit" className="md:col-span-3">Adicionar categoria</Button>
          </form>
        </Card>
        <Card>
          <CardHeader title="Categorias" />
          <DataTable><thead><tr><Th>Nome</Th><Th>Descrição</Th><Th>Cor</Th></tr></thead><tbody>{categories.map((item) => <tr key={item.id}><Td>{item.name}</Td><Td>{item.description ?? "-"}</Td><Td>{item.color ?? "-"}</Td></tr>)}</tbody></DataTable>
        </Card>
        <Card>
          <CardHeader title="Órgãos reguladores" />
          <form action={upsertAgency} className="mb-4 grid gap-3 md:grid-cols-2">
            <Field label="Nome"><Input required name="name" /></Field>
            <Field label="Descrição"><Input name="description" /></Field>
            <Button type="submit" className="md:col-span-2">Adicionar órgão</Button>
          </form>
          <DataTable><thead><tr><Th>Nome</Th><Th>Descrição</Th></tr></thead><tbody>{agencies.map((item) => <tr key={item.id}><Td>{item.name}</Td><Td>{item.description ?? "-"}</Td></tr>)}</tbody></DataTable>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Normas de referência" />
          <form action={upsertStandard} className="mb-4 grid gap-3 md:grid-cols-3">
            <Field label="Código"><Input required name="code" /></Field>
            <Field label="Nome"><Input required name="name" /></Field>
            <Field label="Descrição"><Input name="description" /></Field>
            <Button type="submit" className="md:col-span-3">Adicionar norma</Button>
          </form>
          <DataTable><thead><tr><Th>Código</Th><Th>Nome</Th><Th>Descrição</Th></tr></thead><tbody>{standards.map((item) => <tr key={item.id}><Td>{item.code}</Td><Td>{item.name}</Td><Td>{item.description ?? "-"}</Td></tr>)}</tbody></DataTable>
        </Card>
      </div>
    </>
  );
}
