import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
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
import { EmptyState } from "@/components/EmptyState";
import { useApp, SavingsPlan, SavingsFrequency } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

export const FREQ_LABELS: Record<SavingsFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
  custom: "Custom",
};

export function freqDays(plan: SavingsPlan): number {
  switch (plan.frequency) {
    case "daily": return 1;
    case "weekly": return 7;
    case "biweekly": return 14;
    case "monthly": return 30;
    case "custom": return plan.customDays ?? 14;
  }
}

export default function PlansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { savingsPlans, savingsEntries, deleteSavingsPlan } = useApp();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const totalSaved = useMemo(
    () => savingsEntries.reduce((s, e) => s + e.amount, 0),
    [savingsEntries],
  );

  const activePlans = useMemo(
    () => savingsPlans.filter((p) => p.isActive),
    [savingsPlans],
  );

  function planTotal(planId: string) {
    return savingsEntries.filter((e) => e.planId === planId).reduce((s, e) => s + e.amount, 0);
  }

  function planEntryCount(planId: string) {
    return savingsEntries.filter((e) => e.planId === planId).length;
  }

  function nextEntryDate(plan: SavingsPlan): string {
    const entries = savingsEntries.filter((e) => e.planId === plan.id);
    const days = freqDays(plan);
    if (entries.length === 0) {
      return plan.startDate;
    }
    const latest = entries.map((e) => e.date).sort().at(-1)!;
    const d = new Date(latest);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }

  function isOverdue(plan: SavingsPlan): boolean {
    const next = nextEntryDate(plan);
    return next < new Date().toISOString().split("T")[0];
  }

  function handleDelete(plan: SavingsPlan) {
    Alert.alert(
      "Delete Plan",
      `Delete "${plan.name}" and all its saved entries?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteSavingsPlan(plan.id) },
      ],
    );
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Savings Plans</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/plan/new")}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      {savingsPlans.length > 0 && (
        <View style={[styles.summaryBar, { backgroundColor: colors.accent, borderBottomColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{formatCurrency(totalSaved)}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Saved</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{activePlans.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Active Plans</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{savingsEntries.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Contributions</Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: botPad + insets.bottom + 100 },
          savingsPlans.length === 0 && styles.centered,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {savingsPlans.length === 0 ? (
          <EmptyState
            icon="trending-up"
            title="No savings plans yet"
            subtitle="Tap + to create a bi-weekly or recurring savings plan."
          />
        ) : (
          savingsPlans.map((plan) => {
            const total = planTotal(plan.id);
            const count = planEntryCount(plan.id);
            const next = nextEntryDate(plan);
            const overdue = isOverdue(plan) && plan.isActive;

            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/plan/${plan.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primary + "20" }]}>
                      <Feather name="trending-up" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardName, { color: colors.foreground }]}>{plan.name}</Text>
                      <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                        {FREQ_LABELS[plan.frequency]} · {formatCurrency(plan.contributionAmount)} / entry
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={[styles.cardTotal, { color: colors.foreground }]}>{formatCurrency(total)}</Text>
                    <Text style={[styles.cardCount, { color: colors.mutedForeground }]}>{count} contribution{count !== 1 ? "s" : ""}</Text>
                  </View>
                </View>

                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  {plan.isActive ? (
                    <View style={styles.nextRow}>
                      <Feather
                        name={overdue ? "alert-circle" : "calendar"}
                        size={12}
                        color={overdue ? colors.destructive : colors.mutedForeground}
                      />
                      <Text style={[styles.nextLabel, { color: overdue ? colors.destructive : colors.mutedForeground }]}>
                        {overdue ? "Overdue — " : "Next: "}
                        {formatDate(next)}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.nextRow}>
                      <Feather name="pause-circle" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.nextLabel, { color: colors.mutedForeground }]}>Paused</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(plan)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Feather name="trash-2" size={14} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  heading: { fontSize: 22, fontFamily: "Inter_700Bold" },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryBar: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  summaryDivider: { width: StyleSheet.hairlineWidth, marginVertical: 4 },
  list: { padding: 16, gap: 12 },
  centered: { flex: 1, justifyContent: "center" },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    gap: 12,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  cardRight: { alignItems: "flex-end" },
  cardTotal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  cardCount: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  nextRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  nextLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
