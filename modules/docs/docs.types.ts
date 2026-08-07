/**
 * Modelo de dados da Central de Ajuda do Admin.
 *
 * O conteúdo é mantido como dado puro (sem JSX) para que a busca consiga
 * varrer todos os textos — títulos, parágrafos, passos, rótulos de botões e
 * células de tabela — sem precisar percorrer a árvore de componentes.
 */

/** Parágrafo corrido. Aceita **negrito** inline. */
export interface DocParagraphBlock {
  type: "p";
  text: string;
}

/** Lista de tópicos sem ordem. */
export interface DocBulletsBlock {
  type: "bullets";
  items: string[];
}

/** Passo a passo numerado — usado para descrever fluxos de ponta a ponta. */
export interface DocStepsBlock {
  type: "steps";
  title?: string;
  items: string[];
}

/** Destaque colorido para avisos, dicas e alertas. */
export interface DocNoteBlock {
  type: "note";
  variant: "info" | "success" | "warning" | "danger";
  title?: string;
  text: string;
}

/**
 * Documentação de um botão/controle da interface.
 * `does` = o que acontece na hora; `flow` = o que o sistema dispara por trás.
 */
export interface DocActionItem {
  label: string;
  does: string;
  flow?: string;
  warning?: string;
}

export interface DocActionsBlock {
  type: "actions";
  title?: string;
  items: DocActionItem[];
}

/** Campos de formulário, filtros ou colunas de tabela. */
export interface DocFieldsBlock {
  type: "fields";
  title?: string;
  items: { name: string; does: string }[];
}

/** Tabela genérica (status, permissões, etc). */
export interface DocTableBlock {
  type: "table";
  title?: string;
  headers: string[];
  rows: string[][];
}

export type DocBlock =
  | DocParagraphBlock
  | DocBulletsBlock
  | DocStepsBlock
  | DocNoteBlock
  | DocActionsBlock
  | DocFieldsBlock
  | DocTableBlock;

export interface DocArticle {
  /** Slug estável — usado na âncora da URL (#id). */
  id: string;
  title: string;
  /** Resumo de uma linha, exibido no índice e nos resultados de busca. */
  summary: string;
  /** Rota real da plataforma que este artigo documenta, quando existir. */
  route?: string;
  /** Termos extras que devem casar na busca (sinônimos, jargão, siglas). */
  keywords?: string[];
  blocks: DocBlock[];
}

export interface DocSection {
  id: string;
  title: string;
  description: string;
  /** Nome do ícone do lucide-react, resolvido no client. */
  icon: string;
  articles: DocArticle[];
}
