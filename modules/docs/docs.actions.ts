"use server";

import { z } from "zod";
import { protectedAction } from "@/lib/safe-action";
import { AskDocsError, docsService, type AskDocsFailure } from "./docs.service";
import { docsRepository } from "./docs.repository";
import { getAudiencesForRole, type DocAudience } from "./docs.registry";

const audienceSchema = z.enum(["admin", "manager", "teacher", "student"]);

export const askDocsAction = protectedAction
  .metadata({ name: "askDocs" })
  .inputSchema(
    z.object({
      question: z.string().trim().min(5, "Escreva uma pergunta um pouco maior.").max(500),
      audience: audienceSchema,
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    try {
      // O papel decide quais documentações podem ser consultadas. Sem esta
      // checagem um aluno poderia forçar `audience: "admin"` na chamada e ler
      // a documentação interna inteira.
      const allowed = getAudiencesForRole(ctx.user.role).map((a) => a.id);
      if (!allowed.includes(parsedInput.audience as DocAudience)) {
        return { success: false as const, error: "forbidden" as const };
      }

      const result = await docsService.askDocs({
        question: parsedInput.question,
        audience: parsedInput.audience as DocAudience,
        userId: ctx.user.id,
      });

      return { success: true as const, data: result };
    } catch (error) {
      if (error instanceof AskDocsError) {
        return { success: false as const, error: error.reason };
      }
      console.error("[askDocsAction] Error:", error);
      return { success: false as const, error: "unavailable" as AskDocsFailure };
    }
  });

export const rateDocsAnswerAction = protectedAction
  .metadata({ name: "rateDocsAnswer" })
  .inputSchema(
    z.object({
      questionId: z.string().uuid(),
      feedback: z.enum(["helpful", "not_helpful"]),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    try {
      const row = await docsRepository.setFeedback(
        parsedInput.questionId,
        ctx.user.id,
        parsedInput.feedback,
      );
      if (!row) return { success: false as const, error: "notFound" };
      return { success: true as const };
    } catch (error) {
      console.error("[rateDocsAnswerAction] Error:", error);
      return { success: false as const, error: "error" };
    }
  });
