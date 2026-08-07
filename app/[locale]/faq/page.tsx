import { getTranslations } from "next-intl/server";
import { BackButton } from "@/components/ui/back-button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { FaqClient } from "./_components/FaqClient";
import { settingsService } from "@/modules/settings/settings.service";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
};

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  const settings = await settingsService.getSettings();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="flex h-fit items-center justify-between">
          <BackButton href="/" />
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8 md:py-16">
        <FaqClient faq={settings.faq} />
      </main>
    </div>
  );
}