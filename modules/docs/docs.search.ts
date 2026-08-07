import { DOC_AUDIENCES, type DocAudience } from "./docs.registry";
import type { DocArticle, DocBlock, DocSection } from "./docs.types";

export interface DocSearchEntry {
  article: DocArticle;
  section: DocSection;
  /** Todo o texto pesquisável do artigo, já normalizado (minúsculo, sem acento). */
  haystack: string;
}

export interface DocSearchResult extends DocSearchEntry {
  score: number;
  /** Trecho do corpo do artigo em volta do termo buscado, para pré-visualização. */
  excerpt?: string;
}

/** Remove acentos e caixa para que "cancelamento" case com "Cancelamento". */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Extrai todo o texto legível de um bloco, para alimentar a busca. */
function blockToText(block: DocBlock): string {
  switch (block.type) {
    case "p":
      return block.text;
    case "bullets":
      return block.items.join(" ");
    case "steps":
      return [block.title, ...block.items].filter(Boolean).join(" ");
    case "note":
      return [block.title, block.text].filter(Boolean).join(" ");
    case "actions":
      return [
        block.title,
        ...block.items.flatMap((i) => [i.label, i.does, i.flow, i.warning]),
      ]
        .filter(Boolean)
        .join(" ");
    case "fields":
      return [block.title, ...block.items.flatMap((i) => [i.name, i.does])]
        .filter(Boolean)
        .join(" ");
    case "table":
      return [block.title, ...block.headers, ...block.rows.flat()]
        .filter(Boolean)
        .join(" ");
  }
}

/** Só o corpo do artigo (sem título/resumo), usado para montar o trecho de preview. */
function articleBodyText(article: DocArticle): string {
  return article.blocks.map(blockToText).join(" ");
}

function buildIndex(sections: DocSection[]): DocSearchEntry[] {
  return sections.flatMap((section) =>
    section.articles.map((article) => ({
      article,
      section,
      haystack: normalize(
        [
          article.title,
          article.summary,
          article.route ?? "",
          (article.keywords ?? []).join(" "),
          section.title,
          articleBodyText(article),
        ].join(" "),
      ),
    })),
  );
}

/**
 * Um índice por público, calculado uma única vez — o conteúdo é estático.
 * A busca nunca cruza públicos: o professor procurando "pagamento" recebe o
 * artigo de ganhos dele, não o painel financeiro do admin.
 */
const INDEX_BY_AUDIENCE: Record<DocAudience, DocSearchEntry[]> = {
  admin: buildIndex(DOC_AUDIENCES.admin.sections),
  manager: buildIndex(DOC_AUDIENCES.manager.sections),
  teacher: buildIndex(DOC_AUDIENCES.teacher.sections),
  student: buildIndex(DOC_AUDIENCES.student.sections),
};

/**
 * Busca por todos os termos digitados (AND): "taxa cancelamento" só retorna
 * artigos que contenham as duas palavras, em qualquer ordem.
 *
 * A pontuação prioriza casamento no título, depois em resumo/palavras-chave,
 * e por último no corpo — assim o artigo principal sobre o assunto vem antes
 * de outro que só o menciona de passagem.
 */
export function searchDocs(query: string, audience: DocAudience): DocSearchResult[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const results: DocSearchResult[] = [];

  for (const entry of INDEX_BY_AUDIENCE[audience]) {
    if (!terms.every((term) => entry.haystack.includes(term))) continue;

    const title = normalize(entry.article.title);
    const summary = normalize(entry.article.summary);
    const keywords = normalize((entry.article.keywords ?? []).join(" "));

    let score = 0;
    for (const term of terms) {
      if (title.startsWith(term)) score += 12;
      else if (title.includes(term)) score += 8;
      if (summary.includes(term)) score += 4;
      if (keywords.includes(term)) score += 3;
      score += 1; // presente em algum lugar do artigo
    }

    results.push({
      ...entry,
      score,
      excerpt: buildExcerpt(entry.article, terms[0]),
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

/** Recorta ~160 caracteres em volta da primeira ocorrência do termo. */
function buildExcerpt(article: DocArticle, term: string): string | undefined {
  const body = articleBodyText(article);
  const index = normalize(body).indexOf(term);
  if (index === -1) return undefined;

  const start = Math.max(0, index - 60);
  const end = Math.min(body.length, index + 120);
  return `${start > 0 ? "…" : ""}${body.slice(start, end).trim()}${end < body.length ? "…" : ""}`;
}
