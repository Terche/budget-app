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
import { BusinessExpense } from "@/context/AppContext";

export default function NewROIPlanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBusinessPlan, savingsPlans } = useApp();

  const [name, setName] = useState("");
  const [capital, setCapital] = useState("");
  const [revenue, setRevenue] = useState("");
  const [months, setMonths] = useState("12");
  const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expRecurring, setExpRecurring] = useState(true);

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  function addExpense() {
    if (!expName.trim() || !expAmount || isNaN(parseFloat(expAmount))) {
      Alert.alert("Error", "Enter expense name and amount");
      return;
    }
    const id =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setExpenses((prev) => [
      ...prev,
      {
        id,
        description: expName.trim(),
        amount: parseFloat(expAmount),
        isRecurring: expRecurring,
      },
    ]);
    setExpName("");
    setExpAmount("");
  }

  function removeExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Error", "Enter a plan name");
      return;
    }
    const cap = parseFloat(capital);
    const rev = parseFloat(revenue);
    const mo = parseInt(months, 10);

    if (isNaN(cap) || cap < 0) {
      Alert.alert("Error", "Enter a valid initial capital");
      return;
    }
    if (isNaN(rev) || rev < 0) {
      Alert.alert("Error", "Enter a valid monthly revenue");
      return;
    }
    if (isNaN(mo) || mo < 1) {
      Alert.alert("Error", "Enter a valid number of months");
      return;
    }

    addBusinessPlan({
      name: name.trim(),
      initialCapital: cap,
      expectedRevenue: rev,
      timePeriodMonths: mo,
      expenses,
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
          New Business Plan
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <FormField
        label="Plan Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Coffee Shop Business"
      />
      <FormField
        label="Initial Capital (₱)"
        value={capital}
        onChangeText={setCapital}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />
      <FormField
        label="Expected Monthly Revenue (₱)"
        value={revenue}
        onChangeText={setRevenue}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />
      <FormField
        label="Time Period (months)"
        value={months}
        onChangeText={setMonths}
        placeholder="12"
        keyboardType="number-pad"
      />

      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
        Expected Expenses
      </Text>

      {expenses.map((e) => (
        <View
          key={e.id}
          style={[
            styles.expenseRow,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.expenseName, { color: colors.foreground }]}>
              {e.description}
            </Text>
            <Text
              style={[styles.expenseMeta, { color: colors.mutedForeground }]}
            >
              ${e.amount.toFixed(2)} · {e.isRecurring ? "Monthly" : "One-time"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => removeExpense(e.id)}>
            <Feather name="x" size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      ))}

      <View
        style={[
          styles.addExpenseBox,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[styles.addExpenseTitle, { color: colors.mutedForeground }]}
        >
          Add Expense Item
        </Text>
        <FormField
          label="Description"
          value={expName}
          onChangeText={setExpName}
          placeholder="e.g. Rent"
        />
        <FormField
          label="Amount (₱)"
          value={expAmount}
          onChangeText={setExpAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
        <View style={styles.recurringRow}>
          <Text style={[styles.recurringLabel, { color: colors.foreground }]}>
            Recurring (monthly)?
          </Text>
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: expRecurring
                  ? colors.primary
                  : colors.muted,
              },
            ]}
            onPress={() => setExpRecurring(!expRecurring)}
          >
            <Text style={[styles.toggleText, { color: expRecurring ? "#fff" : colors.mutedForeground }]}>
              {expRecurring ? "Yes" : "No"}
            </Text>
          </TouchableOpacity>
        </View>
        <PrimaryButton
          label="+ Add Expense"
          onPress={addExpense}
          variant="secondary"
        />
      </View>

      <PrimaryButton
        label="Create Business Plan"
        onPress={handleSave}
        style={{ marginTop: 16 }}
      />
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
  sectionLabel: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  expenseName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  expenseMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  addExpenseBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  addExpenseTitle: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 12 },
  recurringRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  recurringLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  toggleText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
