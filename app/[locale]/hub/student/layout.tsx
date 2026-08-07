import { requireRole } from "@/lib/auth-server";
import { UserRoles } from "@/lib/rbac";
import { billingService } from "@/modules/billing/billing.service";
import { PaymentOverdueBanner } from "./_components/PaymentOverdueBanner";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(UserRoles.STUDENT);
  const paymentStatus = await billingService.getStudentPaymentStatus(user.id);
  const currentInstallment = paymentStatus?.currentInstallment;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isOverdue =
    currentInstallment?.status === "overdue" ||
    (currentInstallment?.status === "pending" &&
      new Date(currentInstallment.dueDate) < todayStart);

  return (
    // h-full (e não min-h-full) dá altura definida à cadeia. Com min-h-full a
    // altura era automática, então páginas que usam layout de altura cheia —
    // como o player de curso — não conseguiam resolver o próprio `h-full` e
    // acabavam rolando por inteiro, sidebar junto.
    <div className="flex flex-col h-full w-full">
      {isOverdue && <PaymentOverdueBanner />}
      {/* O scroll das páginas do aluno acontece aqui. min-h-0 é o que permite
          este filho encolher e de fato rolar em vez de esticar o pai. */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
