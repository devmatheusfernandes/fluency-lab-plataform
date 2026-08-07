-- Registro das perguntas feitas à IA da Central de Ajuda.
-- Serve para mapear lacunas na documentação: linhas com found_answer = false
-- são as dúvidas que ainda não têm artigo escrito.
--
-- Escrita à mão, no mesmo estilo idempotente de 0013_recess_refactor.sql,
-- porque `drizzle-kit generate` está bloqueado por drift anterior
-- (os snapshots param em 0012 e o 0013 nunca foi registrado no journal).

CREATE TABLE IF NOT EXISTS "docs_questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "audience" text NOT NULL,
  "question" text NOT NULL,
  "answer" text NOT NULL,
  "found_answer" boolean NOT NULL,
  "article_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "was_cached" boolean DEFAULT false NOT NULL,
  "feedback" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "docs_questions"
    ADD CONSTRAINT "docs_questions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- A tela de revisão do admin filtra por público e por "sem resposta",
-- sempre ordenando pelas mais recentes.
CREATE INDEX IF NOT EXISTS "idx_docs_questions_created_at"
  ON "docs_questions" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_docs_questions_audience_found"
  ON "docs_questions" ("audience", "found_answer");
