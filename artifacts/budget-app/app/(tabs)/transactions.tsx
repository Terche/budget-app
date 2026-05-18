import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { TransactionItem } from "@/components/TransactionItem";
import { useApp, Subscription } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

const TX_FILTERS = ["All", "Income", "Expense"] as const;
type TxFilter = (typeof TX_FILTERS)[number];
type MainTab = "transactions" | "subscriptions";

const DATE_PRESETS = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "3m", label: "Last 3M" },
  { key: "year", label: "This Year" },
] as const;
type DatePreset = (typeof DATE_PRESETS)[number]["key"];

function getDateRange(preset: DatePreset): { from: string | null; to: string | null } {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  if (preset === "all") return { from: null, to: null };
  if (preset === "today") return { from: today, to: today };
  if (preset === "week") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    return { from: from.toISOString().split("T")[0], to: today };
  }
  if (preset === "month") {
    return { from: `${today.slice(0, 7)}-01`, to: today };
  }
  if (preset === "3m") {
    const from = new Date(now);
    from.setMonth(from.getMonth() - 3);
    return { from: from.toISOString().split("T")[0], to: today };
  }
  if (preset === "year") {
    return { from: `${today.slice(0, 4)}-01-01`, to: today };
  }
  return { from: null, to: null };
}

function nextBillingDate(billingDay: number): Date {
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), billingDay);
  if (thisMonth >= today) return thisMonth;
  return new Date(today.getFullYear(), today.getMonth() + 1, billingDay);
}

function cycleLabel(cycle: string) {
  if (cycle === "monthly") return "Monthly";
  if (cycle === "quarterly") return "Every 3 months";
  if (cycle === "yearly") return "Yearly";
  return cycle;
}

function totalPaid(sub: Subscription): number {
  if (!sub.startDate) return 0;
  const start = new Date(sub.startDate);
  const now = new Date();
  if (start > now) return 0;
  const totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (sub.billingCycle === "monthly") return Math.max(0, totalMonths) * sub.amount;
  if (sub.billingCycle === "quarterly") return Math.max(0, Math.floor(totalMonths / 3)) * sub.amount;
  if (sub.billingCycle === "yearly") return Math.max(0, Math.floor(totalMonths / 12)) * sub.amount;
  return 0;
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

export default function TransactionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    transactions, categories, expenseGroups, subscriptions,
    deleteSubscription, updateSubscription, duplicateTransaction,
  } = useApp();

  const [mainTab, setMainTab] = useState<MainTab>("transactions");
  const [typeFilter, setTypeFilter] = useState<TxFilter>("All");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const dateRange = useMemo(() => getDateRange(datePreset), [datePreset]);

  const visibleCategories = useMemo(() => {
    if (typeFilter === "Income") return categories.filter((c) => c.id === "c8" || transactions.some((t) => t.type === "income" && t.categoryId === c.id));
    if (typeFilter === "Expense") return categories.filter((c) => transactions.some((t) => t.type === "expense" && t.categoryId === c.id));
    return categories;
  }, [typeFilter, categories, transactions]);

  function toggleCategory(id: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return [...transactions]
      .filter((t) => {
        if (typeFilter === "Income" && t.type !== "income") return false;
        if (typeFilter === "Expense" && t.type !== "expense") return false;
        if (selectedGroup !== "all" && t.groupId !== selectedGroup) return false;
        if (selectedCategories.size > 0 && !selectedCategories.has(t.categoryId)) return false;
        if (dateRange.from && t.date < dateRange.from) return false;
        if (dateRange.to && t.date > dateRange.to) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, selectedGroup, selectedCategories, dateRange]);

  const txTotals = useMemo(() => {
    const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  const monthlySubTotal = useMemo(
    () => subscriptions.filter((s) => s.isActive).reduce((sum, s) => {
      if (s.billingCycle === "monthly") return sum + s.amount;
      if (s.billingCycle === "quarterly") return sum + s.amount / 3;
      if (s.billingCycle === "yearly") return sum + s.amount / 12;
      return sum;
    }, 0),
    [subscriptions],
  );

  const activeFilterCount = (typeFilter !== "All" ? 1 : 0) + (selectedCategories.size) + (selectedGroup !== "all" ? 1 : 0) + (datePreset !== "all" ? 1 : 0);

  function handleDeleteSub(id: string, name: string) {
    Alert.alert("Delete Subscription", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteSubscription(id) },
    ]);
  }

  function clearFilters() {
    setTypeFilter("All");
    setSelectedCategories(new Set());
    setSelectedGroup("all");
    setDatePreset("all");
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.background, borderBottomColor: colors.border, paddingTop: topPad + 16 }]}>
        <View>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            {mainTab === "transactions" ? "Transactions" : "Subscriptions"}
          </Text>
          {mainTab === "transactions" && activeFilterCount > 0 && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersBtn}>
              <Feather name="x" size={10} color={colors.primary} />
              <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push(mainTab === "transactions" ? "/transaction/new" : "/subscription/new")}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.mainTabRow, { borderBottomColor: colors.border }]}>
        {(["transactions", "subscriptions"] as MainTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.mainTabBtn, mainTab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setMainTab(t)}
          >
            <Feather name={t === "transactions" ? "list" : "repeat"} size={14} color={mainTab === t ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.mainTabText, { color: mainTab === t ? colors.primary : colors.mutedForeground }]}>
              {t === "transactions" ? "Transactions" : "Subscriptions"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mainTab === "transactions" ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterRow, { borderBottomColor: colors.border }]} contentContainerStyle={styles.filterRowContent}>
            {TX_FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, typeFilter === f && { backgroundColor: colors.primary }]}
                onPress={() => { setTypeFilter(f); setSelectedCategories(new Set()); }}
              >
                <Text style={[styles.filterChipText, { color: typeFilter === f ? "#fff" : colors.mutedForeground }]}>{f}</Text>
              </TouchableOpacity>
            ))}
            <View style={[styles.filterDivider, { backgroundColor: colors.border }]} />
            {DATE_PRESETS.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[styles.filterChip, datePreset === p.key && { backgroundColor: colors.accent, borderColor: colors.primary }]}
                onPress={() => setDatePreset(p.key)}
              >
                <Text style={[styles.filterChipText, { color: datePreset === p.key ? colors.primary : colors.mutedForeground }]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {visibleCategories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow} contentContainerStyle={styles.categoryRowContent}>
              {expenseGroups.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.groupChip, selectedGroup === g.id && { backgroundColor: g.color + "22", borderColor: g.color }, { borderColor: colors.border }]}
                  onPress={() => setSelectedGroup((prev) => (prev === g.id ? "all" : g.id))}
                >
                  <View style={[styles.groupDot, { backgroundColor: g.color }]} />
                  <Text style={[styles.groupChipText, { color: selectedGroup === g.id ? g.color : colors.mutedForeground }]}>{g.name}</Text>
                </TouchableOpacity>
              ))}
              {visibleCategories.map((c) => {
                const active = selectedCategories.has(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catChip, active && { backgroundColor: c.color + "22", borderColor: c.color }, { borderColor: colors.border }]}
                    onPress={() => toggleCategory(c.id)}
                  >
                    {active && <Feather name="check" size={10} color={c.color} />}
                    <Text style={[styles.catChipText, { color: active ? c.color : colors.mutedForeground }]}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {filtered.length > 0 && (
            <View style={[styles.totalsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.totalsCell}>
                <Text style={[styles.totalsLabel, { color: colors.mutedForeground }]}>Income</Text>
                <Text style={[styles.totalsValue, { color: colors.success }]}>{formatCurrency(txTotals.income)}</Text>
              </View>
              <View style={[styles.totalsDivider, { backgroundColor: colors.border }]} />
              <View style={styles.totalsCell}>
                <Text style={[styles.totalsLabel, { color: colors.mutedForeground }]}>Expenses</Text>
                <Text style={[styles.totalsValue, { color: colors.destructive }]}>{formatCurrency(txTotals.expense)}</Text>
              </View>
              <View style={[styles.totalsDivider, { backgroundColor: colors.border }]} />
              <View style={styles.totalsCell}>
                <Text style={[styles.totalsLabel, { color: colors.mutedForeground }]}>Net</Text>
                <Text style={[styles.totalsValue, { color: txTotals.net >= 0 ? colors.success : colors.destructive }]}>
                  {txTotals.net >= 0 ? "+" : ""}{formatCurrency(txTotals.net)}
                </Text>
              </View>
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            scrollEnabled={filtered.length > 0}
            renderItem={({ item }) => (
              <TransactionItem
                transactionId={item.id}
                onPress={() => router.push({ pathname: "/transaction/[id]", params: { id: item.id } })}
                onDuplicate={() => {
                  const newId = duplicateTransaction(item.id);
                  if (newId) router.push({ pathname: "/transaction/[id]", params: { id: newId } });
                }}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="credit-card"
                title={activeFilterCount > 0 ? "No matching transactions" : "No transactions"}
                subtitle={activeFilterCount > 0 ? "Try adjusting your filters" : "Tap + to add your first transaction"}
              />
            }
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: botPad + 100 }}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: botPad + 100 }}
        >
          {subscriptions.length > 0 && (
            <View style={[styles.subSummary, { backgroundColor: colors.destructive + "14", borderColor: colors.destructive + "40" }]}>
              <Feather name="repeat" size={20} color={colors.destructive} />
              <View>
                <Text style={[styles.subSummaryLabel, { color: colors.mutedForeground }]}>Monthly cost (active)</Text>
                <Text style={[styles.subSummaryValue, { color: colors.destructive }]}>{formatCurrency(monthlySubTotal)}/mo</Text>
              </View>
              <View style={{ marginLeft: "auto" }}>
                <Text style={[styles.subSummaryLabel, { color: colors.mutedForeground }]}>Active</Text>
                <Text style={[styles.subSummaryValue, { color: colors.foreground }]}>
                  {subscriptions.filter((s) => s.isActive).length}/{subscriptions.length}
                </Text>
              </View>
            </View>
          )}

          {subscriptions.length === 0 ? (
            <EmptyState icon="repeat" title="No subscriptions" subtitle="Track Netflix, rent, utilities, and any recurring monthly bills" />
          ) : (
            subscriptions.map((sub) => {
              const nextDate = nextBillingDate(sub.billingDay);
              const daysUntil = Math.ceil((nextDate.getTime() - Date.now()) / 86400000);
              return (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.subCard, { backgroundColor: colors.card, borderColor: sub.color + "55", borderLeftColor: sub.color, opacity: sub.isActive ? 1 : 0.55 }]}
                  activeOpacity={0.88}
                  onPress={() => router.push({ pathname: "/subscription/[id]", params: { id: sub.id } })}
                >
                  <View style={styles.subCardHeader}>
                    <View style={styles.subCardLeft}>
                      <View style={[styles.subColorDot, { backgroundColor: sub.color + "33" }]}>
                        <Feather name="repeat" size={16} color={sub.color} />
                      </View>
                      <View>
                        <Text style={[styles.subName, { color: colors.foreground }]}>{sub.name}</Text>
                        <Text style={[styles.subMeta, { color: colors.mutedForeground }]}>
                          {cycleLabel(sub.billingCycle)} · day {sub.billingDay}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.subCardRight}>
                      <Text style={[styles.subAmount, { color: sub.color }]}>{formatCurrency(sub.amount)}</Text>
                      <View style={styles.subActions}>
                        <TouchableOpacity
                          onPress={() => updateSubscription({ ...sub, isActive: !sub.isActive })}
                          style={[styles.subToggle, { backgroundColor: sub.isActive ? colors.success + "22" : colors.border }]}
                        >
                          <Feather name={sub.isActive ? "pause" : "play"} size={11} color={sub.isActive ? colors.success : colors.mutedForeground} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteSub(sub.id, sub.name)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                          <Feather name="trash-2" size={13} color={colors.destructive} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.subFooter, { borderTopColor: colors.border }]}>
                    {sub.isActive ? (
                      <View style={styles.subFooterLeft}>
                        <Feather name="calendar" size={12} color={daysUntil <= 3 ? colors.destructive : colors.mutedForeground} />
                        <Text style={[styles.subNextBillText, { color: daysUntil <= 3 ? colors.destructive : colors.mutedForeground }]}>
                          {daysUntil === 0 ? "Due today!" : daysUntil === 1 ? "Due tomorrow" : `Due in ${daysUntil} days · ${nextDate.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}`}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.subFooterLeft}>
                        <Feather name="pause-circle" size={12} color={colors.mutedForeground} />
                        <Text style={[styles.subNextBillText, { color: colors.mutedForeground }]}>Paused</Text>
                      </View>
                    )}
                    {sub.startDate ? (
                      <View style={styles.subFooterRight}>
                        <Feather name="clock" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.subNextBillText, { color: colors.mutedForeground }]}>Since {fmtDate(sub.startDate)}</Text>
                        {totalPaid(sub) > 0 && (
                          <Text style={[styles.subNextBillText, { color: sub.color, fontFamily: "Inter_600SemiBold" }]}>
                            {` · ${formatCurrency(totalPaid(sub))} total`}
                          </Text>
                        )}
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heading: { fontSize: 28, fontFamily: "Inter_700Bold" },
  clearFiltersBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  clearFiltersText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  addBtn: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 4 },
  mainTabRow: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  mainTabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  mainTabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  filterRow: { flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth },
  filterRowContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: "center" },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  filterDivider: { width: 1, height: 24, marginHorizontal: 4 },
  categoryRow: { flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth },
  categoryRowContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: "center" },
  groupChip: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, gap: 6,
  },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  catChip: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, gap: 4,
  },
  catChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  totalsBar: {
    flexDirection: "row", marginHorizontal: 20, marginTop: 10, borderRadius: 12,
    borderWidth: 1, paddingVertical: 10,
  },
  totalsCell: { flex: 1, alignItems: "center" },
  totalsLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  totalsValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
  totalsDivider: { width: 1, marginVertical: 4 },
  subSummary: {
    flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16,
    padding: 18, borderWidth: 1, marginBottom: 20,
  },
  subSummaryLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 3 },
  subSummaryValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  subCard: { borderRadius: 16, borderWidth: 1, borderLeftWidth: 4, marginBottom: 12, overflow: "hidden" },
  subCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  subCardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  subColorDot: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  subName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  subMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  subCardRight: { alignItems: "flex-end", gap: 8 },
  subAmount: { fontSize: 17, fontFamily: "Inter_700Bold" },
  subActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  subToggle: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  subFooter: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingVertical: 8,
  },
  subFooterLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  subFooterRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  subNextBillText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
