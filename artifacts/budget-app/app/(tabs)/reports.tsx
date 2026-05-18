import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

type ColorSet = ReturnType<typeof useColors>;

function PieChart({
  data,
  colors,
  chartW,
}: {
  data: { label: string; value: number; color: string }[];
  colors: ColorSet;
  chartW: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const size = Math.min(chartW * 0.55, 180);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  let startAngle = -Math.PI / 2;
  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
    startAngle = endAngle;
    return { path, color: d.color, label: d.label, value: d.value };
  });

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        {slices.map((s, i) => (
          <Path key={i} d={s.path} fill={s.color} stroke={colors.card} strokeWidth={2} />
        ))}
      </Svg>
      <View style={styles.legend}>
        {data.map((d, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: d.color }]} />
            <Text
              style={[styles.legendLabel, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {d.label}
            </Text>
            <Text style={[styles.legendValue, { color: colors.mutedForeground }]}>
              {formatCurrency(d.value)}
            </Text>
            <Text style={[styles.legendPct, { color: d.color }]}>
              {((d.value / total) * 100).toFixed(0)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function BarChart({
  data,
  colors,
  chartW,
}: {
  data: { label: string; income: number; expense: number }[];
  colors: ColorSet;
  chartW: number;
}) {
  const max = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const chartH = 140;
  const slotW = chartW / Math.max(data.length, 1);
  const barW = Math.min(20, slotW / 2 - 4);

  return (
    <Svg width={chartW} height={chartH + 32}>
      {data.map((d, i) => {
        const slotX = i * slotW;
        const groupCenter = slotX + slotW / 2;
        const incomeH = (d.income / max) * chartH;
        const expenseH = (d.expense / max) * chartH;

        return (
          <G key={i}>
            <Rect
              x={groupCenter - barW - 2}
              y={chartH - incomeH}
              width={barW}
              height={Math.max(incomeH, 1)}
              fill={colors.success}
              rx={3}
            />
            <Rect
              x={groupCenter + 2}
              y={chartH - expenseH}
              width={barW}
              height={Math.max(expenseH, 1)}
              fill={colors.expense}
              rx={3}
            />
            <SvgText
              x={groupCenter}
              y={chartH + 20}
              textAnchor="middle"
              fontSize={10}
              fill={colors.mutedForeground}
            >
              {d.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

function LineChart({
  data,
  colors,
  chartW,
}: {
  data: { label: string; cumulative: number }[];
  colors: ColorSet;
  chartW: number;
}) {
  if (data.length < 2) return null;
  const chartH = 120;
  const maxVal = Math.max(...data.map((d) => d.cumulative), 1);
  const minVal = Math.min(...data.map((d) => d.cumulative), 0);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * chartW,
    y: chartH - ((d.cumulative - minVal) / range) * (chartH - 10) - 5,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const fillPath = linePath + ` L${points[points.length - 1].x},${chartH} L0,${chartH} Z`;
  const lineColor = minVal >= 0 ? colors.success : colors.primary;

  return (
    <View>
      <Svg width={chartW} height={chartH + 24}>
        <Path d={fillPath} fill={lineColor + "22"} />
        <Path d={linePath} fill="none" stroke={lineColor} strokeWidth={2.5} />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={lineColor} />
        ))}
        {data.map((d, i) => {
          if (data.length > 8 && i % 2 !== 0) return null;
          return (
            <SvgText
              key={i}
              x={points[i].x}
              y={chartH + 18}
              textAnchor="middle"
              fontSize={9}
              fill={colors.mutedForeground}
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const DATE_PRESETS = ["3M", "6M", "1Y", "All"] as const;
type DatePreset = (typeof DATE_PRESETS)[number];

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { transactions, categories, expenseGroups } = useApp();
  const [datePreset, setDatePreset] = useState<DatePreset>("All");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;
  const chartW = width - 72;

  const cutoffDate = useMemo(() => {
    const now = new Date();
    if (datePreset === "3M") { now.setMonth(now.getMonth() - 3); return now.toISOString().split("T")[0]; }
    if (datePreset === "6M") { now.setMonth(now.getMonth() - 6); return now.toISOString().split("T")[0]; }
    if (datePreset === "1Y") { now.setFullYear(now.getFullYear() - 1); return now.toISOString().split("T")[0]; }
    return null;
  }, [datePreset]);

  const filteredTx = useMemo(() =>
    cutoffDate ? transactions.filter((t) => t.date >= cutoffDate) : transactions,
    [transactions, cutoffDate]
  );

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTx
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
      });
    return Object.entries(map)
      .map(([id, value]) => {
        const cat = categories.find((c) => c.id === id);
        return { label: cat?.name ?? "Other", value, color: cat?.color ?? "#94a3b8" };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredTx, categories]);

  const barData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    filteredTx.forEach((t) => {
      const key = t.date.slice(0, 7);
      if (!months[key]) months[key] = { income: 0, expense: 0 };
      if (t.type === "income") months[key].income += t.amount;
      else months[key].expense += t.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
        label: new Date(key + "-02").toLocaleDateString("en-US", { month: "short" }),
        ...v,
      }));
  }, [filteredTx]);

  const lineData = useMemo(() => {
    const months: Record<string, number> = {};
    filteredTx.forEach((t) => {
      const key = t.date.slice(0, 7);
      if (!months[key]) months[key] = 0;
      months[key] += t.type === "income" ? t.amount : -t.amount;
    });
    const sorted = Object.entries(months).sort(([a], [b]) => a.localeCompare(b));
    let cumulative = 0;
    return sorted.map(([key, net]) => {
      cumulative += net;
      return {
        label: new Date(key + "-02").toLocaleDateString("en-US", { month: "short" }),
        cumulative,
      };
    });
  }, [filteredTx]);

  const groupTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTx
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.groupId] = (map[t.groupId] ?? 0) + t.amount;
      });
    return expenseGroups
      .map((g) => ({ ...g, total: map[g.id] ?? 0 }))
      .filter((g) => g.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [filteredTx, expenseGroups]);

  const totals = useMemo(() => {
    const income = filteredTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filteredTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filteredTx]);

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
      <Text style={[styles.heading, { color: colors.foreground }]}>Reports</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
        {DATE_PRESETS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.presetChip,
              { borderColor: colors.border },
              datePreset === p && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setDatePreset(p)}
          >
            <Text style={[styles.presetText, { color: datePreset === p ? "#fff" : colors.mutedForeground }]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.summaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.summaryCell}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Income</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>{formatCurrency(totals.income)}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryCell}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Expenses</Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>{formatCurrency(totals.expense)}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryCell}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Net Saved</Text>
          <Text style={[styles.summaryValue, { color: totals.net >= 0 ? colors.success : colors.expense }]}>
            {totals.net >= 0 ? "+" : ""}{formatCurrency(totals.net)}
          </Text>
        </View>
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.chartTitle, { color: colors.foreground }]}>Expense Breakdown</Text>
        {pieData.length > 0 ? (
          <PieChart data={pieData} colors={colors} chartW={chartW} />
        ) : (
          <Text style={[styles.noData, { color: colors.mutedForeground }]}>No expense data yet</Text>
        )}
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.chartHeaderRow}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Income vs Expenses</Text>
          <View style={styles.barLegend}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.barLegendText, { color: colors.mutedForeground }]}>Income</Text>
            <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
            <Text style={[styles.barLegendText, { color: colors.mutedForeground }]}>Expense</Text>
          </View>
        </View>
        {barData.length > 0 ? (
          <BarChart data={barData} colors={colors} chartW={chartW} />
        ) : (
          <Text style={[styles.noData, { color: colors.mutedForeground }]}>No data yet</Text>
        )}
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.chartTitle, { color: colors.foreground }]}>Cumulative Savings</Text>
        <Text style={[styles.chartSubtitle, { color: colors.mutedForeground }]}>
          Based on income minus expenses over time
        </Text>
        {lineData.length >= 2 ? (
          <LineChart data={lineData} colors={colors} chartW={chartW} />
        ) : (
          <Text style={[styles.noData, { color: colors.mutedForeground }]}>
            Need transactions from at least 2 months to show savings growth
          </Text>
        )}
      </View>

      {groupTotals.length > 0 && (
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Spending by Group</Text>
          {groupTotals.map((g) => {
            const maxTotal = groupTotals[0].total;
            const pct = g.total / maxTotal;
            return (
              <View key={g.id} style={styles.groupRow}>
                <View style={styles.groupRowTop}>
                  <View style={styles.groupRowLabel}>
                    <View style={[styles.groupRowDot, { backgroundColor: g.color }]} />
                    <Text style={[styles.groupRowName, { color: colors.foreground }]}>{g.name}</Text>
                  </View>
                  <Text style={[styles.groupRowAmount, { color: colors.foreground }]}>
                    {formatCurrency(g.total)}
                  </Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                  <View style={[styles.progressBar, { backgroundColor: g.color, width: `${pct * 100}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 16 },
  presetRow: { marginBottom: 16, flexGrow: 0 },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  presetText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  summaryRow: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  summaryCell: { flex: 1, alignItems: "center" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 4 },
  summaryValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
  summaryDivider: { width: 1, marginVertical: 4 },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  chartTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  chartSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12 },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  barLegend: { flexDirection: "row", alignItems: "center", gap: 6 },
  barLegendText: { fontSize: 11, fontFamily: "Inter_400Regular", marginRight: 4 },
  noData: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 24,
  },
  legend: { marginTop: 16, width: "100%", gap: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  legendValue: { fontSize: 12, fontFamily: "Inter_500Medium" },
  legendPct: { fontSize: 12, fontFamily: "Inter_600SemiBold", minWidth: 32, textAlign: "right" },
  groupRow: { marginBottom: 12, gap: 6 },
  groupRowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  groupRowLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  groupRowDot: { width: 10, height: 10, borderRadius: 5 },
  groupRowName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  groupRowAmount: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressBar: { height: 6, borderRadius: 3 },
});
