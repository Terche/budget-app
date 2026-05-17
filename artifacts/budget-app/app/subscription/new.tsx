import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { useApp, BillingCycle } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const COLORS = [
  "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16",
];

const CYCLES: { value: BillingCycle; label: string; hint: string }[] = [
  { value: "monthly", label: "Monthly", hint: "Billed every month" },
  { value: "quarterly", label: "Quarterly", hint: "Billed every 3 months" },
  { value: "yearly", label: "Yearly", hint: "Billed once a year" },
];

export default function NewSubscriptionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addSubscription } = useApp();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingDay, setBillingDay] = useState("1");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [color, setColor] = useState(COLORS[0]);
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Missing Info", "Please enter a subscription name.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    const day = parseInt(billingDay) || 1;
    addSubscription({
      name: name.trim(),
      amount: parsedAmount,
      billingDay: Math.min(Math.max(day, 1), 28),
      billingCycle,
      categoryId: "",
      color,
      isActive: true,
      notes: notes.trim(),
      startDate: startDate.trim() || new Date().toISOString().split("T")[0],
    });
    router.back();
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad + 8,
        paddingBottom: botPad + 60,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.foreground }]}>
          New Subscription
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        Name
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.foreground,
          },
        ]}
        placeholder="e.g. Netflix, Meralco, Rent"
        placeholderTextColor={colors.mutedForeground}
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        Amount (₱)
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.foreground,
          },
        ]}
        placeholder="0.00"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        Billing Cycle
      </Text>
      <View style={styles.cycleRow}>
        {CYCLES.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[
              styles.cycleCard,
              {
                backgroundColor:
                  billingCycle === c.value ? colors.primary + "18" : colors.card,
                borderColor:
                  billingCycle === c.value ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setBillingCycle(c.value)}
          >
            <Text
              style={[
                styles.cycleLabel,
                {
                  color:
                    billingCycle === c.value ? colors.primary : colors.foreground,
                },
              ]}
            >
              {c.label}
            </Text>
            <Text
              style={[styles.cycleHint, { color: colors.mutedForeground }]}
            >
              {c.hint}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        Billing Day of Month (1–28)
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.foreground,
          },
        ]}
        placeholder="1"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="number-pad"
        value={billingDay}
        onChangeText={setBillingDay}
      />

      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        Color
      </Text>
      <View style={styles.colorRow}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorDot,
              { backgroundColor: c },
              color === c && styles.colorDotSelected,
            ]}
            onPress={() => setColor(c)}
          >
            {color === c && <Feather name="check" size={14} color="#fff" />}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        Start Date
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.foreground,
          },
        ]}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.mutedForeground}
        value={startDate}
        onChangeText={setStartDate}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />

      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        Notes (optional)
      </Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.foreground,
          },
        ]}
        placeholder="Any notes..."
        placeholderTextColor={colors.mutedForeground}
        multiline
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Feather name="save" size={18} color="#fff" />
        <Text style={styles.saveBtnText}>Add Subscription</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  heading: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  cycleRow: {
    gap: 8,
    marginBottom: 20,
  },
  cycleCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cycleLabel: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  cycleHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  colorDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});
