import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { TransactionItem } from "@/components/TransactionItem";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

type Timeframe = "7d" | "30d" | "90d" | "all" | "custom";

const TIMEFRAME_OPTIONS: { key: Timeframe; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "3M" },
  { key: "all", label: "All" },
  { key: "custom", label: "⚙" },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtShort(d: Date) {
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

type DatePickTarget = "start" | "end";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, bankAccounts, subscriptions, businessPlans } = useApp();

  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [customStart, setCustomStart] = useState(() => daysAgo(30));
  const [customEnd, setCustomEnd] = useState(() => new Date());
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [pickTarget, setPickTarget] = useState<DatePickTarget>("start");
  const [showPicker, setShowPicker] = useState(false);

  const filteredTransactions = useMemo(() => {
    let cutoff: Date | null = null;
    let ceiling: Date | null = null;

    if (timeframe === "7d") cutoff = daysAgo(7);
    else if (timeframe === "30d") cutoff = daysAgo(30);
    else if (timeframe === "90d") cutoff = daysAgo(90);
    else if (timeframe === "custom") {
      cutoff = customStart;
      ceiling = new Date(customEnd);
      ceiling.setHours(23, 59, 59, 999);
    }

    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (cutoff && d < cutoff) return false;
      if (ceiling && d > ceiling) return false;
      return true;
    });
  }, [transactions, timeframe, customStart, customEnd]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    const accountsBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
    const monthlyBills = subscriptions
      .filter((s) => s.isActive)
      .reduce((sum, s) => {
        if (s.billingCycle === "monthly") return sum + s.amount;
        if (s.billingCycle === "quarterly") return sum + s.amount / 3;
        if (s.billingCycle === "yearly") return sum + s.amount / 12;
        return sum;
      }, 0);
    return { income, expense, balance, accountsBalance, monthlyBills };
  }, [filteredTransactions, bankAccounts, subscriptions]);

  const recentTransactions = useMemo(
    () =>
      [...filteredTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [filteredTransactions],
  );

  const topROI = useMemo(() => {
    if (businessPlans.length === 0) return null;
    return businessPlans[businessPlans.length - 1];
  }, [businessPlans]);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  function openCustomPick(target: DatePickTarget) {
    setPickTarget(target);
    setShowPicker(true);
  }

  function handlePickerChange(_: unknown, selected?: Date) {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (selected) {
        if (pickTarget === "start") setCustomStart(selected);
        else setCustomEnd(selected);
      }
    } else {
      if (selected) {
        if (pickTarget === "start") setCustomStart(selected);
        else setCustomEnd(selected);
      }
    }
  }

  const customLabel =
    timeframe === "custom"
      ? `${fmtShort(customStart)} – ${fmtShort(customEnd)}`
      : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad + 16,
        paddingBottom: botPad + 100,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good day</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Your Finances</Text>
        </View>
        <TouchableOpacity
          style={[styles.settingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/settings")}
        >
          <Feather name="settings" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={colors.gradient}
        style={[styles.balanceCard, { borderRadius: colors.radius + 8 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.balanceCardTop}>
          <View>
            <Text style={styles.balanceLabel}>Net Balance</Text>
            {customLabel ? (
              <Text style={styles.customRangeLabel}>{customLabel}</Text>
            ) : null}
          </View>
          <View style={styles.timeframePills}>
            {TIMEFRAME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => {
                  setTimeframe(opt.key);
                  if (opt.key === "custom") setShowCustomModal(true);
                }}
                style={[
                  styles.pill,
                  timeframe === opt.key && styles.pillActive,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    timeframe === opt.key && styles.pillTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.balanceValue}>{formatCurrency(stats.balance)}</Text>

        <View style={styles.balanceRow}>
          <View style={styles.balanceStat}>
            <View style={styles.balanceStatIcon}>
              <Feather name="arrow-down-left" size={12} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.balanceStatLabel}>Income</Text>
            <Text style={styles.balanceStatValue}>{formatCurrency(stats.income)}</Text>
          </View>
          <View style={[styles.balanceDivider, { backgroundColor: "rgba(255,255,255,0.2)" }]} />
          <View style={styles.balanceStat}>
            <View style={styles.balanceStatIcon}>
              <Feather name="arrow-up-right" size={12} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.balanceStatLabel}>Expenses</Text>
            <Text style={styles.balanceStatValue}>{formatCurrency(stats.expense)}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatCard label="Accounts Balance" value={formatCurrency(stats.accountsBalance)} icon="layers" color={colors.success} />
        <StatCard label="Monthly Bills" value={formatCurrency(stats.monthlyBills)} icon="repeat" color={colors.destructive} />
        <StatCard label="Business Plans" value={businessPlans.length.toString()} icon="briefcase" color={colors.primary} />
      </View>

      {topROI ? (
        <>
          <SectionHeader title="Latest Business Plan" />
          <TouchableOpacity
            style={[styles.roiCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            onPress={() => router.push("/(tabs)/roi")}
            activeOpacity={0.8}
          >
            <View style={styles.roiCardRow}>
              <View style={[styles.roiIcon, { backgroundColor: colors.accent, borderRadius: colors.radius / 2 }]}>
                <Feather name="briefcase" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.roiName, { color: colors.foreground }]}>{topROI.name}</Text>
                <Text style={[styles.roiMeta, { color: colors.mutedForeground }]}>
                  Capital: {formatCurrency(topROI.initialCapital)} · {topROI.timePeriodMonths}mo
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
        </>
      ) : null}

      <SectionHeader
        title="Recent Transactions"
        actionLabel="See all"
        onAction={() => router.push("/(tabs)/transactions")}
      />

      {recentTransactions.length === 0 ? (
        <EmptyState
          icon="credit-card"
          title="No transactions"
          subtitle={
            timeframe === "custom"
              ? `No transactions between ${fmtShort(customStart)} and ${fmtShort(customEnd)}.`
              : timeframe !== "all"
                ? "No transactions in this period. Try a wider timeframe."
                : "Add your first income or expense to get started"
          }
        />
      ) : (
        recentTransactions.map((t) => (
          <TransactionItem
            key={t.id}
            transactionId={t.id}
            onPress={() => router.push({ pathname: "/transaction/[id]", params: { id: t.id } })}
          />
        ))
      )}

      {/* Custom Date Range Modal */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <Text style={[styles.modalAction, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Custom Range</Text>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <Text style={[styles.modalAction, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.customRangeBody}>
              <Text style={[styles.customRangeHint, { color: colors.mutedForeground }]}>
                Select a start and end date to filter transactions.
              </Text>

              <TouchableOpacity
                style={[styles.dateRow, { backgroundColor: colors.muted, borderRadius: colors.radius }]}
                onPress={() => openCustomPick("start")}
              >
                <Feather name="calendar" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dateRowLabel, { color: colors.mutedForeground }]}>Start Date</Text>
                  <Text style={[styles.dateRowValue, { color: colors.foreground }]}>{fmtShort(customStart)}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateRow, { backgroundColor: colors.muted, borderRadius: colors.radius, marginTop: 10 }]}
                onPress={() => openCustomPick("end")}
              >
                <Feather name="calendar" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dateRowLabel, { color: colors.mutedForeground }]}>End Date</Text>
                  <Text style={[styles.dateRowValue, { color: colors.foreground }]}>{fmtShort(customEnd)}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>

              {Platform.OS === "android" && showPicker && (
                <DateTimePicker
                  value={pickTarget === "start" ? customStart : customEnd}
                  mode="date"
                  display="default"
                  onChange={handlePickerChange}
                />
              )}

              {Platform.OS === "ios" && showPicker && (
                <DateTimePicker
                  value={pickTarget === "start" ? customStart : customEnd}
                  mode="date"
                  display="spinner"
                  onChange={handlePickerChange}
                  style={{ width: "100%" }}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginTop: 2 },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  balanceCard: { padding: 20, marginBottom: 16 },
  balanceCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    paddingTop: 2,
  },
  customRangeLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  timeframePills: { flexDirection: "row", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  pillActive: { backgroundColor: "rgba(255,255,255,0.35)" },
  pillText: { color: "rgba(255,255,255,0.65)", fontSize: 10, fontFamily: "Inter_500Medium" },
  pillTextActive: { color: "#ffffff", fontFamily: "Inter_700Bold" },
  balanceValue: {
    color: "#ffffff",
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    marginBottom: 18,
    marginTop: 8,
  },
  balanceRow: { flexDirection: "row", alignItems: "center" },
  balanceStat: { flex: 1, alignItems: "center", gap: 4 },
  balanceStatIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceDivider: { width: 1, height: 44, marginHorizontal: 16 },
  balanceStatLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_400Regular" },
  balanceStatValue: { color: "#ffffff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  roiCard: { padding: 14, borderWidth: 1, marginBottom: 24 },
  roiCardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  roiIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  roiName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  roiMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, overflow: "hidden" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  modalAction: { fontSize: 15, fontFamily: "Inter_500Medium" },
  customRangeBody: { padding: 20, paddingBottom: 36 },
  customRangeHint: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  dateRowLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  dateRowValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginTop: 2 },
});
