import { Transaction, SavingsEntry, BusinessPlan } from "@/context/AppContext";

export function transactionsToCSV(transactions: Transaction[]): string {
  const header = "id,amount,date,type,categoryId,groupId,description,notes";
  const rows = transactions.map((t) =>
    [
      t.id,
      t.amount,
      t.date,
      t.type,
      t.categoryId,
      t.groupId,
      `"${t.description?.replace(/"/g, '""') ?? ""}"`,
      `"${t.notes?.replace(/"/g, '""') ?? ""}"`,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export function savingsToCSV(entries: SavingsEntry[]): string {
  const header = "id,planId,date,amount,isManual,notes";
  const rows = entries.map((e) =>
    [
      e.id,
      e.planId,
      e.date,
      e.amount,
      e.isManual,
      `"${e.notes?.replace(/"/g, '""') ?? ""}"`,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export function businessPlansToCSV(plans: BusinessPlan[]): string {
  const header =
    "id,name,initialCapital,expectedRevenue,timePeriodMonths,createdAt";
  const rows = plans.map((p) =>
    [
      p.id,
      `"${p.name?.replace(/"/g, '""') ?? ""}"`,
      p.initialCapital,
      p.expectedRevenue,
      p.timePeriodMonths,
      p.createdAt,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += line[i];
      }
    }
    values.push(current.trim());

    return headers.reduce(
      (obj, header, idx) => {
        obj[header] = values[idx] ?? "";
        return obj;
      },
      {} as Record<string, string>,
    );
  });
}
