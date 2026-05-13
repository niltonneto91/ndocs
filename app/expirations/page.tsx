import { addDays } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { DataTable, Td, Th } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function ExpirationsPage() {
  const today = new Date();
  const documents = await prisma.document.findMany({
    where: { companyId: DEMO_COMPANY_ID, expirationDate: { not: null } },
    include: { terminal: true, category: true, agencies: { include: { agency: true } } },
    orderBy: { expirationDate: "asc" }
  });
  const buckets = [
    { label: "Vencidos", count: documents.filter((doc) => doc.expirationDate && doc.expirationDate < today).length },
    { label: "A vencer 30 dias", count: documents.filter((doc) => doc.expirationDate && doc.expirationDate >= today && doc.expirationDate <= addDays(today, 30)).length },
    { label: "A vencer 60 dias", count: documents.filter((doc) => doc.expirationDate && doc.expirationDate >= today && doc.expirationDate <= addDays(today, 60)).length },
    { label: "A vencer 90 dias", count: documents.filter((doc) => doc.expirationDate && doc.expirationDate >= today && doc.expirationDate <= addDays(today, 90)).length }
  ];
  return (
    <>
      <PageHeader title="Vencimentos" description="Painel de validade documental para licenças, laudos, certificados, ARTs e evidências." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">{buckets.map((item) => <Card key={item.label}><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-semibold">{item.count}</p></Card>)}</div>
      <Card>
        <CardHeader title="Agenda de validade" />
        <DataTable>
          <thead><tr><Th>Documento</Th><Th>Terminal</Th><Th>Categoria</Th><Th>Órgão</Th><Th>Validade</Th><Th>Status</Th></tr></thead>
          <tbody>{documents.map((document) => <tr key={document.id}><Td><Link className="font-medium text-cyan-800" href={`/documents/${document.id}`}>{document.title}</Link></Td><Td>{document.terminal?.name ?? "-"}</Td><Td>{document.category.name}</Td><Td><div className="flex flex-wrap gap-1">{document.agencies.length ? document.agencies.map((item) => <span key={item.id} className="rounded-full bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-800">{item.agency.name}</span>) : "-"}</div></Td><Td>{formatDate(document.expirationDate)}</Td><Td><Badge value={document.status} /></Td></tr>)}</tbody>
        </DataTable>
      </Card>
    </>
  );
}
