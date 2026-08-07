import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { userService } from "@/modules/user/user.service";
import { settingsService } from "@/modules/settings/settings.service";
import { getAudiencesForRole } from "../docs.registry";
import { DocsClient } from "./DocsClient";

/**
 * Conteúdo compartilhado das quatro rotas de Central de Ajuda.
 *
 * O papel do usuário decide quais públicos ele pode consultar — um professor
 * abre a própria documentação e também a do aluno, para conseguir orientá-lo.
 * A restrição de rota em si já vem do layout de cada papel (`requireRole`).
 */
export async function DocsPageContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  // Mesmo número que a landing page usa; editável pelo admin nas configurações.
  // Uma falha aqui não pode derrubar a Central de Ajuda inteira — sem número,
  // o painel apenas orienta a procurar a coordenação sem o link direto.
  let whatsappNumber: string | null = null;
  try {
    const settings = await settingsService.getSettings();
    whatsappNumber = settings.whatsappNumber?.replace(/\D/g, "") || null;
  } catch (error) {
    console.error("[DocsPageContent] Falha ao carregar o WhatsApp de contato:", error);
  }

  return (
    <DocsClient
      audiences={getAudiencesForRole(user.role)}
      whatsappNumber={whatsappNumber}
      user={userService.sanitizeUserForSettings(user)}
    />
  );
}
