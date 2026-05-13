"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  AssetStatus,
  AssetType,
  DocumentStatus,
  DossierStatus,
  DossierType,
  InstallationType,
  ProjectDiscipline,
  ProjectStatus,
  TerminalStatus
} from "@prisma/client";
import { createAuditLog } from "@/lib/audit";
import { getCurrentDemoContext } from "@/lib/demo-context";
import { optionalFloat, optionalString, toDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { saveLocalFile } from "@/lib/storage/local-storage";
import { getValidityStatus } from "@/lib/status";

function stringValue(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function emptyToNull(value?: string) {
  return value && value.length ? value : null;
}

function stringArray(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export async function upsertTerminal(formData: FormData) {
  const { currentCompanyId, currentUserId } = await getCurrentDemoContext();
  const id = optionalString(formData.get("id"));
  const data = {
    companyId: currentCompanyId,
    name: stringValue(formData, "name"),
    code: emptyToNull(optionalString(formData.get("code"))),
    description: emptyToNull(optionalString(formData.get("description"))),
    address: emptyToNull(optionalString(formData.get("address"))),
    city: emptyToNull(optionalString(formData.get("city"))),
    state: emptyToNull(optionalString(formData.get("state"))),
    country: stringValue(formData, "country", "Brasil"),
    installationType: stringValue(formData, "installationType", "terminal_combustiveis") as InstallationType,
    totalCapacityM3: optionalFloat(formData.get("totalCapacityM3")),
    mainProducts: emptyToNull(optionalString(formData.get("mainProducts"))),
    responsibleEngineer: emptyToNull(optionalString(formData.get("responsibleEngineer"))),
    status: stringValue(formData, "status", "ativo") as TerminalStatus,
    updatedBy: currentUserId
  };
  const terminal = id
    ? await prisma.terminal.update({ where: { id, companyId: currentCompanyId }, data })
    : await prisma.terminal.create({ data: { ...data, createdBy: currentUserId } });
  await createAuditLog({
    entityType: "Terminal",
    entityId: terminal.id,
    action: id ? "update" : "create",
    description: `${id ? "Editou" : "Criou"} o terminal ${terminal.name}`
  });
  revalidatePath("/terminals");
  redirect(`/terminals/${terminal.id}`);
}

export async function upsertAsset(formData: FormData) {
  const { currentCompanyId, currentUserId } = await getCurrentDemoContext();
  const id = optionalString(formData.get("id"));
  const data = {
    companyId: currentCompanyId,
    terminalId: stringValue(formData, "terminalId"),
    code: stringValue(formData, "code"),
    name: stringValue(formData, "name"),
    type: stringValue(formData, "type", "tanque") as AssetType,
    description: emptyToNull(optionalString(formData.get("description"))),
    status: stringValue(formData, "status", "ativo") as AssetStatus,
    product: emptyToNull(optionalString(formData.get("product"))),
    capacityM3: optionalFloat(formData.get("capacityM3")),
    location: emptyToNull(optionalString(formData.get("location"))),
    designStandard: emptyToNull(optionalString(formData.get("designStandard"))),
    commissioningDate: toDate(formData.get("commissioningDate")),
    lastInspectionDate: toDate(formData.get("lastInspectionDate")),
    nextInspectionDate: toDate(formData.get("nextInspectionDate")),
    updatedBy: currentUserId
  };
  const asset = id
    ? await prisma.asset.update({ where: { id, companyId: currentCompanyId }, data })
    : await prisma.asset.create({ data: { ...data, createdBy: currentUserId } });
  await createAuditLog({
    entityType: "Asset",
    entityId: asset.id,
    action: id ? "update" : "create",
    description: `${id ? "Editou" : "Criou"} o ativo ${asset.code} - ${asset.name}`
  });
  revalidatePath("/assets");
  redirect(`/assets/${asset.id}`);
}

export async function upsertProject(formData: FormData) {
  const { currentCompanyId, currentUserId } = await getCurrentDemoContext();
  const id = optionalString(formData.get("id"));
  const data = {
    companyId: currentCompanyId,
    terminalId: stringValue(formData, "terminalId"),
    name: stringValue(formData, "name"),
    code: emptyToNull(optionalString(formData.get("code"))),
    description: emptyToNull(optionalString(formData.get("description"))),
    discipline: stringValue(formData, "discipline", "multidisciplinar") as ProjectDiscipline,
    status: stringValue(formData, "status", "planejado") as ProjectStatus,
    startDate: toDate(formData.get("startDate")),
    endDate: toDate(formData.get("endDate")),
    responsible: emptyToNull(optionalString(formData.get("responsible"))),
    updatedBy: currentUserId
  };
  const project = id
    ? await prisma.project.update({ where: { id, companyId: currentCompanyId }, data })
    : await prisma.project.create({ data: { ...data, createdBy: currentUserId } });
  await createAuditLog({
    entityType: "Project",
    entityId: project.id,
    action: id ? "update" : "create",
    description: `${id ? "Editou" : "Criou"} o projeto ${project.name}`
  });
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function upsertDocument(formData: FormData) {
  const { currentCompanyId, currentUserId } = await getCurrentDemoContext();
  const id = optionalString(formData.get("id"));
  const file = formData.get("file");
  const expirationDate = toDate(formData.get("expirationDate"));
  const manualStatus = stringValue(formData, "status", file instanceof File && file.size > 0 ? "vigente" : "pendente") as DocumentStatus;
  const data = {
    companyId: currentCompanyId,
    terminalId: emptyToNull(optionalString(formData.get("terminalId"))),
    assetId: emptyToNull(optionalString(formData.get("assetId"))),
    projectId: emptyToNull(optionalString(formData.get("projectId"))),
    categoryId: stringValue(formData, "categoryId"),
    standardId: emptyToNull(optionalString(formData.get("standardId"))),
    title: stringValue(formData, "title"),
    code: emptyToNull(optionalString(formData.get("code"))),
    description: emptyToNull(optionalString(formData.get("description"))),
    documentType: emptyToNull(optionalString(formData.get("documentType"))),
    status: getValidityStatus(expirationDate, manualStatus),
    revision: stringValue(formData, "revision", "R0"),
    issueDate: toDate(formData.get("issueDate")),
    expirationDate,
    responsible: emptyToNull(optionalString(formData.get("responsible"))),
    tags: emptyToNull(optionalString(formData.get("tags"))),
    updatedBy: currentUserId
  };
  const document = id
    ? await prisma.document.update({ where: { id, companyId: currentCompanyId }, data })
    : await prisma.document.create({ data: { ...data, createdBy: currentUserId } });

  const agencyIds = stringArray(formData, "agencyIds");
  await prisma.documentAgency.deleteMany({ where: { documentId: document.id } });
  if (agencyIds.length) {
    await prisma.documentAgency.createMany({
      data: agencyIds.map((agencyId) => ({ documentId: document.id, agencyId })),
      skipDuplicates: true
    });
  }

  if (file instanceof File && file.size > 0) {
    await createDocumentVersion(document.id, file, data.revision, optionalString(formData.get("versionNotes")));
  }

  await createAuditLog({
    entityType: "Document",
    entityId: document.id,
    action: id ? "update" : "create",
    description: `${id ? "Atualizou" : "Criou"} o documento ${document.title}`
  });
  revalidatePath("/documents");
  redirect(`/documents/${document.id}`);
}

async function createDocumentVersion(documentId: string, file: File, revision: string, notes?: string) {
  const { currentCompanyId, currentUserId } = await getCurrentDemoContext();
  const document = await prisma.document.findFirst({
    where: { id: documentId, companyId: currentCompanyId },
    include: { versions: true }
  });
  if (!document) throw new Error("Documento não encontrado");
  const stored = await saveLocalFile(file, documentId);
  const nextNumber = document.versions.length + 1;
  await prisma.documentVersion.updateMany({
    where: { documentId },
    data: { isCurrent: false }
  });
  const version = await prisma.documentVersion.create({
    data: {
      documentId,
      versionNumber: nextNumber,
      revision,
      ...stored,
      notes,
      isCurrent: true,
      uploadedBy: currentUserId
    }
  });
  await prisma.document.update({
    where: { id: documentId },
    data: {
      currentVersionId: version.id,
      revision,
      status: getValidityStatus(document.expirationDate, "vigente"),
      updatedBy: currentUserId
    }
  });
  await createAuditLog({
    entityType: "Document",
    entityId: documentId,
    action: "upload_version",
    description: `Enviou a versão ${nextNumber} do documento ${document.title}`,
    metadata: { versionId: version.id, fileName: stored.originalFileName }
  });
}

export async function addDocumentVersion(formData: FormData) {
  const documentId = stringValue(formData, "documentId");
  const revision = stringValue(formData, "revision", "R0");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Arquivo obrigatório");
  await createDocumentVersion(documentId, file, revision, optionalString(formData.get("notes")));
  revalidatePath(`/documents/${documentId}`);
  redirect(`/documents/${documentId}`);
}

export async function upsertDossier(formData: FormData) {
  const { currentCompanyId, currentUserId } = await getCurrentDemoContext();
  const id = optionalString(formData.get("id"));
  const selectedDocuments = formData.getAll("documentIds").filter((value): value is string => typeof value === "string" && value.length > 0);
  const data = {
    companyId: currentCompanyId,
    terminalId: emptyToNull(optionalString(formData.get("terminalId"))),
    name: stringValue(formData, "name"),
    description: emptyToNull(optionalString(formData.get("description"))),
    type: stringValue(formData, "type", "auditoria") as DossierType,
    status: stringValue(formData, "status", "rascunho") as DossierStatus,
    updatedBy: currentUserId
  };
  const dossier = id
    ? await prisma.dossier.update({ where: { id, companyId: currentCompanyId }, data })
    : await prisma.dossier.create({ data: { ...data, createdBy: currentUserId } });
  await prisma.dossierDocument.deleteMany({ where: { dossierId: dossier.id } });
  if (selectedDocuments.length) {
    await prisma.dossierDocument.createMany({
      data: selectedDocuments.map((documentId, index) => ({
        dossierId: dossier.id,
        documentId,
        order: index + 1
      })),
      skipDuplicates: true
    });
  }
  await createAuditLog({
    entityType: "Dossier",
    entityId: dossier.id,
    action: id ? "update" : "create",
    description: `${id ? "Atualizou" : "Criou"} o dossiê ${dossier.name}`
  });
  revalidatePath("/dossiers");
  redirect(`/dossiers/${dossier.id}`);
}

export async function upsertCategory(formData: FormData) {
  const { currentCompanyId } = await getCurrentDemoContext();
  const id = optionalString(formData.get("id"));
  const data = {
    companyId: currentCompanyId,
    name: stringValue(formData, "name"),
    description: emptyToNull(optionalString(formData.get("description"))),
    color: emptyToNull(optionalString(formData.get("color")))
  };
  if (id) await prisma.documentCategory.update({ where: { id }, data });
  else await prisma.documentCategory.create({ data });
  revalidatePath("/settings");
}

export async function upsertAgency(formData: FormData) {
  const id = optionalString(formData.get("id"));
  const data = {
    name: stringValue(formData, "name"),
    description: emptyToNull(optionalString(formData.get("description")))
  };
  if (id) await prisma.regulatoryAgency.update({ where: { id }, data });
  else await prisma.regulatoryAgency.create({ data });
  revalidatePath("/settings");
}

export async function upsertStandard(formData: FormData) {
  const id = optionalString(formData.get("id"));
  const data = {
    code: stringValue(formData, "code"),
    name: stringValue(formData, "name"),
    description: emptyToNull(optionalString(formData.get("description")))
  };
  if (id) await prisma.referenceStandard.update({ where: { id }, data });
  else await prisma.referenceStandard.create({ data });
  revalidatePath("/settings");
}
