import Link from "next/link";
import { addDays } from "date-fns";
import { BarChart3, BellRing, Building2, Database, FileText, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { CategoryBarChart, StatusPieChart } from "@/components/dashboard-charts";
import { Td, Th, DataTable } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const today = new Date();
  const [terminals, assets, projects, documents, categories, statuses, criticalDocuments] = await Promise.all([
    prisma.terminal.count({ where: { companyId: DEMO_COMPANY_ID } }),
    prisma.asset.count({ where: { companyId: DEMO_COMPANY_ID } }),
    prisma.project.count({ where: { companyId: DEMO_COMPANY_ID } }),
    prisma.document.count({ where: { companyId: DEMO_COMPANY_ID } }),
    prisma.document.groupBy({ by: ["categoryId"], where: { companyId: DEMO_COMPANY_ID }, _count: true }),
    prisma.document.groupBy({ by: ["status"], where: { companyId: DEMO_COMPANY_ID }, _count: true }),
    prisma.document.findMany({
      where: {
        companyId: DEMO_COMPANY_ID,
        OR: [
          { expirationDate: { lt: today } },
          { expirationDate: { gte: today, lte: addDays(today, 30) } }
        ]
      },
      include: { category: true, terminal: true },
      orderBy: { expirationDate: "asc" },
      take: 8
    })
  ]);

  const categoryMap = new Map((await prisma.documentCategory.findMany()).map((item) => [item.id, item.name]));
  const expired = criticalDocuments.filter((item) => item.expirationDate && item.expirationDate < today).length;
  const exp30 = await prisma.document.count({ where: { companyId: DEMO_COMPANY_ID, expirationDate: { gte: today, lte: addDays(today, 30) } } });
  const exp60 = await prisma.document.count({ where: { companyId: DEMO_COMPANY_ID, expirationDate: { gte: today, lte: addDays(today, 60) } } });
  const exp90 = await prisma.document.count({ where: { companyId: DEMO_COMPANY_ID, expirationDate: { gte: today, lte: addDays(today, 90) } } });
  const terminalCompliance = await prisma.terminal.findMany({
    where: { companyId: DEMO_COMPANY_ID },
    include: { documents: true }
  });

  const cards = [
    { label: "Terminais", value: terminals, icon: Building2 },
    { label: "Ativos", value: assets, icon: Database },
    { label: "Projetos", value: projects, icon: FolderKanban },
    { label: "Documentos", value: documents, icon: FileText },
    { label: "Vencidos", value: expired, icon: BellRing },
    { label: "A vencer 30/60/90", value: `${exp30}/${exp60}/${exp90}`, icon: BarChart3 }
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Visão executiva de documentação, ativos e conformidade dos terminais." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {cards.map((card) => (
          <Card key={card.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold">{card.value}</p>
              </div>
              <card.icon className="h-8 w-8 text-cyan-700" />
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Documentos críticos" description="Vencidos e a vencer nos próximos 30 dias." />
          <DataTable>
            <thead><tr><Th>Documento</Th><Th>Terminal</Th><Th>Categoria</Th><Th>Validade</Th><Th>Status</Th></tr></thead>
            <tbody>
              {criticalDocuments.map((document) => (
                <tr key={document.id}>
                  <Td><Link className="font-medium text-cyan-800" href={`/documents/${document.id}`}>{document.title}</Link></Td>
                  <Td>{document.terminal?.name ?? "-"}</Td>
                  <Td>{document.category.name}</Td>
                  <Td>{formatDate(document.expirationDate)}</Td>
                  <Td><Badge value={document.status} /></Td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Card>
        <Card>
          <CardHeader title="Conformidade por terminal" description="Percentual simples de documentos vigentes." />
          <div className="grid gap-4">
            {terminalCompliance.map((terminal) => {
              const total = terminal.documents.length || 1;
              const ok = terminal.documents.filter((doc) => doc.status === "vigente").length;
              const percent = Math.round((ok / total) * 100);
              return (
                <div key={terminal.id}>
                  <div className="mb-1 flex justify-between text-sm"><span>{terminal.name}</span><span>{percent}%</span></div>
                  <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-cyan-700" style={{ width: `${percent}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Documentos por categoria" />
          <CategoryBarChart data={categories.map((item) => ({ name: categoryMap.get(item.categoryId) ?? "Categoria", value: item._count }))} />
        </Card>
        <Card>
          <CardHeader title="Documentos por status" />
          <StatusPieChart data={statuses.map((item) => ({ name: item.status, value: item._count }))} />
          <div className="mt-3 grid gap-2">
            {statuses.map((item) => <div key={item.status} className="flex justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"><Badge value={item.status} /><strong>{item._count}</strong></div>)}
          </div>
        </Card>
      </div>
    </>
  );
}
