"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useTranslations } from "next-intl";
import { containerVariants, itemVariants } from "@/lib/animations";
import Link from "next/link";
import { SystemSettings } from "@/modules/settings/settings.schema";

type TeamMember = {
  name: string;
  role: string;
  image: string;
  bio: string;
  lang: string;
  tags: string[];
  featured?: boolean;
};

const TutorCard = ({ member }: { member: TeamMember }) => (
  <motion.div
    whileHover={{ y: -6 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300, damping: 22 }}
    className="group flex flex-col items-center text-center h-full justify-between p-6 rounded-2xl bg-muted dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/70 hover:border-primary/20 transition-[box-shadow,border-color] duration-300"
  >
    <div className="flex flex-col items-center">
      <div className="relative mb-5">
        {/* Brilho pulsante — só para o tutor em destaque, no lugar do "balanço" aleatório */}
        {member.featured && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary/25 -z-10"
            animate={{ scale: [1, 1.22, 1], opacity: [0.55, 0, 0.55] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-white dark:border-slate-900/60 overflow-hidden transition-colors duration-300 group-hover:border-primary/30">
          <AvatarImage
            src={member.image}
            alt={member.name}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
          <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xl">
            {member.name?.[0] || "?"}
          </AvatarFallback>
        </Avatar>

        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-950 px-2 py-0.5 rounded-full text-xs border border-slate-100 dark:border-slate-800 font-medium select-none shadow-sm">
          {member.lang}
        </span>
      </div>

      {member.featured && (
        <Badge className="mb-2 bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold px-2.5 py-0.5 rounded-full hover:bg-primary/10">
          Favorito dos alunos
        </Badge>
      )}

      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 group-hover:text-primary transition-colors duration-300">
        {member.name}
      </h3>
      <p className="text-xs font-semibold text-primary dark:text-primary/90 mt-1 mb-2 uppercase tracking-wider">
        {member.role}
      </p>

      <div className="flex flex-wrap gap-1.5 justify-center mb-3">
        {member.tags.map((tag, i) => (
          <Badge
            key={i}
            variant="outline"
            className="text-[10px] px-2 py-0.5 font-medium rounded-full bg-slate-500/5 dark:bg-slate-400/5 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
        {member.bio}
      </p>
    </div>

    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
      <span>Conhecer</span>
      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </div>
  </motion.div>
);

export default function TeamSection({
  settings,
}: {
  settings: SystemSettings;
}) {
  const t = useTranslations("LandingPage.Team");

  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll horizontal do trackpad continua controlando o carrossel
  useEffect(() => {
    if (!api) return;
    const el = containerRef.current;
    if (!el) return;

    let accumX = 0;
    let lastScrollTime = 0;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        accumX += e.deltaX;

        const now = Date.now();
        if (now - lastScrollTime > 300) {
          if (accumX > 30) {
            api.scrollNext();
            accumX = 0;
            lastScrollTime = now;
          } else if (accumX < -30) {
            api.scrollPrev();
            accumX = 0;
            lastScrollTime = now;
          }
        }
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [api]);

  // Setas + dots de navegação
  useEffect(() => {
    if (!api) return;

    const updateState = () => {
      setScrollSnaps(api.scrollSnapList());
      setSelectedIndex(api.selectedScrollSnap());
    };

    // Agenda a atualização inicial para o próximo frame para evitar setState síncrono no efeito
    const animationFrameId = requestAnimationFrame(updateState);

    api.on("select", updateState);
    api.on("reInit", updateState);

    return () => {
      cancelAnimationFrame(animationFrameId);
      api.off("select", updateState);
      api.off("reInit", updateState);
    };
  }, [api]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  const team: TeamMember[] = [
    {
      name: t("members.deise.name") || "Deise Laiane",
      role: t("members.deise.role") || "CEO",
      image: "/images/team/deise.png",
      bio: t("members.deise.bio") || "Coordenadora de curso, gerencia a escola e os professores.",
      lang: "🇧🇷",
      tags: [
        t("tags.management") || "Gestão",
        t("tags.coordination") || "Coordenação",
      ],
    },
    {
      name: t("members.luara.name") || "Luara",
      role: t("members.luara.role") || "Professora de Inglês",
      image: "/images/team/luara.png",
      bio: t("members.luara.bio") || "Professora de inglês com anos de experiência, focada no ensino de adultos.",
      lang: "🇧🇷 🇺🇸",
      tags: [
        t("tags.adults") || "Adultos",
        t("tags.experience") || "Experiência",
      ],
    },
    {
      name: t("members.gideon.name") || "Gideon",
      role: t("members.gideon.role") || "Professor Nativo de Inglês",
      image: "/images/team/gideon.png",
      bio: t("members.gideon.bio") || "Professor nativo de inglês, focado em conversação e fluência prática.",
      lang: "🇬🇧 🇺🇸",
      tags: [
        t("tags.native") || "Nativo",
        t("tags.conversation") || "Conversação",
      ],
      featured: true,
    },
    {
      name: t("members.giulia.name") || "Giulia",
      role: t("members.giulia.role") || "Professora de Inglês",
      image: "/images/team/giulia.png",
      bio: t("members.giulia.bio") || "Professora de inglês, focada no ensino de crianças e adolescentes.",
      lang: "🇧🇷 🇺🇸",
      tags: [
        t("tags.kidsTeens") || "Kids & Teens",
        t("tags.english") || "Inglês",
      ],
    },
    {
      name: t("members.lucas.name") || "Lucas",
      role: t("members.lucas.role") || "Professor de Inglês",
      image: "/images/team/lucas.png",
      bio: t("members.lucas.bio") || "Professor de inglês, focado em gramática e conversação.",
      lang: "🇧🇷 🇺🇸",
      tags: [
        t("tags.grammar") || "Gramática",
        t("tags.conversation") || "Conversação",
      ],
    },
    {
      name: t("members.bianca.name") || "Bianca",
      role: t("members.bianca.role") || "Professora de Inglês",
      image: "/images/team/bianca.png",
      bio: t("members.bianca.bio") || "Professora de inglês, focada no ensino dinamico e interativo.",
      lang: "🇧🇷 🇺🇸",
      tags: [
        t("tags.kidsTeens") || "Kids",
        t("tags.english") || "Inglês",
      ],
    },
  ];

  return (
    <section className="py-6 overflow-hidden">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">
          <div
            ref={containerRef}
            className="relative w-full lg:w-1/2 order-2 lg:order-1"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              // Fade nas bordas para os cards não serem cortados de forma abrupta
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 4%, black 94%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 4%, black 94%, transparent)",
              }}
            >
              <Carousel
                setApi={setApi}
                opts={{ align: "start", loop: true }}
                className="w-full cursor-grab active:cursor-grabbing"
              >
                <CarouselContent className="py-4">
                  {team.map((member, index) => (
                    <CarouselItem
                      key={index}
                      className="basis-[75%] sm:basis-[43%]"
                    >
                      <motion.div variants={itemVariants} className="h-full">
                        <TutorCard member={member} />
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.div>

            {/* Setas de navegação */}
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Anterior"
              className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 -translate-x-1/2 z-1 w-9 h-9 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-primary/30 hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Próximo"
              className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 translate-x-1/2 z-1 w-9 h-9 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-primary/30 hover:text-primary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots de progresso */}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {scrollSnaps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ir para o slide ${i + 1}`}
                  onClick={() => api?.scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === selectedIndex
                      ? "w-5 bg-primary"
                      : "w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 order-1 lg:order-2 text-center lg:text-left space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-col space-y-4"
            >
              <motion.div variants={itemVariants} className="flex justify-center lg:justify-start">
                <Badge
                  variant="outline"
                  className="px-4 py-1 border-primary/20 text-primary bg-primary/5"
                >
                  {t("badge") || "Nossos Experts"}
                </Badge>
              </motion.div>
              <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {t.rich("title", {
                  primary: (chunks) => <span className="text-primary">{chunks}</span>,
                }) || "Conheça nosso time"}
              </motion.h2>
              <motion.p variants={itemVariants} className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t("description") || "Tutores dedicados..."}
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                  settings.whatsappMessage,
                )}`}
                target="_blank"
                rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="rounded-full px-8 text-base font-semibold transition-all hover:scale-105 z-1!"
                >
                  {t("cta") || "Quero marcar uma aula teste"}
                </Button></Link>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center lg:justify-start gap-8">
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                    {t("stats.tutors") || "+150"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t("stats.tutorsLabel") || "Alunos"}
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                    {t("stats.rating") || "4.9/5"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {t("stats.ratingLabel") || "Avaliação Média"}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}