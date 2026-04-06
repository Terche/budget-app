import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { TransactionItem } from "@/components/TransactionItem";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const FILTERS = ["All", "Income", "Expense"] as const;
type Filter = (typeof FILTERS)[number];

export default function TransactionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, expenseGroups } = useApp();
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const filtered = useMemo(() => {
    return [...transactions]
      .filter((t) => {
        if (filter === "Income" && t.type !== "income") return false;
        if (filter === "Expense" && t.type !== "expense") return false;
        if (selectedGroup !== "all" && t.groupId !== selectedGroup) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter, selectedGroup]);

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: topPad + 16,
          },
        ]}
      >
        <Text style={[styles.heading, { color: colors.foreground }]}>
          Transactions
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/transaction/new")}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.filters, { borderBottomColor: colors.border }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    filter === f ? colors.primaryForeground : colors.mutedForeground,
                },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.groupFilter}>
        <TouchableOpacity
          style={[
            styles.groupChip,
            selectedGroup === "all" && {
              backgroundColor: colors.accent,
              borderColor: colors.primary,
            },
            { borderColor: colors.border },
          ]}
          onPress={() => setSelectedGroup("all")}
        >
          <Text
            style={[
              styles.groupChipText,
              {
                color:
                  selectedGroup === "all"
                    ? colors.primary
                    : colors.mutedForeground,
              },
            ]}
          >
            All Groups
          </Text>
        </TouchableOpacity>
        {expenseGroups.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[
              styles.groupChip,
              selectedGroup === g.id && {
                backgroundColor: g.color + "22",
                borderColor: g.color,
              },
              { borderColor: colors.border },
            ]}
            onPress={() =>
              setSelectedGroup((prev) => (prev === g.id ? "all" : g.id))
            }
          >
            <View
              style={[styles.groupDot, { backgroundColor: g.color }]}
            />
            <Text
              style={[
                styles.groupChipText,
                {
                  color:
                    selectedGroup === g.id ? g.color : colors.mutedForeground,
                },
              ]}
            >
              {g.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        scrollEnabled={filtered.length > 0}
        renderItem={({ item }) => (
          <TransactionItem
            transactionId={item.id}
            onPress={() =>
              router.push({
                pathname: "/transaction/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="credit-card"
            title="No transactions"
            subtitle="Tap + to add your first transaction"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: botPad + 100,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heading: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  groupFilter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
    flexWrap: "wrap",
  },
  groupChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  groupChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
