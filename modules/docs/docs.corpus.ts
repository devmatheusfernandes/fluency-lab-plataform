import { DOC_AUDIENCES, type DocAudience } from "./docs.registry";
import type { DocBlock, DocSection } from "./docs.types";

/**
 * Serializa a documentação de um público em Markdown para alimentar o prompt.
 *
 * Diferente do `blockToText` de `docs.search.ts` — que achata tudo num texto
 * corrido só para casar termos —, aqui a estrutura é o que importa: um aviso
 * precisa chegar ao modelo marcado como aviso, uma tabela como tabela. Por isso
 * são duas renderizações distintas, e não uma função com dois modos.
 */

const NOTE_LABEL: Record<string, string> = {
  info: "NOTA",
  success: "DICA",
  warning: "ATENÇÃO",
  danger: "ALERTA CRÍTICO",
};

function blockToMarkdown(block: DocBlock): string {
  switch (block.type) {
    case "p":
      return block.text;

    case "bullets":
      return block.items.map((item) => `- ${item}`).join("\n");

    case "steps": {
      const steps = block.items.map((item, i) => `${i + 1}. ${item}`).join("\n");
      return block.title ? `**${block.title}**\n${steps}` : steps;
    }

    case "note": {
      const label = NOTE_LABEL[block.variant] ?? "NOTA";
      const head = block.title ? `${label} — ${block.title}` : label;
      return `> [${head}] ${block.text}`;
    }

    case "actions": {
      const items = block.items
        .map((item) => {
          const lines = [`- Botão "${item.label}": ${item.does}`];
          if (item.flow) lines.push(`  - O que o sistema faz: ${item.flow}`);
          if (item.warning) lines.push(`  - Cuidado: ${item.warning}`);
          return lines.join("\n");
        })
        .join("\n");
      return block.title ? `**${block.title}**\n${items}` : items;
    }

    case "fields": {
      const items = block.items.map((i) => `- ${i.name}: ${i.does}`).join("\n");
      return block.title ? `**${block.title}**\n${items}` : items;
    }

    case "table": {
      const header = `| ${block.headers.join(" | ")} |`;
      const divider = `| ${block.headers.map(() => "---").join(" | ")} |`;
      const rows = block.rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
      const table = [header, divider, rows].join("\n");
      return block.title ? `**${block.title}**\n${table}` : table;
    }
  }
}

function sectionsToMarkdown(sections: DocSection[]): string {
  return sections
    .map((section) => {
      const articles = section.articles
        .map((article) => {
          const head = [
            `### ARTIGO [id: ${article.id}]`,
            `Título: ${article.title}`,
            `Resumo: ${article.summary}`,
            article.route ? `Tela na plataforma: ${article.route}` : null,
          ]
            .filter(Boolean)
            .join("\n");

          const body = article.blocks.map(blockToMarkdown).join("\n\n");
          return `${head}\n\n${body}`;
        })
        .join("\n\n");

      return `## SEÇÃO: ${section.title}\n${section.description}\n\n${articles}`;
    })
    .join("\n\n---\n\n");
}

/** O conteúdo é estático, então cada público é serializado uma única vez. */
const CORPUS_CACHE = new Map<DocAudience, string>();

export function getDocsCorpus(audience: DocAudience): string {
  const cached = CORPUS_CACHE.get(audience);
  if (cached) return cached;

  const corpus = sectionsToMarkdown(DOC_AUDIENCES[audience].sections);
  CORPUS_CACHE.set(audience, corpus);
  return corpus;
}

/** Ids válidos do público — usados para descartar citações inventadas. */
export function getArticleIds(audience: DocAudience): Set<string> {
  return new Set(
    DOC_AUDIENCES[audience].sections.flatMap((s) => s.articles.map((a) => a.id)),
  );
}

/** Localiza um artigo pelo id, para montar o card de citação na UI. */
export function findArticle(audience: DocAudience, articleId: string) {
  for (const section of DOC_AUDIENCES[audience].sections) {
    const article = section.articles.find((a) => a.id === articleId);
    if (article) return { section, article };
  }
  return null;
}
