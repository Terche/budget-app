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
import { DatePickerField } from "@/components/DatePickerField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function NewTransactionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addTransaction, categories, expenseGroups } = useApp();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [groupId, setGroupId] = useState(expenseGroups[0]?.id ?? "");

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  function handleSave() {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    addTransaction({
      amount: amt,
      date,
      type,
      categoryId,
      groupId,
      description,
      notes,
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
        <Text style={[styles.title, { color: colors.foreground }]}>
          New Transaction
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <View style={[styles.typeSwitch, { backgroundColor: colors.muted }]}>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            type === "expense" && { backgroundColor: colors.expense },
          ]}
          onPress={() => setType("expense")}
        >
          <Text
            style={[
              styles.typeBtnText,
              {
                color:
                  type === "expense" ? "#fff" : colors.mutedForeground,
              },
            ]}
          >
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            type === "income" && { backgroundColor: colors.income },
          ]}
          onPress={() => setType("income")}
        >
          <Text
            style={[
              styles.typeBtnText,
              {
                color:
                  type === "income" ? "#fff" : colors.mutedForeground,
              },
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <FormField
        label="Amount (₱)"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <FormField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What is this for?"
      />

      <DatePickerField label="Date" value={date} onChange={setDate} />

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        Expense Group
      </Text>
      <View style={styles.chipList}>
        {expenseGroups.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[
              styles.chip,
              {
                backgroundColor:
                  groupId === g.id ? g.color + "22" : colors.muted,
                borderColor: groupId === g.id ? g.color : colors.border,
                borderWidth: 1,
              },
            ]}
            onPress={() => {
              setGroupId(g.id);
              const firstCat = categories.find((c) => c.groupId === g.id);
              if (firstCat) setCategoryId(firstCat.id);
            }}
          >
            <Text
              style={{
                color: groupId === g.id ? g.color : colors.mutedForeground,
                fontSize: 13,
                fontFamily: "Inter_500Medium",
              }}
            >
              {g.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        Category
      </Text>
      <View style={styles.chipList}>
        {categories
          .filter((c) => !groupId || c.groupId === groupId)
          .map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    categoryId === c.id ? c.color + "22" : colors.muted,
                  borderColor: categoryId === c.id ? c.color : colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={() => setCategoryId(c.id)}
            >
              <Text
                style={{
                  color: categoryId === c.id ? c.color : colors.mutedForeground,
                  fontSize: 13,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
      </View>

      <FormField
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional notes..."
        multiline
        numberOfLines={3}
      />

      <PrimaryButton label="Save Transaction" onPress={handleSave} />
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
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  typeSwitch: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  typeBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
  },
  chipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
