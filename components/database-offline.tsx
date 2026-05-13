import { Database, Terminal } from "lucide-react";

export function DatabaseOffline({ detail }: { detail?: string }) {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/5 p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="rounded-md bg-cyan-400/10 p-3 text-cyan-200">
            <Database className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Banco de dados indisponível</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              O NDOCS está configurado para usar PostgreSQL em <code className="rounded bg-black/30 px-1">localhost:5432</code>, mas o Prisma não conseguiu conectar. Suba o banco, aplique a migration e rode o seed demo.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-md bg-black/30 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-100">
            <Terminal className="h-4 w-4" />
            Comandos
          </div>
          <pre className="overflow-x-auto text-sm leading-6 text-slate-100">{`docker compose up -d
npm run prisma:migrate
npm run prisma:seed
npm run dev`}</pre>
        </div>
        {detail ? <p className="mt-4 text-xs text-slate-400">{detail}</p> : null}
      </div>
    </div>
  );
}
