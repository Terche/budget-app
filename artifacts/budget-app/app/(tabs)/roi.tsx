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
import { SectionHeader } from "@/components/SectionHeader";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  calculateROI,
  formatCurrency,
  formatPercent,
} from "@/services/roiService";

export default function ROIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { businessPlans, deleteBusinessPlan } = useApp();

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  function handleDelete(id: string) {
    Alert.alert("Delete Plan", "Remove this business plan?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteBusinessPlan(id),
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
          ROI Calculator
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/roi/new")}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.infoBox,
          { backgroundColor: colors.accent, borderColor: colors.primary + "33" },
        ]}
      >
        <Feather name="info" size={16} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.primary }]}>
          Create business scenarios to evaluate profitability and ROI before
          committing capital.
        </Text>
      </View>

      <SectionHeader title="Business Plans" />

      {businessPlans.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title="No business plans"
          subtitle="Add your first business scenario to calculate ROI"
        />
      ) : (
        businessPlans.map((plan) => {
          const roi = calculateROI(plan);

          const statusColor =
            roi.status === "profit"
              ? colors.success
              : roi.status === "loss"
                ? colors.expense
                : colors.warning;

          const statusLabel =
            roi.status === "profit"
              ? "Profitable"
              : roi.status === "loss"
                ? "Loss"
                : "Break Even";

          const statusIcon =
            roi.status === "profit"
              ? "trending-up"
              : roi.status === "loss"
                ? "trending-down"
                : "minus";

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
              onPress={() =>
                router.push({
                  pathname: "/roi/[id]",
                  params: { id: plan.id },
                })
              }
              activeOpacity={0.85}
            >
              <View style={styles.planTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planName, { color: colors.foreground }]}>
                    {plan.name}
                  </Text>
                  <Text
                    style={[styles.planMeta, { color: colors.mutedForeground }]}
                  >
                    {plan.timePeriodMonths} months · Capital:{" "}
                    {formatCurrency(plan.initialCapital)}
                  </Text>
                </View>
                <View style={styles.planTopRight}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor + "22" },
                    ]}
                  >
                    <Feather
                      name={statusIcon as keyof typeof Feather.glyphMap}
                      size={12}
                      color={statusColor}
                    />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(plan.id)}
                    style={[
                      styles.deleteBtn,
                      { backgroundColor: colors.destructive + "22" },
                    ]}
                  >
                    <Feather
                      name="trash-2"
                      size={14}
                      color={colors.destructive}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={[
                  styles.roiMetrics,
                  { borderTopColor: colors.border },
                ]}
              >
                <View style={styles.metric}>
                  <Text
                    style={[styles.metricValue, { color: statusColor }]}
                  >
                    {formatCurrency(roi.netProfit)}
                  </Text>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Net Profit/Loss
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text
                    style={[styles.metricValue, { color: statusColor }]}
                  >
                    {formatPercent(roi.roiPercentage)}
                  </Text>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    ROI
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: colors.foreground },
                    ]}
                  >
                    {roi.breakEvenMonths != null
                      ? `${roi.breakEvenMonths}mo`
                      : "N/A"}
                  </Text>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Break Even
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.expenseRow,
                  { borderTopColor: colors.border },
                ]}
              >
                <Feather
                  name="list"
                  size={12}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.expenseCount,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {plan.expenses.length} expense items ·{" "}
                  {formatCurrency(roi.totalExpenses)} total
                </Text>
              </View>
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
  planCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  planTop: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
    gap: 12,
  },
  planName: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  planMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  planTopRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  roiMetrics: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  metric: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  expenseCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
