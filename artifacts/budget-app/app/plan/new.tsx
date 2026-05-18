import { Feather } from "@expo/vector-icons";
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
import { useApp, SavingsFrequency } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

const FREQUENCIES: { value: SavingsFrequency; label: string; days: string }[] = [
  { value: "daily",    label: "Daily",     days: "Every day" },
  { value: "weekly",   label: "Weekly",    days: "Every 7 days" },
  { value: "biweekly", label: "Bi-Weekly", days: "Every 14 days" },
  { value: "monthly",  label: "Monthly",   days: "Every 30 days" },
  { value: "custom",   label: "Custom",    days: "You choose" },
];

export default function NewPlanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addSavingsPlan } = useApp();

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<SavingsFrequency>("biweekly");
  const [customDays, setCustomDays] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const amount = parseFloat(contributionAmount) || 0;
  const days = frequency === "custom" ? (parseInt(customDays) || 14) : FREQUENCIES.find((f) => f.value === frequency)!.days;

  function handleSave() {
    if (!name.trim()) { Alert.alert("Validation", "Please enter a plan name."); return; }
    if (amount <= 0) { Alert.alert("Validation", "Enter a contribution amount greater than ₱0."); return; }
    if (frequency === "custom" && (!parseInt(customDays) || parseInt(customDays) < 1)) {
      Alert.alert("Validation", "Enter a valid number of days for custom frequency.");
      return;
    }

    addSavingsPlan({
      name: name.trim(),
      frequency,
      contributionAmount: amount,
      startDate,
      isActive: true,
      ...(frequency === "custom" ? { customDays: parseInt(customDays) } : {}),
    });
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.foreground }]}>New Savings Plan</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: botPad + insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormField
          label="Plan Name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Emergency Fund, Vacation Fund"
          autoFocus
        />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Contribution Frequency</Text>
        <View style={styles.freqGrid}>
          {FREQUENCIES.map((f) => {
            const active = frequency === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.freqCard,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFrequency(f.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.freqLabel, { color: active ? colors.primaryForeground : colors.foreground }]}>
                  {f.label}
                </Text>
                <Text style={[styles.freqDays, { color: active ? colors.primaryForeground + "cc" : colors.mutedForeground }]}>
                  {f.days}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {frequency === "custom" && (
          <FormField
            label="Every how many days? *"
            value={customDays}
            onChangeText={setCustomDays}
            placeholder="e.g. 10"
            keyboardType="number-pad"
          />
        )}

        <FormField
          label="Contribution Amount (₱) *"
          value={contributionAmount}
          onChangeText={setContributionAmount}
          placeholder="e.g. 1000"
          keyboardType="decimal-pad"
        />

        <FormField
          label="Start Date (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="2025-01-01"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />

        {amount > 0 && (
          <View style={[styles.preview, { backgroundColor: colors.accent, borderColor: colors.primary + "33" }]}>
            <Text style={[styles.previewTitle, { color: colors.primary }]}>Savings Preview</Text>
            <View style={styles.previewRow}>
              <Text style={[styles.previewKey, { color: colors.mutedForeground }]}>Per contribution</Text>
              <Text style={[styles.previewVal, { color: colors.foreground }]}>{formatCurrency(amount)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewKey, { color: colors.mutedForeground }]}>After 1 month (~2 contributions)</Text>
              <Text style={[styles.previewVal, { color: colors.foreground }]}>{formatCurrency(amount * 2)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewKey, { color: colors.mutedForeground }]}>After 6 months (~13 contributions)</Text>
              <Text style={[styles.previewVal, { color: colors.foreground }]}>{formatCurrency(amount * 13)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewKey, { color: colors.mutedForeground }]}>After 1 year (~26 contributions)</Text>
              <Text style={[styles.previewVal, { color: colors.foreground }]}>{formatCurrency(amount * 26)}</Text>
            </View>
          </View>
        )}

        <PrimaryButton label="Create Plan" onPress={handleSave} style={{ marginTop: 8 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heading: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  content: { padding: 20, gap: 4 },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 10, marginTop: 4 },
  freqGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  freqCard: {
    flex: 1,
    minWidth: "28%",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 2,
  },
  freqLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  freqDays: { fontSize: 10, fontFamily: "Inter_400Regular" },
  preview: {
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  previewTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  previewRow: { flexDirection: "row", justifyContent: "space-between" },
  previewKey: { fontSize: 13, fontFamily: "Inter_400Regular" },
  previewVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
