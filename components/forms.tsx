import type {
  Asset,
  Document,
  Dossier,
  Project,
  Terminal
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { assetTypeOptions, disciplineOptions, dossierTypeOptions } from "@/lib/options";
import { upsertAsset, upsertDossier, upsertProject, upsertTerminal } from "@/lib/actions";

export function TerminalForm({ terminal }: { terminal?: Terminal | null }) {
  return (
    <Card>
      <form action={upsertTerminal} className="grid gap-5">
        {terminal ? <input type="hidden" name="id" value={terminal.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome"><Input required name="name" defaultValue={terminal?.name ?? ""} /></Field>
          <Field label="Código"><Input name="code" defaultValue={terminal?.code ?? ""} /></Field>
          <Field label="Cidade"><Input name="city" defaultValue={terminal?.city ?? ""} /></Field>
          <Field label="UF"><Input name="state" defaultValue={terminal?.state ?? ""} /></Field>
          <Field label="País"><Input name="country" defaultValue={terminal?.country ?? "Brasil"} /></Field>
          <Field label="Tipo de instalação">
            <Select name="installationType" defaultValue={terminal?.installationType ?? "terminal_combustiveis"}>
              <option value="terminal_combustiveis">Terminal de combustíveis</option>
              <option value="base_distribuicao">Base de distribuição</option>
              <option value="posto_avancado">Posto avançado</option>
              <option value="outro">Outro</option>
            </Select>
          </Field>
          <Field label="Capacidade total (m³)"><Input name="totalCapacityM3" type="number" step="0.01" defaultValue={terminal?.totalCapacityM3 ?? ""} /></Field>
          <Field label="Produtos principais"><Input name="mainProducts" defaultValue={terminal?.mainProducts ?? ""} /></Field>
          <Field label="Engenheiro responsável"><Input name="responsibleEngineer" defaultValue={terminal?.responsibleEngineer ?? ""} /></Field>
          <Field label="Status">
            <Select name="status" defaultValue={terminal?.status ?? "ativo"}>
              <option value="ativo">Ativo</option>
              <option value="em_implantacao">Em implantação</option>
              <option value="inativo">Inativo</option>
              <option value="arquivado">Arquivado</option>
            </Select>
          </Field>
        </div>
        <Field label="Endereço"><Input name="address" defaultValue={terminal?.address ?? ""} /></Field>
        <Field label="Descrição"><Textarea name="description" defaultValue={terminal?.description ?? ""} /></Field>
        <Button type="submit">Salvar terminal</Button>
      </form>
    </Card>
  );
}

export function AssetForm({ asset, terminals }: { asset?: Asset | null; terminals: Terminal[] }) {
  return (
    <Card>
      <form action={upsertAsset} className="grid gap-5">
        {asset ? <input type="hidden" name="id" value={asset.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Terminal">
            <Select required name="terminalId" defaultValue={asset?.terminalId ?? ""}>
              <option value="">Selecione</option>
              {terminals.map((terminal) => <option key={terminal.id} value={terminal.id}>{terminal.name}</option>)}
            </Select>
          </Field>
          <Field label="Código"><Input required name="code" defaultValue={asset?.code ?? ""} /></Field>
          <Field label="Nome"><Input required name="name" defaultValue={asset?.name ?? ""} /></Field>
          <Field label="Tipo">
            <Select name="type" defaultValue={asset?.type ?? "tanque"}>
              {assetTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={asset?.status ?? "ativo"}>
              <option value="ativo">Ativo</option>
              <option value="em_manutencao">Em manutenção</option>
              <option value="interditado">Interditado</option>
              <option value="inativo">Inativo</option>
              <option value="descomissionado">Descomissionado</option>
            </Select>
          </Field>
          <Field label="Produto"><Input name="product" defaultValue={asset?.product ?? ""} /></Field>
          <Field label="Capacidade (m³)"><Input name="capacityM3" type="number" step="0.01" defaultValue={asset?.capacityM3 ?? ""} /></Field>
          <Field label="Localização"><Input name="location" defaultValue={asset?.location ?? ""} /></Field>
          <Field label="Norma de projeto"><Input name="designStandard" defaultValue={asset?.designStandard ?? ""} /></Field>
          <Field label="Comissionamento"><Input name="commissioningDate" type="date" defaultValue={asset?.commissioningDate?.toISOString().slice(0, 10) ?? ""} /></Field>
          <Field label="Última inspeção"><Input name="lastInspectionDate" type="date" defaultValue={asset?.lastInspectionDate?.toISOString().slice(0, 10) ?? ""} /></Field>
          <Field label="Próxima inspeção"><Input name="nextInspectionDate" type="date" defaultValue={asset?.nextInspectionDate?.toISOString().slice(0, 10) ?? ""} /></Field>
        </div>
        <Field label="Descrição"><Textarea name="description" defaultValue={asset?.description ?? ""} /></Field>
        <Button type="submit">Salvar ativo</Button>
      </form>
    </Card>
  );
}

export function ProjectForm({ project, terminals }: { project?: Project | null; terminals: Terminal[] }) {
  return (
    <Card>
      <form action={upsertProject} className="grid gap-5">
        {project ? <input type="hidden" name="id" value={project.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Terminal">
            <Select required name="terminalId" defaultValue={project?.terminalId ?? ""}>
              <option value="">Selecione</option>
              {terminals.map((terminal) => <option key={terminal.id} value={terminal.id}>{terminal.name}</option>)}
            </Select>
          </Field>
          <Field label="Nome"><Input required name="name" defaultValue={project?.name ?? ""} /></Field>
          <Field label="Código"><Input name="code" defaultValue={project?.code ?? ""} /></Field>
          <Field label="Disciplina">
            <Select name="discipline" defaultValue={project?.discipline ?? "multidisciplinar"}>
              {disciplineOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={project?.status ?? "planejado"}>
              <option value="planejado">Planejado</option>
              <option value="em_andamento">Em andamento</option>
              <option value="em_revisao">Em revisão</option>
              <option value="concluido">Concluído</option>
              <option value="suspenso">Suspenso</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </Field>
          <Field label="Responsável"><Input name="responsible" defaultValue={project?.responsible ?? ""} /></Field>
          <Field label="Início"><Input name="startDate" type="date" defaultValue={project?.startDate?.toISOString().slice(0, 10) ?? ""} /></Field>
          <Field label="Fim"><Input name="endDate" type="date" defaultValue={project?.endDate?.toISOString().slice(0, 10) ?? ""} /></Field>
        </div>
        <Field label="Descrição"><Textarea name="description" defaultValue={project?.description ?? ""} /></Field>
        <Button type="submit">Salvar projeto</Button>
      </form>
    </Card>
  );
}

export function DossierForm({ dossier, terminals, documents }: { dossier?: Dossier | null; terminals: Terminal[]; documents: Document[] }) {
  return (
    <Card>
      <form action={upsertDossier} className="grid gap-5">
        {dossier ? <input type="hidden" name="id" value={dossier.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome"><Input required name="name" defaultValue={dossier?.name ?? ""} /></Field>
          <Field label="Tipo">
            <Select name="type" defaultValue={dossier?.type ?? "auditoria"}>
              {dossierTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </Field>
          <Field label="Terminal">
            <Select name="terminalId" defaultValue={dossier?.terminalId ?? ""}>
              <option value="">Todos</option>
              {terminals.map((terminal) => <option key={terminal.id} value={terminal.id}>{terminal.name}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={dossier?.status ?? "rascunho"}>
              <option value="rascunho">Rascunho</option>
              <option value="em_preparacao">Em preparação</option>
              <option value="pronto">Pronto</option>
              <option value="arquivado">Arquivado</option>
            </Select>
          </Field>
        </div>
        <Field label="Descrição"><Textarea name="description" defaultValue={dossier?.description ?? ""} /></Field>
        <div className="grid gap-2">
          <p className="text-sm font-medium text-slate-700">Documentos do dossiê</p>
          <div className="grid max-h-72 gap-2 overflow-auto rounded-md border bg-white p-3">
            {documents.map((document) => (
              <label key={document.id} className="flex items-center gap-2 text-sm">
                <input name="documentIds" type="checkbox" value={document.id} />
                <span>{document.code ? `${document.code} - ` : ""}{document.title}</span>
              </label>
            ))}
          </div>
        </div>
        <Button type="submit">Salvar dossiê</Button>
      </form>
    </Card>
  );
}
