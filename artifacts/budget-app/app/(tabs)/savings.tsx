import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

export default function SavingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    savingsPlans,
    savingsEntries,
    deleteSavingsPlan,
    generateSavingsEntries,
  } = useApp();

  const totalSavings = useMemo(
    () => savingsEntries.reduce((sum, e) => sum + e.amount, 0),
    [savingsEntries],
  );

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  function planEntries(planId: string) {
    return savingsEntries.filter((e) => e.planId === planId);
  }

  function planTotal(planId: string) {
    return planEntries(planId).reduce((sum, e) => sum + e.amount, 0);
  }

  function handleDelete(planId: string) {
    Alert.alert("Delete Plan", "Delete this savings plan and all its entries?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteSavingsPlan(planId),
      },
    ]);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad + 16,
        paddingBottom: botPad + 100,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: colors.foreground }]}>
          Savings
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/savings/new")}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.totalCard,
          { backgroundColor: colors.success + "18", borderColor: colors.success + "44" },
        ]}
      >
        <Feather name="trending-up" size={24} color={colors.success} />
        <View>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
            Total Accumulated Savings
          </Text>
          <Text style={[styles.totalValue, { color: colors.success }]}>
            {formatCurrency(totalSavings)}
          </Text>
        </View>
      </View>

      <SectionHeader title="Savings Plans" />

      {savingsPlans.length === 0 ? (
        <EmptyState
          icon="trending-up"
          title="No savings plans"
          subtitle="Create a bi-weekly savings plan to get started"
        />
      ) : (
        savingsPlans.map((plan) => {
          const entries = planEntries(plan.id);
          const total = planTotal(plan.id);
          const latestEntry = [...entries].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )[0];

          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/savings/[id]",
                  params: { id: plan.id },
                })
              }
            >
              <View style={styles.planHeader}>
                <View style={styles.planTitleRow}>
                  <View
                    style={[
                      styles.planIcon,
                      { backgroundColor: colors.accent },
                    ]}
                  >
                    <Feather name="clock" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planName, { color: colors.foreground }]}>
                      {plan.name}
                    </Text>
                    <Text
                      style={[styles.planMeta, { color: colors.mutedForeground }]}
                    >
                      Every 14 days · {formatCurrency(plan.contributionAmount)}
                      /cycle
                    </Text>
                  </View>
                </View>
                <View style={styles.planActions}>
                  <TouchableOpacity
                    onPress={() => generateSavingsEntries(plan.id)}
                    style={[
                      styles.actionBtn,
                      { backgroundColor: colors.accent },
                    ]}
                  >
                    <Feather name="refresh-cw" size={14} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(plan.id)}
                    style={[
                      styles.actionBtn,
                      { backgroundColor: colors.destructive + "22" },
                    ]}
                  >
                    <Feather name="trash-2" size={14} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={[
                  styles.planStats,
                  { borderTopColor: colors.border },
                ]}
              >
                <View style={styles.planStat}>
                  <Text
                    style={[styles.planStatValue, { color: colors.success }]}
                  >
                    {formatCurrency(total)}
                  </Text>
                  <Text
                    style={[
                      styles.planStatLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Accumulated
                  </Text>
                </View>
                <View style={styles.planStat}>
                  <Text
                    style={[styles.planStatValue, { color: colors.foreground }]}
                  >
                    {entries.length}
                  </Text>
                  <Text
                    style={[
                      styles.planStatLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Entries
                  </Text>
                </View>
                <View style={styles.planStat}>
                  <Text
                    style={[styles.planStatValue, { color: colors.foreground }]}
                  >
                    {latestEntry
                      ? new Date(latestEntry.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </Text>
                  <Text
                    style={[
                      styles.planStatLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Last Entry
                  </Text>
                </View>
              </View>

              {entries.length > 0 && (
                <View style={styles.timeline}>
                  {[...entries]
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() -
                        new Date(a.date).getTime(),
                    )
                    .slice(0, 4)
                    .map((entry, idx) => (
                      <View key={entry.id} style={styles.timelineItem}>
                        <View
                          style={[
                            styles.timelineDot,
                            {
                              backgroundColor:
                                idx === 0 ? colors.success : colors.border,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.timelineDate,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                        <Text
                          style={[
                            styles.timelineAmount,
                            { color: colors.success },
                          ]}
                        >
                          +{formatCurrency(entry.amount)}
                        </Text>
                      </View>
                    ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  planCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    justifyContent: "space-between",
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  planIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  planName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  planMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  planActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  planStats: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  planStat: {
    flex: 1,
    alignItems: "center",
  },
  planStatValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  planStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  timeline: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  timelineAmount: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
