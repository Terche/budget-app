import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { useApp, Loan } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

const LOAN_TYPE_LABELS: Record<string, string> = {
  personal: "Personal",
  home: "Home / Mortgage",
  car: "Car / Auto",
  business: "Business",
  other: "Other",
};

const LOAN_TYPE_ICONS: Record<string, string> = {
  personal: "user",
  home: "home",
  car: "navigation",
  business: "briefcase",
  other: "credit-card",
};

function monthlyInterest(loan: Loan): number {
  return loan.remainingBalance * (loan.interestRate / 12 / 100);
}

function estimatedPayoffMonths(loan: Loan): number | null {
  if (loan.remainingBalance <= 0) return 0;
  const rate = loan.interestRate / 12 / 100;
  if (rate === 0) {
    return Math.ceil(loan.remainingBalance / loan.monthlyPayment);
  }
  const n = -Math.log(1 - (rate * loan.remainingBalance) / loan.monthlyPayment) / Math.log(1 + rate);
  if (!isFinite(n) || n <= 0) return null;
  return Math.ceil(n);
}

export default function LoansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loans, loanPayments, deleteLoan } = useApp();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const summary = useMemo(() => {
    const totalDebt = loans.reduce((s, l) => s + l.remainingBalance, 0);
    const totalOriginal = loans.reduce((s, l) => s + l.principalAmount, 0);
    const totalMonthly = loans.reduce((s, l) => s + l.monthlyPayment, 0);
    const totalPaid = totalOriginal - totalDebt;
    return { totalDebt, totalOriginal, totalMonthly, totalPaid };
  }, [loans]);

  function handleDelete(id: string, name: string) {
    Alert.alert("Delete Loan", `Remove "${name}" and all its payment history?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteLoan(id) },
    ]);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: botPad + 100, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Debts & Loans</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/roi/new")}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loans.length > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Debt</Text>
              <Text style={[styles.summaryAmount, { color: colors.expense }]}>{formatCurrency(summary.totalDebt)}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Paid</Text>
              <Text style={[styles.summaryAmount, { color: colors.success }]}>{formatCurrency(summary.totalPaid)}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryCell}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Monthly Due</Text>
              <Text style={[styles.summaryAmount, { color: colors.foreground }]}>{formatCurrency(summary.totalMonthly)}</Text>
            </View>
          </View>
          {summary.totalOriginal > 0 && (
            <View style={styles.overallProgress}>
              <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: colors.success,
                      width: `${Math.min(100, (summary.totalPaid / summary.totalOriginal) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                {((summary.totalPaid / summary.totalOriginal) * 100).toFixed(1)}% paid off overall
              </Text>
            </View>
          )}
        </View>
      )}

      {loans.length === 0 ? (
        <EmptyState
          icon="credit-card"
          title="No loans tracked"
          subtitle="Add a loan or debt to track your balance, payments, and payoff date"
        />
      ) : (
        loans.map((loan) => {
          const pct = loan.principalAmount > 0
            ? Math.min(1, (loan.principalAmount - loan.remainingBalance) / loan.principalAmount)
            : 0;
          const payoffMonths = estimatedPayoffMonths(loan);
          const interest = monthlyInterest(loan);
          const payments = loanPayments.filter((p) => p.loanId === loan.id);

          return (
            <TouchableOpacity
              key={loan.id}
              style={[styles.loanCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: loan.color }]}
              onPress={() => router.push({ pathname: "/roi/[id]", params: { id: loan.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.loanTop}>
                <View style={[styles.loanIcon, { backgroundColor: loan.color + "22" }]}>
                  <Feather name={LOAN_TYPE_ICONS[loan.loanType] as keyof typeof Feather.glyphMap} size={18} color={loan.color} />
                </View>
                <View style={styles.loanInfo}>
                  <Text style={[styles.loanName, { color: colors.foreground }]}>{loan.name}</Text>
                  <Text style={[styles.loanMeta, { color: colors.mutedForeground }]}>
                    {loan.lenderName} · {LOAN_TYPE_LABELS[loan.loanType]}
                  </Text>
                </View>
                <View style={styles.loanTopRight}>
                  <Text style={[styles.loanBalance, { color: loan.color }]}>{formatCurrency(loan.remainingBalance)}</Text>
                  <Text style={[styles.loanBalanceLabel, { color: colors.mutedForeground }]}>remaining</Text>
                </View>
              </View>

              <View style={styles.loanProgressSection}>
                <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                  <View style={[styles.progressBar, { backgroundColor: loan.color, width: `${pct * 100}%` }]} />
                </View>
                <View style={styles.progressMeta}>
                  <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                    {(pct * 100).toFixed(1)}% paid
                  </Text>
                  <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                    {formatCurrency(loan.principalAmount)} original
                  </Text>
                </View>
              </View>

              <View style={[styles.loanFooter, { borderTopColor: colors.border }]}>
                <View style={styles.loanMetric}>
                  <Feather name="calendar" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.loanMetricText, { color: colors.mutedForeground }]}>
                    {formatCurrency(loan.monthlyPayment)}/mo
                  </Text>
                </View>
                <View style={styles.loanMetric}>
                  <Feather name="percent" size={12} color={colors.warning} />
                  <Text style={[styles.loanMetricText, { color: colors.mutedForeground }]}>
                    {loan.interestRate}% · {formatCurrency(interest)} interest/mo
                  </Text>
                </View>
                {payoffMonths != null && loan.remainingBalance > 0 && (
                  <View style={styles.loanMetric}>
                    <Feather name="clock" size={12} color={colors.primary} />
                    <Text style={[styles.loanMetricText, { color: colors.primary }]}>
                      ~{payoffMonths}mo to payoff
                    </Text>
                  </View>
                )}
                {loan.remainingBalance <= 0 && (
                  <View style={[styles.paidBadge, { backgroundColor: colors.success + "22" }]}>
                    <Feather name="check-circle" size={12} color={colors.success} />
                    <Text style={[styles.paidBadgeText, { color: colors.success }]}>Paid Off!</Text>
                  </View>
                )}
              </View>

              <View style={styles.loanActions}>
                <Text style={[styles.loanPaymentCount, { color: colors.mutedForeground }]}>
                  {payments.length} payment{payments.length !== 1 ? "s" : ""} recorded
                </Text>
                <TouchableOpacity
                  onPress={() => handleDelete(loan.id, loan.name)}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Feather name="trash-2" size={14} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  heading: { fontSize: 28, fontFamily: "Inter_700Bold" },
  addBtn: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  summaryRow: { flexDirection: "row" },
  summaryCell: { flex: 1, alignItems: "center" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 4 },
  summaryAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
  summaryDivider: { width: 1, marginVertical: 4 },
  overallProgress: { marginTop: 12, gap: 6 },
  loanCard: {
    borderRadius: 16, borderWidth: 1, borderLeftWidth: 4,
    marginBottom: 14, overflow: "hidden",
  },
  loanTop: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  loanIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  loanInfo: { flex: 1 },
  loanName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  loanMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  loanTopRight: { alignItems: "flex-end" },
  loanBalance: { fontSize: 18, fontFamily: "Inter_700Bold" },
  loanBalanceLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  loanProgressSection: { paddingHorizontal: 14, paddingBottom: 12, gap: 6 },
  progressBg: { height: 7, borderRadius: 4, overflow: "hidden" },
  progressBar: { height: 7, borderRadius: 4 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between" },
  progressText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  progressLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4 },
  loanFooter: {
    borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14,
    paddingVertical: 10, gap: 6,
  },
  loanMetric: { flexDirection: "row", alignItems: "center", gap: 6 },
  loanMetricText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  paidBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start" },
  paidBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  loanActions: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "transparent",
  },
  loanPaymentCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
