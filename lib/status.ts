import { addDays, isAfter, isBefore, isEqual, startOfDay } from "date-fns";
import type { DocumentStatus } from "@prisma/client";

export function getValidityStatus(
  expirationDate: Date | string | null | undefined,
  manualStatus: DocumentStatus = "vigente"
): DocumentStatus {
  if (!expirationDate) return manualStatus;
  const today = startOfDay(new Date());
  const expiration = startOfDay(new Date(expirationDate));
  if (isBefore(expiration, today)) return "vencido";
  const in30 = addDays(today, 30);
  if (isBefore(expiration, in30) || isEqual(expiration, in30)) return "a_vencer";
  return manualStatus === "vencido" || manualStatus === "a_vencer" ? "vigente" : manualStatus;
}

export function isExpiringWithin(expirationDate: Date | null | undefined, days: number) {
  if (!expirationDate) return false;
  const today = startOfDay(new Date());
  const limit = addDays(today, days);
  const expiration = startOfDay(expirationDate);
  return (isAfter(expiration, today) || isEqual(expiration, today)) && (isBefore(expiration, limit) || isEqual(expiration, limit));
}

export const statusLabels: Record<string, string> = {
  vigente: "Vigente",
  vencido: "Vencido",
  a_vencer: "A vencer",
  em_revisao: "Em revisão",
  pendente: "Pendente",
  obsoleto: "Obsoleto",
  arquivado: "Arquivado",
  ativo: "Ativo",
  inativo: "Inativo",
  em_implantacao: "Em implantação",
  em_manutencao: "Em manutenção",
  interditado: "Interditado",
  descomissionado: "Descomissionado",
  planejado: "Planejado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  suspenso: "Suspenso",
  cancelado: "Cancelado",
  rascunho: "Rascunho",
  em_preparacao: "Em preparação",
  pronto: "Pronto"
};

export const statusTone: Record<string, "green" | "red" | "amber" | "blue" | "slate"> = {
  vigente: "green",
  ativo: "green",
  concluido: "green",
  pronto: "green",
  vencido: "red",
  interditado: "red",
  cancelado: "red",
  a_vencer: "amber",
  pendente: "amber",
  em_revisao: "blue",
  em_andamento: "blue",
  em_preparacao: "blue",
  obsoleto: "slate",
  arquivado: "slate",
  inativo: "slate",
  descomissionado: "slate",
  planejado: "slate",
  suspenso: "slate",
  rascunho: "slate"
};
