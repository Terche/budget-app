import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

const LOAN_TYPE_LABELS: Record<string, string> = {
  personal: "Personal",
  home: "Home / Mortgage",
  car: "Car / Auto",
  business: "Business",
  other: "Other",
};

export default function LoanDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loans, loanPayments, deleteLoan, addLoanPayment, deleteLoanPayment } = useApp();

  const loan = loans.find((l) => l.id === id);
  const payments = useMemo(
    () => loanPayments.filter((p) => p.loanId === id).sort((a, b) => b.date.localeCompare(a.date)),
    [loanPayments, id],
  );

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState("");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const pct = loan
    ? Math.min(1, (loan.principalAmount - loan.remainingBalance) / loan.principalAmount)
    : 0;
  const totalPaid = loan ? loan.principalAmount - loan.remainingBalance : 0;
  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);
  const monthlyInterest = loan ? loan.remainingBalance * (loan.interestRate / 12 / 100) : 0;
  const principalPortion = loan ? Math.max(0, loan.monthlyPayment - monthlyInterest) : 0;

  const payoffMonths = useMemo((): number | null => {
    if (!loan || loan.remainingBalance <= 0) return null;
    const rate = loan.interestRate / 12 / 100;
    if (rate === 0) return Math.ceil(loan.remainingBalance / loan.monthlyPayment);
    const n = -Math.log(1 - (rate * loan.remainingBalance) / loan.monthlyPayment) / Math.log(1 + rate);
    return isFinite(n) && n > 0 ? Math.ceil(n) : null;
  }, [loan]);

  const estimatedPayoffDate = useMemo(() => {
    if (!payoffMonths) return null;
    const d = new Date();
    d.setMonth(d.getMonth() + payoffMonths);
    return d.toLocaleDateString("en-PH", { year: "numeric", month: "long" });
  }, [payoffMonths]);

  if (!loan) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.heading, { color: colors.foreground }]}>Loan not found</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>
    );
  }

  function handleAddPayment() {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) { Alert.alert("Validation", "Enter a valid payment amount."); return; }
    if (amount > loan!.remainingBalance) {
      Alert.alert("Warning", `Payment (${formatCurrency(amount)}) is more than the remaining balance (${formatCurrency(loan!.remainingBalance)}). Continue?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: doAddPayment },
      ]);
      return;
    }
    doAddPayment();
  }

  function doAddPayment() {
    const amount = parseFloat(paymentAmount);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addLoanPayment({ loanId: loan!.id, date: paymentDate, amount, notes: paymentNotes.trim() });
    setPaymentAmount("");
    setPaymentNotes("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setShowPaymentForm(false);
  }

  function handleDeletePayment(paymentId: string, amount: number) {
    Alert.alert("Delete Payment", `Remove this ${formatCurrency(amount)} payment? The balance will be restored.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteLoanPayment(paymentId) },
    ]);
  }

  function handleDeleteLoan() {
    Alert.alert("Delete Loan", `Remove "${loan!.name}" and all its payment history?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteLoan(loan!.id); router.back(); } },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.foreground }]} numberOfLines={1}>{loan.name}</Text>
        <TouchableOpacity onPress={handleDeleteLoan} style={styles.headerBtn}>
          <Feather name="trash-2" size={18} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: botPad + 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: loan.color + "66" }]}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>Remaining Balance</Text>
              <Text style={[styles.balanceAmount, { color: loan.remainingBalance <= 0 ? colors.success : loan.color }]}>
                {loan.remainingBalance <= 0 ? "Paid Off! 🎉" : formatCurrency(loan.remainingBalance)}
              </Text>
            </View>
            <View style={styles.badgeCol}>
              <View style={[styles.typeBadge, { backgroundColor: loan.color + "22" }]}>
                <Text style={[styles.typeBadgeText, { color: loan.color }]}>{LOAN_TYPE_LABELS[loan.loanType]}</Text>
              </View>
              {loan.lenderName ? (
                <Text style={[styles.lenderText, { color: colors.mutedForeground }]}>{loan.lenderName}</Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressBar, { backgroundColor: loan.color, width: `${pct * 100}%` }]} />
          </View>
          <View style={styles.progressMeta}>
            <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
              {(pct * 100).toFixed(1)}% paid off
            </Text>
            <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
              {formatCurrency(loan.principalAmount)} original
            </Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          {[
            { label: "Monthly Payment", value: formatCurrency(loan.monthlyPayment), color: colors.foreground },
            { label: "Interest Rate", value: `${loan.interestRate}%/yr`, color: colors.warning },
            { label: "Interest/Mo", value: formatCurrency(monthlyInterest), color: colors.expense },
            { label: "Principal/Mo", value: formatCurrency(principalPortion), color: colors.success },
            { label: "Total Paid Off", value: formatCurrency(Math.max(0, totalPaid)), color: colors.success },
            { label: "Total Payments", value: formatCurrency(totalPayments), color: colors.primary },
          ].map((m, i) => (
            <View key={i} style={[styles.metricCell, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
            </View>
          ))}
        </View>

        {estimatedPayoffDate && loan.remainingBalance > 0 && (
          <View style={[styles.payoffBanner, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "44" }]}>
            <Feather name="flag" size={16} color={colors.primary} />
            <View>
              <Text style={[styles.payoffTitle, { color: colors.primary }]}>Estimated Payoff</Text>
              <Text style={[styles.payoffDate, { color: colors.foreground }]}>
                {estimatedPayoffDate} · ~{payoffMonths} months
              </Text>
              {loan.startDate ? (
                <Text style={[styles.payoffMeta, { color: colors.mutedForeground }]}>
                  Started: {new Date(loan.startDate).toLocaleDateString("en-PH", { year: "numeric", month: "long" })}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        <View style={styles.paymentsSection}>
          <View style={styles.paymentsSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment History</Text>
            <TouchableOpacity
              style={[styles.addPaymentBtn, { backgroundColor: loan.color }]}
              onPress={() => setShowPaymentForm((v) => !v)}
            >
              <Feather name={showPaymentForm ? "minus" : "plus"} size={16} color="#fff" />
              <Text style={styles.addPaymentBtnText}>{showPaymentForm ? "Cancel" : "Add Payment"}</Text>
            </TouchableOpacity>
          </View>

          {showPaymentForm && (
            <View style={[styles.paymentForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.paymentFormTitle, { color: colors.foreground }]}>Record a Payment</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Text style={[styles.inputPrefix, { color: colors.mutedForeground }]}>₱</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder={`${loan.monthlyPayment}`}
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Feather name="calendar" size={14} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={paymentDate}
                  onChangeText={setPaymentDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Feather name="edit-2" size={14} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={paymentNotes}
                  onChangeText={setPaymentNotes}
                  placeholder="Notes (optional)"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <TouchableOpacity
                style={[styles.savePaymentBtn, { backgroundColor: loan.color }]}
                onPress={handleAddPayment}
              >
                <Text style={styles.savePaymentBtnText}>Save Payment</Text>
              </TouchableOpacity>
            </View>
          )}

          {payments.length === 0 ? (
            <View style={styles.emptyPayments}>
              <Feather name="inbox" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No payments recorded yet</Text>
            </View>
          ) : (
            payments.map((p) => (
              <View key={p.id} style={[styles.paymentItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.paymentDot, { backgroundColor: loan.color }]} />
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentAmount, { color: colors.foreground }]}>{formatCurrency(p.amount)}</Text>
                  <Text style={[styles.paymentDate, { color: colors.mutedForeground }]}>
                    {new Date(p.date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                    {p.notes ? ` · ${p.notes}` : ""}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeletePayment(p.id, p.amount)}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Feather name="trash-2" size={14} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  heading: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  card: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 16, gap: 14 },
  balanceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  balanceLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  balanceAmount: { fontSize: 28, fontFamily: "Inter_700Bold" },
  badgeCol: { alignItems: "flex-end", gap: 6 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  typeBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  lenderText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  progressBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressBar: { height: 8, borderRadius: 4 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  progressText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  metricCell: {
    width: "30.5%", borderRadius: 12, borderWidth: 1, padding: 12,
    alignItems: "center", gap: 4,
  },
  metricValue: { fontSize: 14, fontFamily: "Inter_700Bold", textAlign: "center" },
  metricLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  payoffBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 20,
  },
  payoffTitle: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 2 },
  payoffDate: { fontSize: 15, fontFamily: "Inter_700Bold" },
  payoffMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  paymentsSection: { gap: 10 },
  paymentsSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  addPaymentBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  addPaymentBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  paymentForm: {
    borderRadius: 14, borderWidth: 1, padding: 16, gap: 10, marginTop: 4,
  },
  paymentFormTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
  },
  inputPrefix: { fontSize: 14, fontFamily: "Inter_500Medium" },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 0 },
  savePaymentBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  savePaymentBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  emptyPayments: { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  paymentItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 12, borderWidth: 1, padding: 14,
  },
  paymentDot: { width: 10, height: 10, borderRadius: 5 },
  paymentInfo: { flex: 1 },
  paymentAmount: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  paymentDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
