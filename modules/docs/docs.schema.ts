import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "../user/user.schema";

/**
 * Registro das perguntas feitas à IA da Central de Ajuda.
 *
 * Existe para descobrir lacunas na documentação: as linhas com
 * `foundAnswer = false` são, literalmente, a lista de artigos que faltam
 * escrever. O feedback do usuário complementa, apontando respostas que
 * existem mas não estão boas.
 */
export const docsQuestionsTable = pgTable("docs_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  /** Qual documentação foi consultada (admin, manager, teacher, student). */
  audience: text("audience").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  /** O modelo declarou ter encontrado resposta na documentação. */
  foundAnswer: boolean("found_answer").notNull(),
  /** Artigos citados, já validados contra os ids reais do público. */
  articleIds: jsonb("article_ids").$type<string[]>().notNull().default([]),
  /** Resposta veio do cache — não consumiu cota da API. */
  wasCached: boolean("was_cached").notNull().default(false),
  /** "helpful" | "not_helpful" — preenchido pelo 👍/👎 do usuário. */
  feedback: text("feedback"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const docsQuestionsRelations = relations(docsQuestionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [docsQuestionsTable.userId],
    references: [usersTable.id],
  }),
}));

export type DocsQuestion = typeof docsQuestionsTable.$inferSelect;
export type NewDocsQuestion = typeof docsQuestionsTable.$inferInsert;
