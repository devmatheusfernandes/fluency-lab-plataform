"use client";

import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { format, type Locale } from "date-fns";
import { Button } from "@/components/ui/button";
import { type Notification } from "@/modules/notification/notification.schema";

interface NotificationDetailProps {
  notification: Notification;
  dateLocale: Locale;
  onBack: () => void;
  onNavigate: (url: string) => void;
  backLabel?: string;
  actionLabel?: string;
}

export function NotificationDetail({
  notification,
  dateLocale,
  onBack,
  onNavigate,
  backLabel = "Voltar",
  actionLabel = "Abrir",
}: NotificationDetailProps) {
  return (
    <div className="flex flex-col">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors px-4 pt-4 pb-2 w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </button>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <h3 className="text-base font-bold leading-snug text-foreground">
          {notification.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {notification.body}
        </p>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
          <Clock className="h-3 w-3" />
          {format(new Date(notification.createdAt), "dd MMM yyyy, HH:mm", { locale: dateLocale })}
        </div>

        {notification.actionUrl && (
          <Button
            onClick={() => onNavigate(notification.actionUrl!)}
            className="mt-2 w-full gap-2"
          >
            {actionLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
