import { TerminalForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";

export default function NewTerminalPage() {
  return <><PageHeader title="Novo terminal" description="Cadastre uma unidade operacional para organizar ativos, projetos e documentos." /><TerminalForm /></>;
}
