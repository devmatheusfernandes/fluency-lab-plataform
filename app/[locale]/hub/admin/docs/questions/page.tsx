import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { docsRepository } from "@/modules/docs/docs.repository";
import { userService } from "@/modules/user/user.service";
import { DocsQuestionsClient } from "@/modules/docs/_components/DocsQuestionsClient";

export const metadata: Metadata = {
  title: "Perguntas à IA",
  description: "O que os usuários perguntam na Central de Ajuda.",
};

interface PageProps {
  searchParams: Promise<{ audience?: string; unanswered?: string }>;
}

export default async function DocsQuestionsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/signin");
  }

  const params = await searchParams;
  const audience = ["admin", "manager", "teacher", "student"].includes(params.audience ?? "")
    ? params.audience
    : undefined;
  const onlyUnanswered = params.unanswered === "1";

  const [questions, stats] = await Promise.all([
    docsRepository.listQuestions({ audience, onlyUnanswered }),
    docsRepository.getStats(),
  ]);

  return (
    <DocsQuestionsClient
      questions={questions.map((q) => ({
        id: q.id,
        audience: q.audience,
        question: q.question,
        answer: q.answer,
        foundAnswer: q.foundAnswer,
        articleIds: q.articleIds,
        feedback: q.feedback,
        createdAt: q.createdAt.toISOString(),
        userName: q.user?.name ?? null,
        userRole: q.user?.role ?? null,
      }))}
      stats={stats}
      currentAudience={audience ?? "all"}
      onlyUnanswered={onlyUnanswered}
      user={userService.sanitizeUserForSettings(user)}
    />
  );
}
