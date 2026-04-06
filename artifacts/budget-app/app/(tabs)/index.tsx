import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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

type Timeframe = "7d" | "30d" | "90d" | "all";

const TIMEFRAME_OPTIONS: { key: Timeframe; label: string }[] = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "3 Months" },
  { key: "all", label: "All Time" },
];

function cutoffDate(tf: Timeframe): Date | null {
  if (tf === "all") return null;
  const days = tf === "7d" ? 7 : tf === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, savingsEntries, businessPlans } = useApp();
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");

  const filteredTransactions = useMemo(() => {
    const cutoff = cutoffDate(timeframe);
    if (!cutoff) return transactions;
    return transactions.filter((t) => new Date(t.date) >= cutoff);
  }, [transactions, timeframe]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    const savings = savingsEntries.reduce((sum, e) => sum + e.amount, 0);
    return { income, expense, balance, savings };
  }, [filteredTransactions, savingsEntries]);

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
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Good day
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Your Finances
          </Text>
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
          <Text style={styles.balanceLabel}>Net Balance</Text>
          <View style={styles.timeframePills}>
            {TIMEFRAME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setTimeframe(opt.key)}
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
        <StatCard
          label="Total Savings"
          value={formatCurrency(stats.savings)}
          icon="trending-up"
          color={colors.success}
        />
        <StatCard
          label="Business Plans"
          value={businessPlans.length.toString()}
          icon="briefcase"
          color={colors.primary}
        />
      </View>

      {topROI ? (
        <>
          <SectionHeader title="Latest Business Plan" />
          <TouchableOpacity
            style={[
              styles.roiCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
            onPress={() => router.push("/(tabs)/roi")}
            activeOpacity={0.8}
          >
            <View style={styles.roiCardRow}>
              <View style={[styles.roiIcon, { backgroundColor: colors.accent, borderRadius: colors.radius / 2 }]}>
                <Feather name="briefcase" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.roiName, { color: colors.foreground }]}>
                  {topROI.name}
                </Text>
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
          title="No transactions yet"
          subtitle={
            timeframe !== "all"
              ? `No transactions in the last ${TIMEFRAME_OPTIONS.find((o) => o.key === timeframe)?.label.toLowerCase()}. Try changing the timeframe.`
              : "Add your first income or expense to get started"
          }
        />
      ) : (
        recentTransactions.map((t) => (
          <TransactionItem
            key={t.id}
            transactionId={t.id}
            onPress={() =>
              router.push({ pathname: "/transaction/[id]", params: { id: t.id } })
            }
          />
        ))
      )}
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
  balanceCard: {
    padding: 20,
    marginBottom: 16,
  },
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
  timeframePills: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  pillActive: {
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  pillText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  pillTextActive: {
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
  },
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
  balanceStatLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  balanceStatValue: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  roiCard: { padding: 14, borderWidth: 1, marginBottom: 24 },
  roiCardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  roiIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  roiName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  roiMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
