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
import { DatePickerField } from "@/components/DatePickerField";
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/context/AppContext";
import { type SavingsFrequency } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface FrequencyOption {
  key: SavingsFrequency;
  label: string;
  sublabel: string;
  icon: string;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { key: "daily", label: "Daily", sublabel: "Every day", icon: "sun" },
  { key: "weekly", label: "Weekly", sublabel: "Every 7 days", icon: "calendar" },
  { key: "biweekly", label: "Bi-weekly", sublabel: "Every 14 days", icon: "repeat" },
  { key: "monthly", label: "Monthly", sublabel: "Once a month", icon: "clock" },
  { key: "custom", label: "Custom", sublabel: "Choose interval", icon: "sliders" },
];

function frequencyDescription(freq: SavingsFrequency, customDays: string): string {
  switch (freq) {
    case "daily": return "Entries will be generated every day from your start date.";
    case "weekly": return "Entries will be generated every 7 days from your start date.";
    case "biweekly": return "Entries will be generated every 14 days from your start date.";
    case "monthly": return "Entries will be generated once per month from your start date.";
    case "custom": {
      const d = parseInt(customDays);
      return `Entries will be generated every ${isNaN(d) || d < 1 ? "?" : d} day${d === 1 ? "" : "s"} from your start date.`;
    }
  }
}

export default function NewSavingsPlanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addSavingsPlan } = useApp();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [frequency, setFrequency] = useState<SavingsFrequency>("weekly");
  const [customDays, setCustomDays] = useState("30");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  function handleSave() {
    const amt = parseFloat(amount);
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a plan name");
      return;
    }
    if (!amount || isNaN(amt) || amt <= 0) {
      Alert.alert("Error", "Please enter a valid contribution amount");
      return;
    }
    if (frequency === "custom") {
      const days = parseInt(customDays);
      if (isNaN(days) || days < 1) {
        Alert.alert("Error", "Please enter a valid number of days for your custom interval");
        return;
      }
    }

    addSavingsPlan({
      name: name.trim(),
      contributionAmount: amt,
      startDate,
      isActive: true,
      frequency,
      customDays: frequency === "custom" ? parseInt(customDays) : undefined,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad + 16,
        paddingHorizontal: 20,
        paddingBottom: botPad + 40,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="x" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>New Savings Plan</Text>
        <View style={{ width: 42 }} />
      </View>

      <FormField
        label="Plan Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Emergency Fund"
      />

      <FormField
        label="Contribution Amount (₱)"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <DatePickerField label="Start Date" value={startDate} onChange={setStartDate} />

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        Contribution Frequency
      </Text>

      <View style={styles.freqGrid}>
        {FREQUENCY_OPTIONS.map((opt) => {
          const selected = frequency === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.freqCard,
                {
                  backgroundColor: selected ? colors.primary + "15" : colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: colors.radius,
                },
              ]}
              onPress={() => setFrequency(opt.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.freqIcon,
                  {
                    backgroundColor: selected ? colors.primary + "22" : colors.muted,
                    borderRadius: colors.radius / 2,
                  },
                ]}
              >
                <Feather
                  name={opt.icon as any}
                  size={18}
                  color={selected ? colors.primary : colors.mutedForeground}
                />
              </View>
              <Text style={[styles.freqLabel, { color: selected ? colors.primary : colors.foreground }]}>
                {opt.label}
              </Text>
              <Text style={[styles.freqSublabel, { color: colors.mutedForeground }]}>
                {opt.sublabel}
              </Text>
              {selected && (
                <View style={[styles.freqCheck, { backgroundColor: colors.primary }]}>
                  <Feather name="check" size={10} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {frequency === "custom" && (
        <FormField
          label="Every how many days?"
          value={customDays}
          onChangeText={setCustomDays}
          placeholder="e.g. 10"
          keyboardType="number-pad"
        />
      )}

      <View
        style={[
          styles.infoBox,
          { backgroundColor: colors.accent, borderColor: colors.primary + "33" },
        ]}
      >
        <Feather name="info" size={15} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.primary }]}>
          {frequencyDescription(frequency, customDays)}
          {" "}Tap the refresh icon on the plan card to generate entries up to today.
        </Text>
      </View>

      <PrimaryButton label="Create Savings Plan" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 10,
  },
  freqGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  freqCard: {
    width: "47%",
    padding: 14,
    borderWidth: 1.5,
    position: "relative",
    gap: 6,
  },
  freqIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  freqLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  freqSublabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  freqCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBox: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 20,
  },
});
