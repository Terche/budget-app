import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  ROIResult,
  calculateROI,
  formatCurrency,
  formatPercent,
} from "@/services/roiService";

export default function ROIPlanDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { businessPlans } = useApp();

  const plan = businessPlans.find((p) => p.id === id);
  const roi = useMemo(
    () => (plan ? calculateROI(plan) : null),
    [plan],
  );

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  if (!plan || !roi) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text
          style={[
            styles.title,
            { color: colors.foreground, textAlign: "center", marginTop: 100 },
          ]}
        >
          Plan not found
        </Text>
      </View>
    );
  }

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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad + 16,
        paddingHorizontal: 20,
        paddingBottom: botPad + 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {plan.name}
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <View
        style={[
          styles.statusCard,
          { backgroundColor: statusColor + "18", borderColor: statusColor + "44" },
        ]}
      >
        <Text style={[styles.statusLabel, { color: statusColor }]}>
          {statusLabel}
        </Text>
        <Text style={[styles.netProfit, { color: statusColor }]}>
          {formatCurrency(roi.netProfit)}
        </Text>
        <Text style={[styles.statusSub, { color: statusColor }]}>
          Net profit/loss over {plan.timePeriodMonths} months
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard
          label="ROI"
          value={formatPercent(roi.roiPercentage)}
          icon="percent"
          color={statusColor}
          colors={colors}
        />
        <MetricCard
          label="Break Even"
          value={roi.breakEvenMonths != null ? `${roi.breakEvenMonths} mo` : "N/A"}
          icon="clock"
          color={colors.primary}
          colors={colors}
        />
        <MetricCard
          label="Monthly Revenue"
          value={formatCurrency(roi.monthlyRevenue)}
          icon="arrow-down-left"
          color={colors.success}
          colors={colors}
        />
        <MetricCard
          label="Monthly Costs"
          value={formatCurrency(roi.monthlyExpenses)}
          icon="arrow-up-right"
          color={colors.expense}
          colors={colors}
        />
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Plan Overview
        </Text>
        <DetailRow label="Initial Capital" value={formatCurrency(plan.initialCapital)} colors={colors} />
        <DetailRow label="Expected Monthly Revenue" value={formatCurrency(plan.expectedRevenue)} colors={colors} />
        <DetailRow label="Time Period" value={`${plan.timePeriodMonths} months`} colors={colors} />
        <DetailRow label="Total Expenses" value={formatCurrency(roi.totalExpenses)} colors={colors} />
        <DetailRow
          label="Monthly Profit"
          value={formatCurrency(roi.projectedMonthlyProfit)}
          valueColor={roi.projectedMonthlyProfit >= 0 ? colors.success : colors.expense}
          colors={colors}
        />
      </View>

      {plan.expenses.length > 0 ? (
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Expense Items
          </Text>
          {plan.expenses.map((e) => (
            <View key={e.id} style={styles.expRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.expName, { color: colors.foreground }]}>
                  {e.description}
                </Text>
                <Text style={[styles.expMeta, { color: colors.mutedForeground }]}>
                  {e.isRecurring ? "Monthly recurring" : "One-time"} ·{" "}
                  {e.isRecurring
                    ? `${formatCurrency(e.amount * plan.timePeriodMonths)} total`
                    : ""}
                </Text>
              </View>
              <Text style={[styles.expAmount, { color: colors.expense }]}>
                -{formatCurrency(e.amount)}
                {e.isRecurring ? "/mo" : ""}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
  colors,
}: {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  colors: any;
}) {
  return (
    <View
      style={[
        metricStyles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[metricStyles.icon, { backgroundColor: color + "22" }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={[metricStyles.value, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[metricStyles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  value: { fontSize: 16, fontFamily: "Inter_700Bold" },
  label: { fontSize: 11, fontFamily: "Inter_400Regular" },
});

function DetailRow({
  label,
  value,
  valueColor,
  colors,
}: {
  label: string;
  value: string;
  valueColor?: string;
  colors: any;
}) {
  return (
    <View style={[detailStyles.row, { borderBottomColor: colors.border }]}>
      <Text style={[detailStyles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[detailStyles.value, { color: valueColor ?? colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 14, fontFamily: "Inter_400Regular" },
  value: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", flex: 1, textAlign: "center" },
  statusCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 20,
    gap: 6,
  },
  statusLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  netProfit: { fontSize: 36, fontFamily: "Inter_700Bold" },
  statusSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  expRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
  },
  expName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  expMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  expAmount: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
