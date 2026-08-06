"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

interface FaqItemData {
  question: string;
  answer: string;
}

interface FaqClientProps {
  faq: FaqItemData[];
}

function filterFaq(faq: FaqItemData[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return faq;
  return faq.filter((item) => {
    const question = item.question.toLowerCase();
    const answer = item.answer.toLowerCase();
    return question.includes(normalizedQuery) || answer.includes(normalizedQuery);
  });
}

// Subcomponente isolado para gerenciar o estado de abrir/fechar de cada item
function FaqItem({ item, index }: { item: FaqItemData; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none py-4"
        aria-expanded={isOpen}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-baseline gap-4 pr-6">
          <span className="text-primary/20 text-4xl md:text-5xl font-serif transition-colors group-hover:text-primary/40">
            {(index + 1).toString().padStart(2, "0")}
          </span>
          {item.question}
        </h2>
        
        {/* Ícone com animação de rotação */}
        <div className="flex-shrink-0 ml-auto flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted/50 transition-colors">
          <ChevronDown
            className={`h-6 w-6 text-muted-foreground transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Animação suave de altura usando CSS Grid */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg md:text-xl max-w-none md:ml-[4.5rem] pb-4">
            {item.answer}
          </p>
        </div>
      </div>
    </section>
  );
}

export function FaqClient({ faq }: FaqClientProps) {
  const t = useTranslations("FaqPage");
  const [search, setSearch] = useState("");
  const filteredFaq = useMemo(() => filterFaq(faq, search), [faq, search]);

  return (
    <div className="max-w-4xl mx-auto">
         <header className="text-center md:text-left">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="faq-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-2xl border border-input bg-background/50 py-2 pl-12 pr-4 text-base text-foreground outline-none transition shadow-sm placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </header>
      <div className="card p-6 md:p-12 border-none bg-transparent dark:bg-transparent hover:bg-transparent dark:hover:bg-transparent">
        
       

        {/* Reduzi um pouco o gap (space-y-4) já que agora são colapsáveis e têm um visual mais próximo */}
        <div className="space-y-4 md:space-y-6">
          {filteredFaq.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-lg">
              {t("noResults")}
            </div>
          ) : (
            filteredFaq.map((item, index) => (
              <div key={index} className="border-b border-border/40 last:border-0">
                <FaqItem item={item} index={index} />
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}