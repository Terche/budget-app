import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

const W = Dimensions.get("window").width - 40;

function PieChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const size = Math.min(W * 0.6, 200);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

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
    const slice = { path, color: d.color, label: d.label, value: d.value };
    startAngle = endAngle;
    return slice;
  });

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        {slices.map((s, i) => (
          <Path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth={1} />
        ))}
      </Svg>
      <View style={styles.legend}>
        {data.map((d, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: d.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {d.label}
            </Text>
            <Text style={[styles.legendValue, { color: d.color }]}>
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
  colors: c,
}: {
  data: { label: string; income: number; expense: number }[];
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  const max = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const chartH = 140;
  const barW = Math.min(24, (W / data.length / 2) - 4);

  return (
    <Svg width={W} height={chartH + 30}>
      {data.map((d, i) => {
        const x = (i / data.length) * W + (W / data.length - barW * 2 - 4) / 2;
        const incomeH = (d.income / max) * chartH;
        const expenseH = (d.expense / max) * chartH;

        return (
          <G key={i}>
            <Rect
              x={x}
              y={chartH - incomeH}
              width={barW}
              height={incomeH}
              fill={c.success}
              rx={4}
            />
            <Rect
              x={x + barW + 4}
              y={chartH - expenseH}
              width={barW}
              height={expenseH}
              fill={c.expense}
              rx={4}
            />
            <SvgText
              x={x + barW}
              y={chartH + 20}
              textAnchor="middle"
              fontSize={10}
              fill={c.mutedForeground}
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
  lineColor,
}: {
  data: { date: string; cumulative: number }[];
  lineColor: string;
}) {
  if (data.length < 2) return null;
  const chartH = 120;
  const max = Math.max(...data.map((d) => d.cumulative), 1);

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: chartH - (d.cumulative / max) * chartH,
  }));

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const fillPath =
    path +
    ` L${points[points.length - 1].x},${chartH} L0,${chartH} Z`;

  return (
    <Svg width={W} height={chartH + 20}>
      <Path d={fillPath} fill={lineColor + "22"} />
      <Path d={path} fill="none" stroke={lineColor} strokeWidth={2.5} />
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={lineColor} />
      ))}
    </Svg>
  );
}

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, categories, expenseGroups, savingsEntries } = useApp();

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
      });
    return Object.entries(map)
      .map(([id, value]) => {
        const cat = categories.find((c) => c.id === id);
        return {
          label: cat?.name ?? "Other",
          value,
          color: cat?.color ?? "#94a3b8",
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions, categories]);

  const barData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const key = t.date.slice(0, 7);
      if (!months[key]) months[key] = { income: 0, expense: 0 };
      if (t.type === "income") months[key].income += t.amount;
      else months[key].expense += t.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, v]) => ({
        label: new Date(key + "-01").toLocaleDateString("en-US", {
          month: "short",
        }),
        ...v,
      }));
  }, [transactions]);

  const lineData = useMemo(() => {
    const sorted = [...savingsEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    let cumulative = 0;
    return sorted.map((e) => {
      cumulative += e.amount;
      return { date: e.date, cumulative };
    });
  }, [savingsEntries]);

  const groupTotals = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.groupId] = (map[t.groupId] ?? 0) + t.amount;
      });
    return expenseGroups
      .map((g) => ({ ...g, total: map[g.id] ?? 0 }))
      .filter((g) => g.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [transactions, expenseGroups]);

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
      <Text style={[styles.heading, { color: colors.foreground }]}>
        Reports
      </Text>

      <View
        style={[
          styles.chartCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.chartTitle, { color: colors.foreground }]}>
          Expense Breakdown
        </Text>
        {pieData.length > 0 ? (
          <PieChart data={pieData} />
        ) : (
          <Text style={[styles.noData, { color: colors.mutedForeground }]}>
            No expense data yet
          </Text>
        )}
      </View>

      <View
        style={[
          styles.chartCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.chartHeaderRow}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>
            Income vs Expenses
          </Text>
          <View style={styles.barLegend}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.barLegendText, { color: colors.mutedForeground }]}>
              Income
            </Text>
            <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
            <Text style={[styles.barLegendText, { color: colors.mutedForeground }]}>
              Expense
            </Text>
          </View>
        </View>
        {barData.length > 0 ? (
          <BarChart data={barData} colors={colors} />
        ) : (
          <Text style={[styles.noData, { color: colors.mutedForeground }]}>
            No data yet
          </Text>
        )}
      </View>

      <View
        style={[
          styles.chartCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.chartTitle, { color: colors.foreground }]}>
          Savings Growth
        </Text>
        {lineData.length >= 2 ? (
          <LineChart data={lineData} lineColor={colors.success} />
        ) : (
          <Text style={[styles.noData, { color: colors.mutedForeground }]}>
            Need at least 2 savings entries to show growth
          </Text>
        )}
      </View>

      {groupTotals.length > 0 ? (
        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>
            Spending by Group
          </Text>
          {groupTotals.map((g) => {
            const maxTotal = groupTotals[0].total;
            const pct = g.total / maxTotal;
            return (
              <View key={g.id} style={styles.groupRow}>
                <View style={styles.groupRowTop}>
                  <View style={styles.groupRowLabel}>
                    <View
                      style={[
                        styles.groupRowDot,
                        { backgroundColor: g.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.groupRowName,
                        { color: colors.foreground },
                      ]}
                    >
                      {g.name}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.groupRowAmount,
                      { color: colors.foreground },
                    ]}
                  >
                    {formatCurrency(g.total)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressBg,
                    { backgroundColor: colors.muted },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: g.color, width: `${pct * 100}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 16,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  barLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  barLegendText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginRight: 4,
  },
  noData: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 20,
  },
  legend: {
    marginTop: 16,
    width: "100%",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  legendValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  groupRow: {
    marginBottom: 12,
    gap: 8,
  },
  groupRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupRowLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupRowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  groupRowName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  groupRowAmount: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
});
