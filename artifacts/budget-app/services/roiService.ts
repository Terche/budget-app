import { BusinessPlan } from "@/context/AppContext";

export interface ROIResult {
  totalExpenses: number;
  netProfit: number;
  roiPercentage: number;
  breakEvenMonths: number | null;
  status: "profit" | "loss" | "break_even";
  monthlyRevenue: number;
  monthlyExpenses: number;
  projectedMonthlyProfit: number;
}

export function calculateROI(plan: BusinessPlan): ROIResult {
  const totalExpenses = plan.expenses.reduce((sum, e) => {
    if (e.isRecurring) {
      return sum + e.amount * plan.timePeriodMonths;
    }
    return sum + e.amount;
  }, 0);

  const totalRevenue = plan.expectedRevenue * plan.timePeriodMonths;
  const netProfit = totalRevenue - totalExpenses - plan.initialCapital;
  const roiPercentage =
    plan.initialCapital > 0
      ? ((netProfit / plan.initialCapital) * 100)
      : 0;

  const monthlyExpenses = totalExpenses / plan.timePeriodMonths;
  const monthlyRevenue = plan.expectedRevenue;
  const projectedMonthlyProfit = monthlyRevenue - monthlyExpenses;

  let breakEvenMonths: number | null = null;
  if (projectedMonthlyProfit > 0) {
    breakEvenMonths = Math.ceil(plan.initialCapital / projectedMonthlyProfit);
  }

  let status: "profit" | "loss" | "break_even";
  if (netProfit > 0) {
    status = "profit";
  } else if (netProfit < 0) {
    status = "loss";
  } else {
    status = "break_even";
  }

  return {
    totalExpenses,
    netProfit,
    roiPercentage,
    breakEvenMonths,
    status,
    monthlyRevenue,
    monthlyExpenses,
    projectedMonthlyProfit,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}
