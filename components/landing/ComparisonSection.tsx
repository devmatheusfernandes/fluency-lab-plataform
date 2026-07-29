"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { SystemSettings } from "@/modules/settings/settings.schema";

type ComparisonItem = {
  key: string;
  title: string;
  problemTitle: string;
  problems: string[];
  solutionTitle: string;
  solutions: string[];
  description: string;
};


// ---------------------------------------------------------------------------
// Paleta pastel + formas SVG que "vazam" para fora do card (uma por item)
// ---------------------------------------------------------------------------

type CardTheme = {
  image: string; // foto de fundo do card
  tint: string; // cor viva (aplicada como duotone sobre a foto, não chapada)
  ring: string; // cor de apoio para os SVGs que vazam do card
  shapes: (idx: number) => React.ReactNode;
};

const IMAGES = {
  apps: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=80",
  marketplaces:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=80",
  traditional:
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=900&auto=format&fit=crop&q=80",
};

const CARD_THEMES: CardTheme[] = [
  {
    // Apps: da repetição sozinha no telefone para uma conversa real com tutor
    image: IMAGES.apps,
    tint: "rgba(196, 86, 42, 0.55)", // terracota — vivo, porém discreto
    ring: "#E8935B",
    shapes: () => (
      <>
        {/* Balão de conversa — representa o tutor real substituindo o app */}
        <svg
          width="108"
          height="96"
          viewBox="0 0 112 100"
          className="absolute -top-10 -left-5 rotate-[-9deg]"
        >
          <path
            d="M14 8h72a12 12 0 0 1 12 12v34a12 12 0 0 1-12 12H56l-18 18V66H14A12 12 0 0 1 2 54V20A12 12 0 0 1 14 8Z"
            fill="#E8935B"
          />
          <circle cx="34" cy="37" r="5" fill="#FFF3E4" />
          <circle cx="54" cy="37" r="5" fill="#FFF3E4" />
          <circle cx="74" cy="37" r="5" fill="#FFF3E4" />
        </svg>
        {/* Seta circular — o ciclo repetitivo do app, ficando pra trás */}
        <svg
          width="42"
          height="42"
          viewBox="0 0 46 46"
          className="absolute top-6 -right-4 rotate-[22deg] opacity-90"
        >
          <path
            d="M39 23a16 16 0 1 1-4.7-11.3"
            fill="none"
            stroke="#F6D9BC"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M40 4v10h-10"
            fill="none"
            stroke="#F6D9BC"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </>
    ),
  },
  {
    // Marketplaces: de aulas soltas para um plano/curadoria organizada
    image: IMAGES.marketplaces,
    tint: "rgba(58, 74, 158, 0.55)", // índigo — vivo, porém discreto
    ring: "#6E86C4",
    shapes: () => (
      <>
        {/* Prancheta com checklist — representa o plano personalizado */}
        <svg
          width="92"
          height="104"
          viewBox="0 0 100 112"
          className="absolute -top-11 right-2 rotate-[7deg]"
        >
          <rect x="10" y="14" width="80" height="90" rx="12" fill="#6E86C4" />
          <rect x="32" y="4" width="36" height="16" rx="7" fill="#EAF0FC" />
          <path
            d="M27 44l9 9l19-19"
            fill="none"
            stroke="#EAF0FC"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27 76l9 9l19-19"
            fill="none"
            stroke="#EAF0FC"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Alvo — representa os objetivos do aluno guiando o plano */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 44 44"
          className="absolute top-16 -left-4 rotate-[-14deg] opacity-90"
        >
          <circle
            cx="22"
            cy="22"
            r="19"
            fill="none"
            stroke="#6E86C4"
            strokeWidth="4"
          />
          <circle
            cx="22"
            cy="22"
            r="11"
            fill="none"
            stroke="#6E86C4"
            strokeWidth="4"
          />
          <circle cx="22" cy="22" r="3.5" fill="#6E86C4" />
        </svg>
      </>
    ),
  },
  {
    // Escolas tradicionais: de horário fixo para ritmo flexível
    image: IMAGES.traditional,
    tint: "rgba(43, 107, 68, 0.55)", // verde floresta — vivo, porém discreto
    ring: "#7DA986",
    shapes: () => (
      <>
        {/* Relógio — representa o horário e ritmo flexíveis */}
        <svg
          width="100"
          height="100"
          viewBox="0 0 104 104"
          className="absolute -top-9 left-3 rotate-[-5deg]"
        >
          <circle cx="52" cy="52" r="44" fill="#4F8F5B" />
          <line
            x1="52"
            y1="52"
            x2="52"
            y2="26"
            stroke="#EAF6E9"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="52"
            y1="52"
            x2="70"
            y2="63"
            stroke="#EAF6E9"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="52" cy="52" r="4.5" fill="#EAF6E9" />
        </svg>
        {/* Livro aberto — conteúdo e temas escolhidos pelo aluno */}
        <svg
          width="50"
          height="40"
          viewBox="0 0 46 36"
          className="absolute top-2 -right-5 rotate-[17deg]"
        >
          <path d="M23 8C18 3 9 2 3 4v25c6-2 15-1 20 4V8Z" fill="#7DA986" />
          <path d="M23 8c5-5 14-6 20-4v25c-6-2-15-1-20 4V8Z" fill="#4F8F5B" />
        </svg>
      </>
    ),
  },
];

interface ComparisonCardProps {
  item: ComparisonItem;
  theme: CardTheme;
  index: number;
  innerRef: (el: HTMLDivElement | null) => void;
}

function ComparisonCard({ item, theme, index, innerRef }: ComparisonCardProps) {
  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: photoRef,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <motion.div
      ref={innerRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative select-none w-full h-[420px] sm:h-[480px]"
    >
      <div
        ref={photoRef}
        className="absolute inset-0 overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 shadow-sm"
      >
        {/* Foto de fundo — maior que o card para o movimento de parallax não revelar bordas vazias */}
        <motion.img
          src={theme.image}
          alt={item.title}
          style={{ y: photoY }}
          className="absolute left-0 right-0 -top-[12%] h-[124%] object-cover"
        />
        {/* Duotone: cor viva, porém discreta, aplicada sobre a foto */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: theme.tint, mixBlendMode: "multiply" }}
        />
        {/* Scrim escuro de baixo para cima, garante legibilidade do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

        {/* Conteúdo — texto explicativo único, ancorado na base do card */}
        <div className="relative z-1 h-full flex flex-col justify-end gap-2.5 p-6 sm:p-7">
          <Badge
            variant="outline"
            className="w-fit bg-white/15 border-white/25 text-white text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full backdrop-blur-sm shadow-none"
          >
            {item.title}
          </Badge>
          <h3 className="text-lg md:text-xl font-bold text-white leading-snug">
            {item.solutionTitle}
          </h3>
          <p className="text-white/85 text-sm md:text-[15px] leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Formas SVG vazando para fora do card — camada própria, sempre acima da foto */}
      <div className="absolute inset-0 z-2 pointer-events-none">
        {theme.shapes(index)}
      </div>
    </motion.div>
  );
}

export default function ComparisonSection({
  settings,
}: {
  settings: SystemSettings;
}) {
  const t = useTranslations("LandingPage.Comparison");
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const keys = ["apps", "marketplaces", "traditional"] as const;

  const comparisons: ComparisonItem[] = keys.map((key) => {
    const problems = (t(`items.${key}.problems`) || "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const solutions = (t(`items.${key}.solutions`) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const description = t(`items.${key}.description`);

    return {
      key,
      title: t(`items.${key}.title`) || key,
      problemTitle: t(`items.${key}.problemTitle`) || "Problemas comuns",
      problems,
      solutionTitle: t(`items.${key}.solutionTitle`) || "A Solução Fluency Lab",
      solutions,
      description,
    };
  });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((ref, index) => {
      if (!ref) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(index);
            }
          });
        },
        { threshold: 0.4, rootMargin: "-15% 0px -15% 0px" },
      );
      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [comparisons.length]);

  const scrollToCard = (index: number) => {
    setActiveIndex(index);
    const element = cardRefs.current[index];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section
      id="comparison-section"
      ref={sectionRef}
      className="relative rounded-3xl my-8 px-5 md:px-10 lg:px-16 py-16 md:py-24 lg:py-32 overflow-visible"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[460px_1fr] gap-12 lg:gap-20 xl:gap-32 items-start">
          {/* LEFT COLUMN: Sticky Navigation & Header */}
          <div
            ref={leftColRef}
            id="comparison-nav-anchor"
            className="lg:sticky lg:top-[12vh] lg:h-fit lg:flex lg:flex-col lg:justify-center lg:py-8 lg:px-8 rounded-3xl relative z-1 transition-all duration-300"
          >
            {/* Left Column Background Card */}
            <div className="hidden md:block -m-8 -mx-22 absolute inset-0 rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 -z-10 pointer-events-none" />

            {/* Top Info */}
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="px-4 py-1.5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 backdrop-blur-md text-xs uppercase tracking-widest font-semibold rounded-full inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {t("badge") || "Diferenciais"}
              </Badge>

              <h2 className="text-xl sm:text-2xl lg:text-[30px] xl:text-[38px] leading-[1.18] font-bold tracking-tight text-slate-900 dark:text-white">
                {t("title") || "Por que a Fluency Lab é diferente?"}
              </h2>

              <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg font-normal leading-relaxed">
                {t("description") ||
                  "Você já tentou aprender com apps e desistiu. Descubra como nossa metodologia une inteligência humana e artificial para acelerar sua fluência."}
              </p>

              {/* Navigation Buttons (Desktop Only) */}
              <div className="hidden lg:flex flex-col space-y-3 pt-4">
                {comparisons.map((item, index) => {
                  const isActive = activeIndex === index;
                  const theme = CARD_THEMES[index % CARD_THEMES.length];
                  return (
                    <button
                      key={item.key}
                      onClick={() => scrollToCard(index)}
                      className={`text-left px-5 py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-between group cursor-pointer border ${
                        isActive
                          ? "bg-slate-100 dark:bg-white/10 backdrop-blur-xl translate-x-2 font-semibold"
                          : "bg-slate-500/5 dark:bg-white/5 text-slate-500 dark:text-white/40 hover:text-slate-800 hover:dark:text-white/80 hover:bg-slate-100/50 hover:dark:bg-white/5 border-transparent font-medium"
                      }`}
                      style={
                        isActive
                          ? { borderColor: theme.ring, color: theme.ring }
                          : undefined
                      }
                    >
                      <span className="text-sm md:text-base">{item.title}</span>
                      <span
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          isActive
                            ? "scale-125 shadow-none"
                            : "bg-slate-300 dark:bg-white/20 opacity-0 group-hover:opacity-100"
                        }`}
                        style={
                          isActive ? { backgroundColor: theme.ring } : undefined
                        }
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom CTA (Desktop Only) */}
            <div className="hidden lg:block pt-6 space-y-4">
              <p className="text-slate-500 dark:text-white/60 text-sm font-medium">
                {t("cta.description")}
              </p>
              <Link
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                  settings.whatsappMessage,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary text-foreground hover:bg-primary/90 font-semibold px-6 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] text-sm shadow-none"
              >
                {t("cta.button")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Scrolling Cards */}
          <div className="space-y-8 lg:space-y-10 relative">
            {comparisons.map((item, index) => (
              <ComparisonCard
                key={item.key}
                item={item}
                theme={CARD_THEMES[index % CARD_THEMES.length]}
                index={index}
                innerRef={(el) => {
                  cardRefs.current[index] = el;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
