"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Info,
  Lightbulb,
  OctagonAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocBlock, DocNoteBlock } from "../docs.types";

/**
 * Renderiza **negrito** e `código` inline sem trazer uma dependência de
 * markdown só para isso — o conteúdo usa apenas essas duas marcações.
 */
export function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="mx-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

const NOTE_STYLES: Record<
  DocNoteBlock["variant"],
  { wrapper: string; icon: string; Icon: React.ElementType; title: string }
> = {
  info: {
    wrapper: "border-sky-500/25 bg-sky-500/[0.06]",
    icon: "text-sky-500",
    Icon: Info,
    title: "text-sky-700 dark:text-sky-300",
  },
  success: {
    wrapper: "border-emerald-500/25 bg-emerald-500/[0.06]",
    icon: "text-emerald-500",
    Icon: Lightbulb,
    title: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    wrapper: "border-amber-500/25 bg-amber-500/[0.06]",
    icon: "text-amber-500",
    Icon: AlertTriangle,
    title: "text-amber-700 dark:text-amber-300",
  },
  danger: {
    wrapper: "border-red-500/25 bg-red-500/[0.06]",
    icon: "text-red-500",
    Icon: OctagonAlert,
    title: "text-red-700 dark:text-red-300",
  },
};

function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  );
}

export function DocBlockView({ block }: { block: DocBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-sm leading-relaxed text-muted-foreground">
          <InlineText text={block.text} />
        </p>
      );

    case "bullets":
      return (
        <ul className="flex flex-col gap-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-primary/50" />
              <span>
                <InlineText text={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <div>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <ol className="flex flex-col gap-3">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black tabular-nums text-primary">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  <InlineText text={item} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "note": {
      const style = NOTE_STYLES[block.variant];
      const { Icon } = style;
      return (
        <div className={cn("flex gap-3 rounded-lg border p-4", style.wrapper)}>
          <Icon className={cn("mt-0.5 size-4 shrink-0", style.icon)} />
          <div className="flex flex-col gap-1">
            {block.title && (
              <p className={cn("text-xs font-bold", style.title)}>{block.title}</p>
            )}
            <p className="text-sm leading-relaxed text-muted-foreground">
              <InlineText text={block.text} />
            </p>
          </div>
        </div>
      );
    }

    case "actions":
      return (
        <div>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <div className="flex flex-col gap-2">
            {block.items.map((item, i) => (
              <div key={i} className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <div className="mb-2 inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs font-bold">
                  {item.label}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <InlineText text={item.does} />
                </p>
                {item.flow && (
                  <p className="mt-2 flex gap-2 text-[13px] leading-relaxed text-muted-foreground/90">
                    <ArrowRight className="mt-[0.2rem] size-3.5 shrink-0 text-primary/70" />
                    <span>
                      <InlineText text={item.flow} />
                    </span>
                  </p>
                )}
                {item.warning && (
                  <p className="mt-2 flex gap-2 text-[13px] leading-relaxed text-amber-700 dark:text-amber-300/90">
                    <AlertTriangle className="mt-[0.2rem] size-3.5 shrink-0 text-amber-500" />
                    <span>
                      <InlineText text={item.warning} />
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case "fields":
      return (
        <div>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <dl className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/70">
            {block.items.map((item, i) => (
              <div key={i} className="grid gap-1 p-3.5 sm:grid-cols-[minmax(9rem,14rem)_1fr] sm:gap-4">
                <dt className="text-sm font-semibold text-foreground">{item.name}</dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">
                  <InlineText text={item.does} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      );

    case "table":
      return (
        <div>
          {block.title && <BlockTitle>{block.title}</BlockTitle>}
          <div className="overflow-x-auto rounded-lg border border-border/70">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-muted/30">
                  {block.headers.map((header, i) => (
                    <th
                      key={i}
                      className="px-3.5 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {block.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={cn(
                          "px-3.5 py-3 align-top leading-relaxed",
                          j === 0
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        <InlineText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
  }
}
