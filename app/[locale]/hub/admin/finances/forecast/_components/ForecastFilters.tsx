"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface ForecastFiltersProps {
  currentMonth: number | "all";
  currentYear: number;
  revenueTotal: number;
  revenueCount: number;
  expensesTotal: number;
  expensesCount: number;
}

export function ForecastFilters({
  currentMonth,
  currentYear,
  revenueTotal,
  revenueCount,
  expensesTotal,
  expensesCount,
}: ForecastFiltersProps) {
  const t = useTranslations("AdminFinances");
  const tForecast = useTranslations("AdminFinances.forecast");
  const format = useFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const monthLabels = useMemo(() => [
    t("months.january"), t("months.february"), t("months.march"),
    t("months.april"), t("months.may"), t("months.june"),
    t("months.july"), t("months.august"), t("months.september"),
    t("months.october"), t("months.november"), t("months.december"),
  ], [t]);

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => now - i);
  }, []);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="sticky top-6 z-30 mb-6 flex flex-col md:flex-row md:items-center gap-3 bg-card/90 backdrop-blur-md p-3 rounded-2xl border border-border/50 shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={currentMonth.toString()}
          onValueChange={(v) => updateFilters("month", v)}
        >
          <SelectTrigger className="w-[160px] rounded-md border-border/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allMonths")}</SelectItem>
            {monthLabels.map((label, i) => (
              <SelectItem key={i} value={i.toString()}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentYear.toString()}
          onValueChange={(v) => updateFilters("year", v)}
        >
          <SelectTrigger className="w-[100px] rounded-md border-border/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2 md:justify-end">
        <div className="flex items-center gap-2 bg-emerald-500/10 rounded-xl px-3 py-1.5">
          <ArrowUpCircle className="size-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-wider">
              {tForecast("pendingRevenue")} · {revenueCount} {tForecast("items")}
            </span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {format.number(revenueTotal / 100, { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-rose-500/10 rounded-xl px-3 py-1.5">
          <ArrowDownCircle className="size-4 text-rose-600 shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-rose-700/80 dark:text-rose-400/80 uppercase tracking-wider">
              {tForecast("pendingExpenses")} · {expensesCount} {tForecast("items")}
            </span>
            <span className="text-sm font-bold text-rose-700 dark:text-rose-400">
              {format.number(expensesTotal / 100, { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
