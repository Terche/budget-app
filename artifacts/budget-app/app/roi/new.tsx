import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp, LoanType } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

const LOAN_TYPES: { key: LoanType; label: string; icon: string }[] = [
  { key: "personal", label: "Personal", icon: "user" },
  { key: "home", label: "Home", icon: "home" },
  { key: "car", label: "Car", icon: "navigation" },
  { key: "business", label: "Business", icon: "briefcase" },
  { key: "other", label: "Other", icon: "credit-card" },
];

const LOAN_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#8b5cf6", "#3b82f6", "#10b981"];

export default function NewLoanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addLoan } = useApp();

  const [name, setName] = useState("");
  const [lenderName, setLenderName] = useState("");
  const [loanType, setLoanType] = useState<LoanType>("personal");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [remainingBalance, setRemainingBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [termMonths, setTermMonths] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedColor, setSelectedColor] = useState(LOAN_COLORS[0]);
  const [notes, setNotes] = useState("");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const principal = parseFloat(principalAmount) || 0;
  const remaining = parseFloat(remainingBalance) || principal;
  const rate = parseFloat(interestRate) || 0;
  const payment = parseFloat(monthlyPayment) || 0;

  const monthlyInterest = remaining * (rate / 12 / 100);
  const principalPortion = Math.max(0, payment - monthlyInterest);

  function handleSave() {
    if (!name.trim()) { Alert.alert("Validation", "Loan name is required."); return; }
    if (!principalAmount || principal <= 0) { Alert.alert("Validation", "Principal amount is required."); return; }
    if (!monthlyPayment || payment <= 0) { Alert.alert("Validation", "Monthly payment is required."); return; }
    if (rate > 0 && payment <= monthlyInterest) {
      Alert.alert("Warning", "Monthly payment is less than or equal to the monthly interest. The loan will never be paid off. Continue?", [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", onPress: save },
      ]);
      return;
    }
    save();
  }

  function save() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addLoan({
      name: name.trim(),
      lenderName: lenderName.trim(),
      loanType,
      principalAmount: principal,
      remainingBalance: remainingBalance ? parseFloat(remainingBalance) : principal,
      interestRate: rate,
      monthlyPayment: payment,
      termMonths: parseInt(termMonths) || 0,
      startDate,
      color: selectedColor,
      notes: notes.trim(),
    });
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.foreground }]}>Add Loan / Debt</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: botPad + 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FormField label="Loan Name *" value={name} onChangeText={setName} placeholder="e.g. Home Loan, Personal Loan" />
        <FormField label="Lender / Bank" value={lenderName} onChangeText={setLenderName} placeholder="e.g. BDO, BPI, SSS" />

        <Text style={[styles.label, { color: colors.foreground }]}>Loan Type</Text>
        <View style={styles.typeRow}>
          {LOAN_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.typeBtn,
                { borderColor: colors.border, backgroundColor: colors.card },
                loanType === t.key && { borderColor: selectedColor, backgroundColor: selectedColor + "18" },
              ]}
              onPress={() => setLoanType(t.key)}
            >
              <Feather name={t.icon as keyof typeof Feather.glyphMap} size={16} color={loanType === t.key ? selectedColor : colors.mutedForeground} />
              <Text style={[styles.typeBtnText, { color: loanType === t.key ? selectedColor : colors.mutedForeground }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <FormField
          label="Original Principal Amount (₱) *"
          value={principalAmount}
          onChangeText={setPrincipalAmount}
          placeholder="e.g. 500000"
          keyboardType="decimal-pad"
        />
        <FormField
          label="Remaining Balance (₱)"
          value={remainingBalance}
          onChangeText={setRemainingBalance}
          placeholder={principalAmount || "Leave blank if same as principal"}
          keyboardType="decimal-pad"
        />
        <FormField
          label="Annual Interest Rate (% per year)"
          value={interestRate}
          onChangeText={setInterestRate}
          placeholder="e.g. 12 for 12%"
          keyboardType="decimal-pad"
        />
        <FormField
          label="Monthly Payment (₱) *"
          value={monthlyPayment}
          onChangeText={setMonthlyPayment}
          placeholder="e.g. 10000"
          keyboardType="decimal-pad"
        />

        {rate > 0 && payment > 0 && (
          <View style={[styles.previewBox, { backgroundColor: colors.accent, borderColor: colors.primary + "33" }]}>
            <Text style={[styles.previewTitle, { color: colors.primary }]}>Monthly Breakdown</Text>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>Interest portion</Text>
              <Text style={[styles.previewValue, { color: colors.expense }]}>{formatCurrency(monthlyInterest)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>Principal portion</Text>
              <Text style={[styles.previewValue, { color: colors.success }]}>{formatCurrency(principalPortion)}</Text>
            </View>
          </View>
        )}

        <FormField
          label="Loan Term (months)"
          value={termMonths}
          onChangeText={setTermMonths}
          placeholder="e.g. 60 for 5 years"
          keyboardType="numeric"
        />
        <FormField
          label="Start Date"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={[styles.label, { color: colors.foreground }]}>Color</Text>
        <View style={styles.colorRow}>
          {LOAN_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotActive]}
              onPress={() => setSelectedColor(c)}
            >
              {selectedColor === c && <Feather name="check" size={14} color="#fff" />}
            </TouchableOpacity>
          ))}
        </View>

        <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional notes" multiline />

        <PrimaryButton label="Add Loan" onPress={handleSave} style={{ marginTop: 24 }} />
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
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 20, fontFamily: "Inter_700Bold" },
  label: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 8, marginTop: 4 },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  typeBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 10, borderWidth: 1,
  },
  typeBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  previewBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16, gap: 8 },
  previewTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  previewRow: { flexDirection: "row", justifyContent: "space-between" },
  previewLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  previewValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  colorRow: { flexDirection: "row", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  colorDot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  colorDotActive: { borderWidth: 3, borderColor: "#fff" },
});
