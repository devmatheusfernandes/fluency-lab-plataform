"use client";

import { useTransition } from "react";
import { updateNotificationPrefsAction } from "@/modules/user/user.actions";
import { notify } from "@/components/ui/toaster";
import { Switch } from "@/components/ui/switch";
import { Bell, Zap, Map as MapIcon, Calendar, Megaphone, MessageCircle, CheckCircle2, AlertTriangle, Clock, AlertCircle, CalendarDays } from "lucide-react";
import type { NotificationPrefs } from "@/modules/user/user.schema";
import { useTranslations } from "next-intl";

interface NotificationSettingsProps {
  initialPrefs: NotificationPrefs;
  role?: "admin" | "teacher" | "student" | "manager";
}

export function NotificationSettings({ initialPrefs, role }: NotificationSettingsProps) {
  const t = useTranslations("Settings");
  const tc = useTranslations("Common");
  const [isPending, startTransition] = useTransition();

  const handleToggle = (key: keyof typeof initialPrefs, value: boolean) => {
    startTransition(async () => {
      const newPrefs = { ...initialPrefs, [key]: value };
      const result = await updateNotificationPrefsAction(newPrefs);
      
      if (result?.data?.success) {
        notify.success(tc("success"));
      } else {
        notify.error(tc("error"));
      }
    });
  };

  const isAdminOrManager = role === "admin" || role === "manager";

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{tc("notifications")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("notificationsDesc")}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <Zap className="w-4 h-4 text-orange-500" />
              {t("notifications.streak")}
            </div>
            <span className="text-sm text-muted-foreground">
              {t("notifications.streakDesc")}
            </span>
          </div>
          <Switch
            checked={initialPrefs.streak}
            onCheckedChange={(val) => handleToggle("streak", val)}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <MapIcon className="w-4 h-4 text-green-500" />
              {t("notifications.roadmap")}
            </div>
            <span className="text-sm text-muted-foreground">
              {t("notifications.roadmapDesc")}
            </span>
          </div>
          <Switch
            checked={initialPrefs.roadmap}
            onCheckedChange={(val) => handleToggle("roadmap", val)}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <Calendar className="w-4 h-4 text-blue-500" />
              {t("notifications.classes")}
            </div>
            <span className="text-sm text-muted-foreground">
              {t("notifications.classesDesc")}
            </span>
          </div>
          <Switch
            checked={initialPrefs.classes}
            onCheckedChange={(val) => handleToggle("classes", val)}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <Megaphone className="w-4 h-4 text-purple-500" />
              {t("notifications.marketing")}
            </div>
            <span className="text-sm text-muted-foreground">
              {t("notifications.marketingDesc")}
            </span>
          </div>
          <Switch
            checked={initialPrefs.marketing}
            onCheckedChange={(val) => handleToggle("marketing", val)}
            disabled={isPending}
          />
        </div>

        {isAdminOrManager && (
          <>
            <div className="border-t pt-6">
              <h4 className="font-bold text-md text-foreground mb-4">
                Notificações de Gestão e Operações
              </h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Pagamentos Efetuados
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Notificações in-app e push ao receber um pagamento (nome do aluno, valor e mês).
                    </span>
                  </div>
                  <Switch
                    checked={initialPrefs.paymentsMade ?? true}
                    onCheckedChange={(val) => handleToggle("paymentsMade", val)}
                    disabled={isPending}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      Pagamentos Atrasados / Pendentes
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Alertas sobre pagamentos atrasados ou cobranças pendentes (aluno, valor e mês).
                    </span>
                  </div>
                  <Switch
                    checked={initialPrefs.paymentsOverdue ?? true}
                    onCheckedChange={(val) => handleToggle("paymentsOverdue", val)}
                    disabled={isPending}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <CalendarDays className="w-4 h-4 text-indigo-500" />
                      Próximas Aulas / Aulas do Dia
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Avisos de aulas agendadas para o dia (professor, aluno, horário e dia).
                    </span>
                  </div>
                  <Switch
                    checked={initialPrefs.upcomingClasses ?? true}
                    onCheckedChange={(val) => handleToggle("upcomingClasses", val)}
                    disabled={isPending}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <Clock className="w-4 h-4 text-amber-500" />
                      Aulas Pendentes
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Alertas sobre aulas aguardando confirmação ou solicitação de reagendamento.
                    </span>
                  </div>
                  <Switch
                    checked={initialPrefs.pendingClasses ?? true}
                    onCheckedChange={(val) => handleToggle("pendingClasses", val)}
                    disabled={isPending}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      Aulas Não Atualizadas (Atenção)
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Notificações quando uma aula já finalizada não tiver presença/status preenchido pelo professor.
                    </span>
                  </div>
                  <Switch
                    checked={initialPrefs.unupdatedClasses ?? true}
                    onCheckedChange={(val) => handleToggle("unupdatedClasses", val)}
                    disabled={isPending}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <MessageCircle className="w-4 h-4 text-[#00a884]" />
                      {t("notifications.whatsapp")}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {t("notifications.whatsappDesc")}
                    </span>
                  </div>
                  <Switch
                    checked={initialPrefs.whatsapp ?? true}
                    onCheckedChange={(val) => handleToggle("whatsapp", val)}
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
