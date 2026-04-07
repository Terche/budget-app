import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { formatCurrency } from "@/services/roiService";

const COLORS = [
  "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16",
];

const CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export default function EditSubscriptionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subscriptions, updateSubscription, deleteSubscription } = useApp();

  const sub = subscriptions.find((s) => s.id === id);

  const [name, setName] = useState(sub?.name ?? "");
  const [amount, setAmount] = useState(sub ? String(sub.amount) : "");
  const [billingDay, setBillingDay] = useState(sub ? String(sub.billingDay) : "1");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    sub?.billingCycle ?? "monthly",
  );
  const [color, setColor] = useState(sub?.color ?? COLORS[0]);
  const [notes, setNotes] = useState(sub?.notes ?? "");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  if (!sub) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={{ color: colors.mutedForeground }}>
          Subscription not found
        </Text>
      </View>
    );
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Missing Info", "Please enter a name.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    const day = parseInt(billingDay) || 1;
    updateSubscription({
      ...sub!,
      name: name.trim(),
      amount: parsedAmount,
      billingDay: Math.min(Math.max(day, 1), 28),
      billingCycle,
      color,
      notes: notes.trim(),
    });
    router.back();
  }

  function handleDelete() {
    Alert.alert("Delete Subscription", `Remove "${sub!.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteSubscription(id!);
          router.back();
        },
      },
    ]);
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
          Edit Subscription
        </Text>
        <TouchableOpacity onPress={handleDelete}>
          <Feather name="trash-2" size={20} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: color + "18",
            borderColor: color + "44",
          },
        ]}
      >
        <Text style={[styles.previewName, { color: colors.foreground }]}>
          {name || "Subscription name"}
        </Text>
        <Text style={[styles.previewAmount, { color }]}>
          {formatCurrency(parseFloat(amount) || 0)}/
          {billingCycle === "monthly"
            ? "mo"
            : billingCycle === "quarterly"
              ? "qtr"
              : "yr"}
        </Text>
        <View
          style={[
            styles.activeBadge,
            {
              backgroundColor: sub.isActive
                ? colors.success + "22"
                : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.activeBadgeText,
              {
                color: sub.isActive ? colors.success : colors.mutedForeground,
              },
            ]}
          >
            {sub.isActive ? "Active" : "Paused"}
          </Text>
        </View>
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
        placeholder="Subscription name"
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
              styles.cycleChip,
              {
                backgroundColor:
                  billingCycle === c.value ? colors.primary : colors.card,
                borderColor:
                  billingCycle === c.value ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setBillingCycle(c.value)}
          >
            <Text
              style={[
                styles.cycleChipText,
                {
                  color:
                    billingCycle === c.value
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                },
              ]}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        Billing Day (1–28)
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
        <Text style={styles.saveBtnText}>Save Changes</Text>
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
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
    gap: 6,
    alignItems: "flex-start",
  },
  previewName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  previewAmount: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
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
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  cycleChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  cycleChipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
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
