import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(value));
}

export function formatNumber(value?: number | null, suffix = "") {
  if (value === null || value === undefined) return "-";
  return `${new Intl.NumberFormat("pt-BR").format(value)}${suffix}`;
}

export function toDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return null;
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

export function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export function optionalFloat(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}
