import { Transaction } from "./finance.schema";
import { Installment, Subscription, Plan } from "../billing/billing.schema";
import { User } from "../user/user.schema";

export interface FinanceMetrics {
  revenue: {
    total: number;
    installments: number;
    extra: number;
  };
  expenses: {
    total: number;
    payouts: number;
    extra: number;
    deductible: number;
  };
  fiscal: {
    exemptProfit: number;
    taxableProfit: number;
    irpfDue: number;
    meiExemptPercentage: number;
  };
  netProfit: number;
}

export interface TeacherPayoutProjection {
  classCount: number;
  projectedAmount: number;
  completedOrNoShowAmount: number;
  scheduledAmount: number;
}

export interface AIExpenseProjection {
  estimatedCost: number;
  source: "usage" | "estimate";
  details?: {
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface FinanceForecast {
  installments: number;
  pendingExpenses: number;
  teacherPayoutProjection?: TeacherPayoutProjection;
  aiExpenseProjection?: AIExpenseProjection;
}

export interface MonthlyBreakdownItem {
  month: number;
  revenue: number;
  installments: number;
  extraRevenue: number;
  expenses: number;
  teacherPayouts: number;
  extraExpenses: number;
  aiCost: number;
  netProfit: number;
}

export type InstallmentWithDetails = Installment & {
  subscription: (Subscription & {
    student: User | null;
    plan: Plan | null;
  }) | null;
};

export interface DetailedForecast {
  installments: InstallmentWithDetails[];
  pendingExpenses: Transaction[];
}

export interface MEICapacity {
  currentStudents: number;
  maxStudents: number;
  availableSlots: number;
  revenueLimit: number;
  currentRevenue: number;
  remainingRevenue: number;
  averageTicket: number;
}

export interface UnifiedTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  date: Date;
  description: string;
  category: string;
  method: string | null;
  deductible: boolean;
  status: "paid" | "pending" | "cancelled";
  attachmentUrl?: string | null;
  source: "student_payment" | "teacher_payout" | "manual";
}

