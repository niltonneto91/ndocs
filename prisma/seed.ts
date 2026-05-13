import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient, type DocumentStatus } from "@prisma/client";
import { addDays, subDays } from "date-fns";
import { DEMO_COMPANY_ID, DEMO_USER_ID } from "../lib/demo-context";
import { getValidityStatus } from "../lib/status";

const prisma = new PrismaClient();
const uploadRoot = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

async function seedFile(documentId: string, title: string) {
  const dir = path.join(uploadRoot, documentId);
  await mkdir(dir, { recursive: true });
  const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
  const filePath = path.join(dir, fileName);
  const content = `NDOCS Demo\nDocumento: ${title}\nArquivo placeholder para demonstracao do controle de versoes.\n`;
  await writeFile(filePath, content);
  return {
    fileName,
    originalFileName: fileName,
    filePath: path.relative(uploadRoot, filePath),
    fileSize: Buffer.byteLength(content),
    mimeType: "text/plain"
  };
}

async function main() {
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.dossierDocument.deleteMany();
  await prisma.dossier.deleteMany();
  await prisma.document.updateMany({ data: { currentVersionId: null } });
  await prisma.documentAgency.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.project.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.terminal.deleteMany();
  await prisma.documentCategory.deleteMany();
  await prisma.referenceStandard.deleteMany();
  await prisma.regulatoryAgency.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const company = await prisma.company.create({
    data: {
      id: DEMO_COMPANY_ID,
      name: "NTN Engenharia Demo",
      legalName: "NTN Engenharia Demo Ltda.",
      cnpj: "00.000.000/0001-00"
    }
  });

  const user = await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      name: "Administrador Demo",
      email: "admin.demo@terminaldocs.local",
      role: "admin",
      companyId: company.id
    }
  });

  const categoryNames = [
    "Projetos",
    "Licenças e autorizações",
    "Corpo de Bombeiros",
    "Meio ambiente",
    "ANP",
    "Inspeção",
    "Manutenção",
    "Operação",
    "Segurança",
    "Treinamentos",
    "ARTs",
    "Certificados",
    "Contratos",
    "Relatórios fotográficos",
    "Estudos de risco",
    "Gestão de mudanças"
  ];
  const categories = new Map<string, string>();
  for (const name of categoryNames) {
    const category = await prisma.documentCategory.create({
      data: { companyId: company.id, name, color: "#0e7490" }
    });
    categories.set(name, category.id);
  }

  const agencyNames = ["ANP", "Corpo de Bombeiros", "Órgão ambiental", "Prefeitura", "Cliente", "Auditoria interna", "Outro"];
  const agencies = new Map<string, string>();
  for (const name of agencyNames) {
    const agency = await prisma.regulatoryAgency.create({ data: { name } });
    agencies.set(name, agency.id);
  }

  const standardsData = [
    ["ABNT NBR 17505", "Armazenamento de líquidos inflamáveis e combustíveis"],
    ["ABNT NBR 7821", "Tanques soldados para armazenamento de petróleo"],
    ["API 650", "Welded Tanks for Oil Storage"],
    ["API 653", "Tank Inspection, Repair, Alteration and Reconstruction"],
    ["API 2350", "Overfill Protection for Storage Tanks"],
    ["API 1104", "Welding of Pipelines"],
    ["RTDT ANP", "Regulamento técnico de dutos terrestres"],
    ["IT 25 Corpo de Bombeiros SP", "Líquidos combustíveis e inflamáveis"],
    ["Resolução ANP 817/2020", "Regulação ANP"],
    ["Resolução ANP 852/2021", "Regulação ANP"],
    ["Resolução ANP 881/2022", "Regulação ANP"]
  ];
  const standards = new Map<string, string>();
  for (const [code, name] of standardsData) {
    const standard = await prisma.referenceStandard.create({ data: { code, name } });
    standards.set(code, standard.id);
  }

  const paulinia = await prisma.terminal.create({
    data: {
      companyId: company.id,
      name: "Terminal Demo Paulínia",
      code: "TDP",
      description: "Terminal demo com tanques, plataforma de carregamento e sistema de combate a incêndio.",
      city: "Paulínia",
      state: "SP",
      installationType: "terminal_combustiveis",
      totalCapacityM3: 48000,
      mainProducts: "Diesel S10, Gasolina, Etanol",
      responsibleEngineer: "Eng. Carla Souza",
      status: "ativo",
      createdBy: user.id,
      updatedBy: user.id
    }
  });
  const santos = await prisma.terminal.create({
    data: {
      companyId: company.id,
      name: "Base Demo Santos",
      code: "BDS",
      city: "Santos",
      state: "SP",
      installationType: "base_distribuicao",
      totalCapacityM3: 22000,
      mainProducts: "Diesel, Óleo combustível",
      responsibleEngineer: "Eng. Rafael Lima",
      status: "ativo",
      createdBy: user.id,
      updatedBy: user.id
    }
  });

  const assets = await Promise.all([
    prisma.asset.create({ data: { companyId: company.id, terminalId: paulinia.id, code: "TQ-01", name: "Tanque de Diesel S10", type: "tanque", product: "Diesel S10", capacityM3: 12000, designStandard: "API 650", nextInspectionDate: addDays(new Date(), 40), createdBy: user.id, updatedBy: user.id } }),
    prisma.asset.create({ data: { companyId: company.id, terminalId: paulinia.id, code: "TQ-02", name: "Tanque de Gasolina", type: "tanque", product: "Gasolina", capacityM3: 9000, designStandard: "API 650", nextInspectionDate: addDays(new Date(), 100), createdBy: user.id, updatedBy: user.id } }),
    prisma.asset.create({ data: { companyId: company.id, terminalId: paulinia.id, code: "BC-01", name: "Bacia de contenção principal", type: "bacia_contencao", location: "Área de tanques", createdBy: user.id, updatedBy: user.id } }),
    prisma.asset.create({ data: { companyId: company.id, terminalId: santos.id, code: "PL-01", name: "Plataforma de carregamento", type: "plataforma_carregamento", location: "Ilha 1", createdBy: user.id, updatedBy: user.id } }),
    prisma.asset.create({ data: { companyId: company.id, terminalId: paulinia.id, code: "SCI-01", name: "Sistema de combate a incêndio", type: "sistema_incendio", nextInspectionDate: addDays(new Date(), 15), createdBy: user.id, updatedBy: user.id } })
  ]);

  const projects = await Promise.all([
    prisma.project.create({ data: { companyId: company.id, terminalId: paulinia.id, name: "Adequação da bacia de contenção", code: "PRJ-BC-2026", discipline: "civil", status: "em_andamento", startDate: subDays(new Date(), 20), responsible: "Eng. Mariana Costa", createdBy: user.id, updatedBy: user.id } }),
    prisma.project.create({ data: { companyId: company.id, terminalId: paulinia.id, name: "Revisão do sistema de combate a incêndio", code: "PRJ-SCI-2026", discipline: "seguranca", status: "em_revisao", startDate: subDays(new Date(), 60), responsible: "Eng. Bruno Alves", createdBy: user.id, updatedBy: user.id } }),
    prisma.project.create({ data: { companyId: company.id, terminalId: paulinia.id, name: "Inspeção API 653 do TQ-01", code: "PRJ-API653-TQ01", discipline: "mecanica", status: "concluido", startDate: subDays(new Date(), 120), endDate: subDays(new Date(), 15), responsible: "Insp. Paulo Rocha", createdBy: user.id, updatedBy: user.id } })
  ]);

  const docs = [
    ["Licença de Operação", "LO-2026", "Licenças e autorizações", paulinia.id, null, null, ["Órgão ambiental", "ANP"], "vigente", addDays(new Date(), 140)],
    ["AVCB", "AVCB-PAU-001", "Corpo de Bombeiros", paulinia.id, assets[4].id, projects[1].id, ["Corpo de Bombeiros", "Auditoria interna"], "a_vencer", addDays(new Date(), 22)],
    ["Relatório de Inspeção API 653 - TQ-01", "API653-TQ01", "Inspeção", paulinia.id, assets[0].id, projects[2].id, ["Auditoria interna", "Cliente"], "vigente", addDays(new Date(), 360)],
    ["ART de projeto mecânico", "ART-MEC-001", "ARTs", paulinia.id, assets[0].id, projects[2].id, ["Cliente"], "vigente", null],
    ["Planta de arranjo geral", "PL-ARR-GER-R3", "Projetos", paulinia.id, null, projects[0].id, ["Cliente", "Prefeitura"], "vigente", null],
    ["Memorial descritivo", "MD-BC-001", "Projetos", paulinia.id, assets[2].id, projects[0].id, ["Cliente"], "em_revisao", null],
    ["Estudo de análise de risco", "EAR-001", "Estudos de risco", santos.id, null, null, ["Cliente", "Auditoria interna"], "vencido", subDays(new Date(), 12)],
    ["Plano de atendimento a emergência", "PAE-2025", "Segurança", paulinia.id, assets[4].id, null, ["Corpo de Bombeiros", "Órgão ambiental"], "a_vencer", addDays(new Date(), 55)],
    ["Certificado de calibração de instrumento de nível", "CERT-NIVEL-01", "Certificados", paulinia.id, assets[0].id, null, ["Auditoria interna"], "vencido", subDays(new Date(), 40)],
    ["Relatório fotográfico de manutenção", "RF-MAN-PL01", "Relatórios fotográficos", santos.id, assets[3].id, null, [], "vigente", addDays(new Date(), 250)]
  ] as const;

  const createdDocuments = [];
  for (const [title, code, categoryName, terminalId, assetId, projectId, agencyNames, manualStatus, expirationDate] of docs) {
    const status = getValidityStatus(expirationDate, manualStatus as DocumentStatus);
    const document = await prisma.document.create({
      data: {
        companyId: company.id,
        terminalId,
        assetId,
        projectId,
        categoryId: categories.get(categoryName)!,
        standardId: title.includes("API 653") ? standards.get("API 653") : title.includes("Tanque") ? standards.get("API 650") : null,
        title,
        code,
        description: `Documento demo para ${title}.`,
        documentType: categoryName,
        status,
        revision: "R0",
        issueDate: subDays(new Date(), 90),
        expirationDate,
        responsible: "Equipe técnica NTN",
        tags: `${categoryName.toLowerCase()}, demo, terminal`,
        createdBy: user.id,
        updatedBy: user.id
      }
    });
    const agencyLinks = agencyNames
      .map((agencyName) => agencies.get(agencyName))
      .filter((agencyId): agencyId is string => Boolean(agencyId))
      .map((agencyId) => ({ documentId: document.id, agencyId }));
    if (agencyLinks.length) {
      await prisma.documentAgency.createMany({ data: agencyLinks, skipDuplicates: true });
    }
    const stored = await seedFile(document.id, title);
    const version = await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        versionNumber: 1,
        revision: "R0",
        ...stored,
        notes: "Versão demo seedada.",
        isCurrent: true,
        uploadedBy: user.id
      }
    });
    await prisma.document.update({ where: { id: document.id }, data: { currentVersionId: version.id } });
    createdDocuments.push(document);
  }

  const dossier = await prisma.dossier.create({
    data: {
      companyId: company.id,
      terminalId: paulinia.id,
      name: "Dossiê ANP - Terminal Demo Paulínia",
      description: "Pacote inicial com documentos regulatórios e técnicos do terminal.",
      type: "anp",
      status: "em_preparacao",
      createdBy: user.id,
      updatedBy: user.id
    }
  });
  await prisma.dossierDocument.createMany({
    data: createdDocuments.slice(0, 5).map((document, index) => ({ dossierId: dossier.id, documentId: document.id, order: index + 1 }))
  });

  for (const document of createdDocuments.filter((item) => item.status === "vencido" || item.status === "a_vencer")) {
    await prisma.notification.create({
      data: {
        companyId: company.id,
        documentId: document.id,
        userId: user.id,
        type: "expiration",
        title: `Validade: ${document.title}`,
        message: `Documento com status ${document.status}.`,
        dueDate: document.expirationDate
      }
    });
  }

  await prisma.auditLog.createMany({
    data: [
      { companyId: company.id, userId: user.id, entityType: "Terminal", entityId: paulinia.id, action: "create", description: "Criou o terminal Terminal Demo Paulínia" },
      { companyId: company.id, userId: user.id, entityType: "Terminal", entityId: santos.id, action: "create", description: "Criou o terminal Base Demo Santos" },
      { companyId: company.id, userId: user.id, entityType: "Dossier", entityId: dossier.id, action: "create", description: "Criou o dossiê ANP demo" }
    ]
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
