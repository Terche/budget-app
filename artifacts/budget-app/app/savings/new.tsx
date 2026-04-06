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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function NewSavingsPlanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addSavingsPlan, generateSavingsEntries } = useApp();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
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

    let planId: string | null = null;
    const origAdd = addSavingsPlan;

    addSavingsPlan({
      name: name.trim(),
      contributionAmount: amt,
      startDate,
      isActive: true,
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
          style={[
            styles.backBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="x" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>
          New Savings Plan
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: colors.accent,
            borderColor: colors.primary + "33",
          },
        ]}
      >
        <Feather name="clock" size={16} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.primary }]}>
          Entries are generated automatically every 14 days from your start
          date. You can generate them by tapping the refresh icon on the plan
          card.
        </Text>
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
      <FormField
        label="Start Date (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
        placeholder="2024-01-01"
      />

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
