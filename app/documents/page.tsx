import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { DataTable, Td, Th } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { documentStatusOptions } from "@/lib/options";

type SearchValue = string | string[] | undefined;

function first(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function many(value: SearchValue) {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
}

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<Record<string, SearchValue>> }) {
  const filters = await searchParams;
  const selectedAgencyIds = many(filters.agencyIds);
  const where: Prisma.DocumentWhereInput = { companyId: DEMO_COMPANY_ID };
  const today = new Date();
  if (first(filters.status)) where.status = first(filters.status) as Prisma.EnumDocumentStatusFilter["equals"];
  if (first(filters.categoryId)) where.categoryId = first(filters.categoryId);
  if (first(filters.terminalId)) where.terminalId = first(filters.terminalId);
  if (first(filters.assetId)) where.assetId = first(filters.assetId);
  if (first(filters.projectId)) where.projectId = first(filters.projectId);
  if (selectedAgencyIds.length) where.agencies = { some: { agencyId: { in: selectedAgencyIds } } };
  if (first(filters.validity) === "expired") where.expirationDate = { lt: today };
  if (first(filters.validity) === "next90") where.expirationDate = { gte: today, lte: addDays(today, 90) };
  const query = first(filters.q);
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { code: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { tags: { contains: query, mode: "insensitive" } }
    ];
  }
  const [documents, categories, terminals, assets, projects, agencies] = await Promise.all([
    prisma.document.findMany({ where, include: { category: true, terminal: true, asset: true, project: true, agencies: { include: { agency: true } }, currentVersion: true }, orderBy: { updatedAt: "desc" } }),
    prisma.documentCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.terminal.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { name: "asc" } }),
    prisma.asset.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { code: "asc" } }),
    prisma.project.findMany({ where: { companyId: DEMO_COMPANY_ID }, orderBy: { name: "asc" } }),
    prisma.regulatoryAgency.findMany({ orderBy: { name: "asc" } })
  ]);
  return (
    <>
      <PageHeader title="Documentos" description="Biblioteca técnica para localizar, revisar e separar documentos por órgãos de destino." action={<Button href="/documents/new">Novo documento</Button>} />
      <Card className="mb-5">
        <form className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Field label="Busca"><Input name="q" defaultValue={first(filters.q) ?? ""} placeholder="título, código ou tag" /></Field>
          <Field label="Status"><Select name="status" defaultValue={first(filters.status) ?? ""}><option value="">Todos</option>{documentStatusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
          <Field label="Categoria"><Select name="categoryId" defaultValue={first(filters.categoryId) ?? ""}><option value="">Todas</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
          <Field label="Terminal"><Select name="terminalId" defaultValue={first(filters.terminalId) ?? ""}><option value="">Todos</option>{terminals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
          <Field label="Validade"><Select name="validity" defaultValue={first(filters.validity) ?? ""}><option value="">Todas</option><option value="expired">Vencidos</option><option value="next90">A vencer 90 dias</option></Select></Field>
          <Field label="Ativo"><Select name="assetId" defaultValue={first(filters.assetId) ?? ""}><option value="">Todos</option>{assets.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</Select></Field>
          </div>
          <details className="rounded-md border bg-white p-3">
            <summary className="cursor-pointer text-sm font-medium text-slate-700">Órgãos de destino</summary>
            <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-4">
              {agencies.map((agency) => (
                <label key={agency.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <input name="agencyIds" type="checkbox" value={agency.id} defaultChecked={selectedAgencyIds.includes(agency.id)} />
                  {agency.name}
                </label>
              ))}
            </div>
          </details>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary">Filtrar</Button>
            <Button href="/documents" variant="ghost">Limpar</Button>
          </div>
        </form>
      </Card>
      <DataTable>
        <thead><tr><Th>Documento</Th><Th>Vínculos</Th><Th>Órgãos</Th><Th>Validade</Th><Th>Versão</Th><Th>Status</Th></tr></thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <Td><Link className="font-medium text-cyan-800" href={`/documents/${document.id}`}>{document.title}</Link><p className="text-xs text-muted-foreground">{document.code ?? document.documentType} · {document.category.name}</p></Td>
              <Td>{document.terminal?.name ?? "-"}<p className="text-xs text-muted-foreground">{[document.asset?.code, document.project?.name].filter(Boolean).join(" · ")}</p></Td>
              <Td><div className="flex flex-wrap gap-1">{document.agencies.length ? document.agencies.map((item) => <span key={item.id} className="rounded-full bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-800">{item.agency.name}</span>) : <span className="text-slate-500">-</span>}</div></Td>
              <Td>{formatDate(document.expirationDate)}</Td>
              <Td>{document.currentVersion ? `v${document.currentVersion.versionNumber} / ${document.revision}` : "Sem arquivo"}</Td>
              <Td><Badge value={document.status} /></Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
