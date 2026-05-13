import { cn } from "@/lib/utils";
import { statusLabels, statusTone } from "@/lib/status";

const tones = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  red: "border-red-200 bg-red-50 text-red-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
  slate: "border-slate-200 bg-slate-100 text-slate-700"
};

export function Badge({ value, className }: { value?: string | null; className?: string }) {
  const key = value ?? "pendente";
  const tone = statusTone[key] ?? "slate";
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone], className)}>
      {statusLabels[key] ?? key}
    </span>
  );
}
