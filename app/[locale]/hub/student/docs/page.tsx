import { Metadata } from "next";
import { DocsPageContent } from "@/modules/docs/_components/DocsPageContent";

export const metadata: Metadata = {
  title: "Central de Ajuda",
  description: "Como usar a plataforma: telas, botões e fluxos.",
};

export default async function DocsPage() {
  return <DocsPageContent />;
}
