"use client";

import { useMemo, useState } from "react";
import type { Asset, Document, DocumentCategory, Project, RegulatoryAgency, ReferenceStandard, Terminal } from "@prisma/client";
import { CheckCircle2, ChevronLeft, ChevronRight, FileUp, Link2, Send, ClipboardCheck } from "lucide-react";
import { upsertDocument } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { documentStatusOptions } from "@/lib/options";
import { cn } from "@/lib/utils";

type DocumentWizardProps = {
  document?: Document | null;
  terminals: Terminal[];
  assets: Asset[];
  projects: Project[];
  categories: DocumentCategory[];
  agencies: RegulatoryAgency[];
  standards: ReferenceStandard[];
  selectedAgencyIds?: string[];
  defaults?: {
    terminalId?: string;
    assetId?: string;
    projectId?: string;
  };
};

const steps = [
  { title: "Arquivo e identificação", icon: FileUp },
  { title: "Vínculos técnicos", icon: Link2 },
  { title: "Órgãos e validade", icon: Send },
  { title: "Resumo", icon: ClipboardCheck }
];

export function DocumentWizard({
  document,
  terminals,
  assets,
  projects,
  categories,
  agencies,
  standards,
  selectedAgencyIds = [],
  defaults
}: DocumentWizardProps) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(document?.title ?? "");
  const [code, setCode] = useState(document?.code ?? "");
  const [revision, setRevision] = useState(document?.revision ?? "R0");
  const [categoryId, setCategoryId] = useState(document?.categoryId ?? "");
  const [terminalId, setTerminalId] = useState(document?.terminalId ?? defaults?.terminalId ?? "");
  const [assetId, setAssetId] = useState(document?.assetId ?? defaults?.assetId ?? "");
  const [projectId, setProjectId] = useState(document?.projectId ?? defaults?.projectId ?? "");
  const [standardId, setStandardId] = useState(document?.standardId ?? "");
  const [status, setStatus] = useState<string>(document?.status ?? "vigente");
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(selectedAgencyIds);

  const labels = useMemo(() => {
    return {
      category: categories.find((item) => item.id === categoryId)?.name ?? "Sem categoria",
      terminal: terminals.find((item) => item.id === terminalId)?.name ?? "Sem terminal",
      asset: assets.find((item) => item.id === assetId)?.name ?? "Sem ativo",
      project: projects.find((item) => item.id === projectId)?.name ?? "Sem projeto",
      standard: standards.find((item) => item.id === standardId)?.code ?? "Sem norma",
      agencies: agencies.filter((item) => selectedAgencies.includes(item.id)).map((item) => item.name)
    };
  }, [agencies, assets, categories, categoryId, assetId, projectId, projects, selectedAgencies, standardId, standards, terminalId, terminals]);

  function toggleAgency(id: string) {
    setSelectedAgencies((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <Card className="p-0">
      <div className="border-b p-5">
        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setStep(index)}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-3 text-left text-sm transition",
                step === index ? "border-cyan-700 bg-cyan-50 text-cyan-900" : "bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="font-medium">{index + 1}. {item.title}</span>
            </button>
          ))}
        </div>
      </div>
      <form action={upsertDocument} className="grid gap-0">
        {document ? <input type="hidden" name="id" value={document.id} /> : null}
        <section className={cn("grid gap-5 p-5", step !== 0 && "hidden")}>
          <CardHeader title="Arquivo e identificação" description="Comece pelo mínimo necessário para rastrear o documento." />
          <Field label={document ? "Arquivo para nova versão opcional" : "Arquivo inicial opcional"}><Input name="file" type="file" /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Título"><Input required name="title" value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
            <Field label="Código"><Input name="code" value={code} onChange={(event) => setCode(event.target.value)} /></Field>
            <Field label="Revisão"><Input name="revision" value={revision} onChange={(event) => setRevision(event.target.value)} /></Field>
            <Field label="Categoria">
              <Select required name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                <option value="">Selecione</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Notas da versão"><Input name="versionNotes" /></Field>
        </section>

        <section className={cn("grid gap-5 p-5", step !== 1 && "hidden")}>
          <CardHeader title="Vínculos técnicos" description="Conecte o documento ao terminal, ativo, projeto e norma." />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Terminal">
              <Select name="terminalId" value={terminalId} onChange={(event) => setTerminalId(event.target.value)}>
                <option value="">Nenhum</option>
                {terminals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            <Field label="Ativo">
              <Select name="assetId" value={assetId} onChange={(event) => setAssetId(event.target.value)}>
                <option value="">Nenhum</option>
                {assets.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
              </Select>
            </Field>
            <Field label="Projeto">
              <Select name="projectId" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
                <option value="">Nenhum</option>
                {projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </Field>
            <Field label="Norma de referência">
              <Select name="standardId" value={standardId} onChange={(event) => setStandardId(event.target.value)}>
                <option value="">Nenhuma</option>
                {standards.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
              </Select>
            </Field>
            <Field label="Tipo documental"><Input name="documentType" defaultValue={document?.documentType ?? ""} /></Field>
            <Field label="Tags"><Input name="tags" defaultValue={document?.tags ?? ""} placeholder="licença, ambiental, tanque" /></Field>
          </div>
          <Field label="Descrição"><Textarea name="description" defaultValue={document?.description ?? ""} /></Field>
        </section>

        <section className={cn("grid gap-5 p-5", step !== 2 && "hidden")}>
          <CardHeader title="Órgãos e validade" description="Selecione todos os destinos previstos para envio ou referência regulatória." />
          <div className="grid gap-2">
            <p className="text-sm font-medium text-slate-700">Órgãos de destino</p>
            <div className="grid gap-2 rounded-md border bg-white p-3 md:grid-cols-2 xl:grid-cols-3">
              {agencies.map((agency) => (
                <label key={agency.id} className={cn("flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm", selectedAgencies.includes(agency.id) ? "border-cyan-700 bg-cyan-50 text-cyan-900" : "border-slate-200")}>
                  <input
                    name="agencyIds"
                    type="checkbox"
                    value={agency.id}
                    checked={selectedAgencies.includes(agency.id)}
                    onChange={() => toggleAgency(agency.id)}
                  />
                  {agency.name}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Emissão"><Input name="issueDate" type="date" defaultValue={document?.issueDate?.toISOString().slice(0, 10) ?? ""} /></Field>
            <Field label="Validade"><Input name="expirationDate" type="date" defaultValue={document?.expirationDate?.toISOString().slice(0, 10) ?? ""} /></Field>
            <Field label="Responsável"><Input name="responsible" defaultValue={document?.responsible ?? ""} /></Field>
            <Field label="Status manual">
              <Select name="status" value={status} onChange={(event) => setStatus(event.target.value)}>
                {documentStatusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
            </Field>
          </div>
        </section>

        <section className={cn("grid gap-5 p-5", step !== 3 && "hidden")}>
          <CardHeader title="Resumo" description="Confira os dados principais antes de salvar." />
          <div className="grid gap-3 rounded-md border bg-slate-50 p-4 text-sm md:grid-cols-2">
            <p><span className="text-muted-foreground">Documento:</span> <strong>{title || "Sem título"}</strong></p>
            <p><span className="text-muted-foreground">Código/revisão:</span> {code || "-"} / {revision}</p>
            <p><span className="text-muted-foreground">Categoria:</span> {labels.category}</p>
            <p><span className="text-muted-foreground">Status:</span> <Badge value={status} /></p>
            <p><span className="text-muted-foreground">Terminal:</span> {labels.terminal}</p>
            <p><span className="text-muted-foreground">Ativo:</span> {labels.asset}</p>
            <p><span className="text-muted-foreground">Projeto:</span> {labels.project}</p>
            <p><span className="text-muted-foreground">Norma:</span> {labels.standard}</p>
            <div className="md:col-span-2">
              <span className="text-muted-foreground">Órgãos:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {labels.agencies.length ? labels.agencies.map((name) => <span key={name} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800">{name}</span>) : <span className="text-slate-500">Nenhum órgão selecionado</span>}
              </div>
            </div>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Se nenhum arquivo for anexado, o documento poderá ser salvo como pendente e completado depois com uma versão.
          </div>
          <Button type="submit" className="w-full md:w-auto"><CheckCircle2 className="h-4 w-4" /> Salvar documento</Button>
        </section>

        <div className="flex items-center justify-between border-t bg-slate-50 p-5">
          <Button type="button" variant="secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4" /> Voltar
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>
              Próximo <ChevronRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
