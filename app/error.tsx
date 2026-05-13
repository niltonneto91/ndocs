"use client";

import { DatabaseOffline } from "@/components/database-offline";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  const isPrisma = error.name.includes("Prisma") || error.message.includes("Prisma") || error.message.includes("database");
  if (isPrisma) {
    return <DatabaseOffline detail={error.message} />;
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Erro inesperado</h1>
      <p className="mt-2 text-sm text-slate-600">{error.message}</p>
    </div>
  );
}
