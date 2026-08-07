import type { Role } from "@/lib/rbac";
import { ADMIN_DOCS } from "./docs.content.admin";
import { MANAGER_DOCS } from "./docs.content.manager";
import { STUDENT_DOCS } from "./docs.content.student";
import { TEACHER_DOCS } from "./docs.content.teacher";
import type { DocSection } from "./docs.types";

/** Para quem a documentação foi escrita. Espelha os papéis do RBAC. */
export type DocAudience = "admin" | "manager" | "teacher" | "student";

export interface DocAudienceMeta {
  id: DocAudience;
  /** Rótulo do seletor de público. */
  label: string;
  /** Frase curta exibida abaixo do título quando o público está selecionado. */
  description: string;
  /** Nome do ícone do lucide-react, resolvido no client. */
  icon: string;
  /** Exemplos exibidos antes da primeira pergunta — ensinam o formato esperado. */
  sampleQuestions: string[];
  sections: DocSection[];
}

export const DOC_AUDIENCES: Record<DocAudience, DocAudienceMeta> = {
  admin: {
    id: "admin",
    label: "Administrador",
    description: "Gestão completa da escola: usuários, financeiro, contratos e conteúdo.",
    icon: "ShieldCheck",
    sampleQuestions: [
      "Como encerro a matrícula de um aluno e o que acontece com a multa?",
      "O aluno pagou mas a parcela continua pendente, o que eu faço?",
      "Como gero um novo PIX para uma parcela vencida?",
      "Como funciona o cálculo do IRPF estimado?",
    ],
    sections: ADMIN_DOCS,
  },
  manager: {
    id: "manager",
    label: "Manager",
    description: "Suporte a alunos e professores, material didático e onboarding.",
    icon: "Headset",
    sampleQuestions: [
      "O aluno quer cancelar a matrícula, como devo conduzir?",
      "Quando posso conceder um crédito de reposição?",
      "Quais são as regras de remarcação de aula?",
      "Por que não consigo mandar mensagem no WhatsApp para um aluno?",
    ],
    sections: MANAGER_DOCS,
  },
  teacher: {
    id: "teacher",
    label: "Professor",
    description: "Agenda, registro de aulas, alunos e material didático.",
    icon: "Presentation",
    sampleQuestions: [
      "O aluno não apareceu na aula, como devo registrar?",
      "Como comunico um recesso e com quanto tempo de antecedência?",
      "Aula cancelada por mim entra no meu pagamento?",
      "Como abro horários na minha agenda?",
    ],
    sections: TEACHER_DOCS,
  },
  student: {
    id: "student",
    label: "Aluno",
    description: "Aulas, pagamentos, estudos e configurações da conta.",
    icon: "GraduationCap",
    sampleQuestions: [
      "Com quanto tempo de antecedência posso cancelar uma aula?",
      "Quantas vezes posso remarcar por mês?",
      "Onde encontro o PIX da minha mensalidade?",
      "O que é um crédito de reposição?",
    ],
    sections: STUDENT_DOCS,
  },
};

/**
 * Quais públicos cada papel pode consultar.
 *
 * A regra é "quem apoia, enxerga": o admin vê tudo porque atende todo mundo;
 * o professor vê a documentação do aluno para conseguir orientá-lo; o manager,
 * que dá suporte a alunos e professores, vê a documentação dos dois.
 *
 * O primeiro item é sempre o público padrão — a própria documentação do papel.
 */
const AUDIENCES_BY_ROLE: Record<Role, DocAudience[]> = {
  admin: ["admin", "manager", "teacher", "student"],
  manager: ["manager", "student", "teacher"],
  teacher: ["teacher", "student"],
  student: ["student"],
};

/** Públicos que um papel pode abrir, na ordem em que aparecem no seletor. */
export function getAudiencesForRole(role: string): DocAudienceMeta[] {
  const allowed = AUDIENCES_BY_ROLE[role as Role] ?? ["student"];
  return allowed.map((audience) => DOC_AUDIENCES[audience]);
}

/** Público aberto por padrão ao entrar na Central de Ajuda. */
export function getDefaultAudienceForRole(role: string): DocAudience {
  return (AUDIENCES_BY_ROLE[role as Role] ?? ["student"])[0];
}
