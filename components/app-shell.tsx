import Link from "next/link";
import Image from "next/image";
import {
  Archive,
  BellRing,
  Building2,
  ClipboardList,
  Database,
  FileText,
  FolderKanban,
  Gauge,
  ScrollText,
  Settings
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DEMO_COMPANY_ID } from "@/lib/demo-context";
import { DatabaseOffline } from "@/components/database-offline";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/terminals", label: "Terminais", icon: Building2 },
  { href: "/assets", label: "Ativos", icon: Database },
  { href: "/projects", label: "Projetos", icon: FolderKanban },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/expirations", label: "Vencimentos", icon: BellRing },
  { href: "/dossiers", label: "Dossiês", icon: Archive },
  { href: "/audit-logs", label: "Logs", icon: ScrollText },
  { href: "/settings", label: "Configurações", icon: Settings }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  let company;
  try {
    company = await prisma.company.findUnique({ where: { id: DEMO_COMPANY_ID } });
  } catch (error) {
    return <DatabaseOffline detail={error instanceof Error ? error.message : "Falha ao conectar ao banco."} />;
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-slate-950 text-white lg:block">
        <div className="flex h-20 items-center border-b border-white/10 px-5">
          <Image
            src="/brand/ndocs-logo-horizontal-dark.png"
            alt="NDOCS"
            width={176}
            height={96}
            className="h-14 w-auto object-contain"
            priority
          />
        </div>
        <nav className="grid gap-1 p-3">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-slate-900">{company?.name ?? "NTN Engenharia Demo"}</p>
            <p className="text-xs text-muted-foreground">MVP sem autenticação - contexto demo ativo</p>
          </div>
          <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-600">Administrador Demo</div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
