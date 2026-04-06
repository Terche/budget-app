import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

interface TransactionItemProps {
  transactionId: string;
  onPress?: () => void;
}

export function TransactionItem({ transactionId, onPress }: TransactionItemProps) {
  const colors = useColors();
  const { transactions, categories, expenseGroups } = useApp();
  const t = transactions.find((x) => x.id === transactionId);

  if (!t) return null;

  const category = categories.find((c) => c.id === t.categoryId);
  const group = expenseGroups.find((g) => g.id === t.groupId);
  const isIncome = t.type === "income";
  const amountColor = isIncome ? colors.income : colors.expense;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: (category?.color ?? colors.primary) + "22" },
        ]}
      >
        <Feather
          name={isIncome ? "arrow-down-left" : "arrow-up-right"}
          size={18}
          color={category?.color ?? colors.primary}
        />
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.description, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {t.description || category?.name || "Transaction"}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {group?.name ?? ""}
          {group && category ? " · " : ""}
          {category?.name ?? ""}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? "+" : "-"}
          {formatCurrency(t.amount)}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {new Date(t.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  right: {
    alignItems: "flex-end",
    gap: 3,
  },
  amount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  date: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
