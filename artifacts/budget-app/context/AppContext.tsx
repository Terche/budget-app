import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Category {
  id: string;
  name: string;
  groupId: string;
  color: string;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  categoryId: string;
  groupId: string;
  notes: string;
  description: string;
}

export type SavingsFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "custom";

export interface SavingsPlan {
  id: string;
  name: string;
  startDate: string;
  contributionAmount: number;
  isActive: boolean;
  frequency: SavingsFrequency;
  customDays?: number;
}

export interface SavingsEntry {
  id: string;
  planId: string;
  date: string;
  amount: number;
  isManual: boolean;
  notes: string;
}

export interface BusinessPlan {
  id: string;
  name: string;
  initialCapital: number;
  expectedRevenue: number;
  timePeriodMonths: number;
  linkedSavingsPlanId?: string;
  createdAt: string;
  expenses: BusinessExpense[];
}

export interface BusinessExpense {
  id: string;
  description: string;
  amount: number;
  isRecurring: boolean;
}

interface AppState {
  transactions: Transaction[];
  categories: Category[];
  expenseGroups: ExpenseGroup[];
  savingsPlans: SavingsPlan[];
  savingsEntries: SavingsEntry[];
  businessPlans: BusinessPlan[];
}

interface AppContextType extends AppState {
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  deleteCategory: (id: string) => void;
  addExpenseGroup: (g: Omit<ExpenseGroup, "id">) => void;
  deleteExpenseGroup: (id: string) => void;
  addSavingsPlan: (p: Omit<SavingsPlan, "id">) => void;
  updateSavingsPlan: (p: SavingsPlan) => void;
  deleteSavingsPlan: (id: string) => void;
  addSavingsEntry: (e: Omit<SavingsEntry, "id">) => void;
  updateSavingsEntry: (e: SavingsEntry) => void;
  deleteSavingsEntry: (id: string) => void;
  generateSavingsEntries: (planId: string) => void;
  addBusinessPlan: (p: Omit<BusinessPlan, "id" | "createdAt">) => void;
  updateBusinessPlan: (p: BusinessPlan) => void;
  deleteBusinessPlan: (id: string) => void;
}

const STORAGE_KEY = "budget_app_data_v2";

const defaultGroups: ExpenseGroup[] = [
  { id: "g1", name: "Personal", color: "#8b5cf6" },
  { id: "g2", name: "Business", color: "#1e40af" },
  { id: "g3", name: "Household", color: "#10b981" },
];

const defaultCategories: Category[] = [
  { id: "c1", name: "Food & Dining", groupId: "g1", color: "#f97316" },
  { id: "c2", name: "Transportation", groupId: "g1", color: "#6366f1" },
  { id: "c3", name: "Entertainment", groupId: "g1", color: "#ec4899" },
  { id: "c4", name: "Marketing", groupId: "g2", color: "#1e40af" },
  { id: "c5", name: "Supplies", groupId: "g2", color: "#0891b2" },
  { id: "c6", name: "Rent", groupId: "g3", color: "#10b981" },
  { id: "c7", name: "Utilities", groupId: "g3", color: "#84cc16" },
  { id: "c8", name: "Salary", groupId: "g1", color: "#10b981" },
];

const defaultState: AppState = {
  transactions: [],
  categories: defaultCategories,
  expenseGroups: defaultGroups,
  savingsPlans: [],
  savingsEntries: [],
  businessPlans: [],
};

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as AppState;
          setState({
            ...defaultState,
            ...parsed,
            categories:
              parsed.categories?.length > 0
                ? parsed.categories
                : defaultCategories,
            expenseGroups:
              parsed.expenseGroups?.length > 0
                ? parsed.expenseGroups
                : defaultGroups,
          });
        } catch {
          // ignore parse errors
        }
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((newState: AppState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const update = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setState((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const addTransaction = useCallback(
    (t: Omit<Transaction, "id">) => {
      update((s) => ({
        ...s,
        transactions: [{ ...t, id: genId() }, ...s.transactions],
      }));
    },
    [update],
  );

  const updateTransaction = useCallback(
    (t: Transaction) => {
      update((s) => ({
        ...s,
        transactions: s.transactions.map((x) => (x.id === t.id ? t : x)),
      }));
    },
    [update],
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      update((s) => ({
        ...s,
        transactions: s.transactions.filter((x) => x.id !== id),
      }));
    },
    [update],
  );

  const addCategory = useCallback(
    (c: Omit<Category, "id">) => {
      update((s) => ({
        ...s,
        categories: [...s.categories, { ...c, id: genId() }],
      }));
    },
    [update],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      update((s) => ({
        ...s,
        categories: s.categories.filter((x) => x.id !== id),
      }));
    },
    [update],
  );

  const addExpenseGroup = useCallback(
    (g: Omit<ExpenseGroup, "id">) => {
      update((s) => ({
        ...s,
        expenseGroups: [...s.expenseGroups, { ...g, id: genId() }],
      }));
    },
    [update],
  );

  const deleteExpenseGroup = useCallback(
    (id: string) => {
      update((s) => ({
        ...s,
        expenseGroups: s.expenseGroups.filter((x) => x.id !== id),
      }));
    },
    [update],
  );

  const addSavingsPlan = useCallback(
    (p: Omit<SavingsPlan, "id">) => {
      update((s) => ({
        ...s,
        savingsPlans: [...s.savingsPlans, { ...p, id: genId() }],
      }));
    },
    [update],
  );

  const updateSavingsPlan = useCallback(
    (p: SavingsPlan) => {
      update((s) => ({
        ...s,
        savingsPlans: s.savingsPlans.map((x) => (x.id === p.id ? p : x)),
      }));
    },
    [update],
  );

  const deleteSavingsPlan = useCallback(
    (id: string) => {
      update((s) => ({
        ...s,
        savingsPlans: s.savingsPlans.filter((x) => x.id !== id),
        savingsEntries: s.savingsEntries.filter((x) => x.planId !== id),
      }));
    },
    [update],
  );

  const addSavingsEntry = useCallback(
    (e: Omit<SavingsEntry, "id">) => {
      update((s) => ({
        ...s,
        savingsEntries: [...s.savingsEntries, { ...e, id: genId() }],
      }));
    },
    [update],
  );

  const updateSavingsEntry = useCallback(
    (e: SavingsEntry) => {
      update((s) => ({
        ...s,
        savingsEntries: s.savingsEntries.map((x) => (x.id === e.id ? e : x)),
      }));
    },
    [update],
  );

  const deleteSavingsEntry = useCallback(
    (id: string) => {
      update((s) => ({
        ...s,
        savingsEntries: s.savingsEntries.filter((x) => x.id !== id),
      }));
    },
    [update],
  );

  const generateSavingsEntries = useCallback(
    (planId: string) => {
      update((s) => {
        const plan = s.savingsPlans.find((p) => p.id === planId);
        if (!plan) return s;

        const existingEntries = s.savingsEntries.filter(
          (e) => e.planId === planId && !e.isManual,
        );
        const existingDates = new Set(existingEntries.map((e) => e.date));

        const today = new Date();
        const start = new Date(plan.startDate);
        const newEntries: SavingsEntry[] = [];

        const freq = plan.frequency ?? "biweekly";
        const customDays = plan.customDays ?? 14;

        function nextDate(d: Date): Date {
          const n = new Date(d);
          if (freq === "daily") n.setDate(n.getDate() + 1);
          else if (freq === "weekly") n.setDate(n.getDate() + 7);
          else if (freq === "biweekly") n.setDate(n.getDate() + 14);
          else if (freq === "monthly") n.setMonth(n.getMonth() + 1);
          else n.setDate(n.getDate() + customDays);
          return n;
        }

        let current = new Date(start);
        while (current <= today) {
          const dateStr = current.toISOString().split("T")[0];
          if (!existingDates.has(dateStr)) {
            newEntries.push({
              id: genId(),
              planId,
              date: dateStr,
              amount: plan.contributionAmount,
              isManual: false,
              notes: "Auto-generated",
            });
          }
          current = nextDate(current);
        }

        return {
          ...s,
          savingsEntries: [...s.savingsEntries, ...newEntries],
        };
      });
    },
    [update],
  );

  const addBusinessPlan = useCallback(
    (p: Omit<BusinessPlan, "id" | "createdAt">) => {
      update((s) => ({
        ...s,
        businessPlans: [
          ...s.businessPlans,
          { ...p, id: genId(), createdAt: new Date().toISOString() },
        ],
      }));
    },
    [update],
  );

  const updateBusinessPlan = useCallback(
    (p: BusinessPlan) => {
      update((s) => ({
        ...s,
        businessPlans: s.businessPlans.map((x) => (x.id === p.id ? p : x)),
      }));
    },
    [update],
  );

  const deleteBusinessPlan = useCallback(
    (id: string) => {
      update((s) => ({
        ...s,
        businessPlans: s.businessPlans.filter((x) => x.id !== id),
      }));
    },
    [update],
  );

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        ...state,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        deleteCategory,
        addExpenseGroup,
        deleteExpenseGroup,
        addSavingsPlan,
        updateSavingsPlan,
        deleteSavingsPlan,
        addSavingsEntry,
        updateSavingsEntry,
        deleteSavingsEntry,
        generateSavingsEntries,
        addBusinessPlan,
        updateBusinessPlan,
        deleteBusinessPlan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
