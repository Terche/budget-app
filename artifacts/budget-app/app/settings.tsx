import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/context/AppContext";
import { useTheme, THEMES } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import {
  transactionsToCSV,
  savingsToCSV,
  businessPlansToCSV,
} from "@/services/csvService";

export default function SettingsScreen() {
  const colors = useColors();
  const { themeId, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const { transactions, savingsEntries, businessPlans, categories, expenseGroups, addCategory, addExpenseGroup } = useApp();
  const currentTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  const [newCatName, setNewCatName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  async function exportTransactionsCSV() {
    try {
      const csv = transactionsToCSV(transactions);
      await Share.share({ message: csv, title: "transactions.csv" });
    } catch {
      Alert.alert("Export Error", "Failed to export transactions");
    }
  }

  async function exportSavingsCSV() {
    try {
      const csv = savingsToCSV(savingsEntries);
      await Share.share({ message: csv, title: "savings.csv" });
    } catch {
      Alert.alert("Export Error", "Failed to export savings");
    }
  }

  async function exportBusinessCSV() {
    try {
      const csv = businessPlansToCSV(businessPlans);
      await Share.share({ message: csv, title: "business_plans.csv" });
    } catch {
      Alert.alert("Export Error", "Failed to export business plans");
    }
  }

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
        <Text style={[styles.heading, { color: colors.foreground }]}>
          Settings
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <TouchableOpacity
        style={[
          styles.section,
          styles.appearanceRow,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={() => router.push("/theme-picker")}
        activeOpacity={0.7}
      >
        <View style={[styles.exportIcon, { backgroundColor: colors.accent }]}>
          <Feather name="sun" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 2 }]}>
            Appearance
          </Text>
          <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>
            {currentTheme.emoji} {currentTheme.name} · {mode === "dark" ? "Dark" : "Light"}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Export Data (CSV)
        </Text>
        <Text
          style={[styles.sectionDesc, { color: colors.mutedForeground }]}
        >
          Export your data as CSV files compatible with Google Sheets. Share
          them to Google Drive or any other cloud storage.
        </Text>

        <TouchableOpacity
          style={[styles.exportBtn, { borderColor: colors.border }]}
          onPress={exportTransactionsCSV}
        >
          <View
            style={[styles.exportIcon, { backgroundColor: colors.primary + "22" }]}
          >
            <Feather name="file-text" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.exportLabel, { color: colors.foreground }]}>
              Export Transactions
            </Text>
            <Text
              style={[styles.exportMeta, { color: colors.mutedForeground }]}
            >
              {transactions.length} records · transactions.csv
            </Text>
          </View>
          <Feather name="share" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportBtn, { borderColor: colors.border }]}
          onPress={exportSavingsCSV}
        >
          <View
            style={[styles.exportIcon, { backgroundColor: colors.success + "22" }]}
          >
            <Feather name="trending-up" size={18} color={colors.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.exportLabel, { color: colors.foreground }]}>
              Export Savings
            </Text>
            <Text
              style={[styles.exportMeta, { color: colors.mutedForeground }]}
            >
              {savingsEntries.length} entries · savings.csv
            </Text>
          </View>
          <Feather name="share" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportBtn, { borderColor: colors.border }]}
          onPress={exportBusinessCSV}
        >
          <View
            style={[styles.exportIcon, { backgroundColor: colors.warning + "22" }]}
          >
            <Feather name="briefcase" size={18} color={colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.exportLabel, { color: colors.foreground }]}>
              Export Business Plans
            </Text>
            <Text
              style={[styles.exportMeta, { color: colors.mutedForeground }]}
            >
              {businessPlans.length} plans · business_plans.csv
            </Text>
          </View>
          <Feather name="share" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Expense Groups
        </Text>
        {expenseGroups.map((g) => (
          <View
            key={g.id}
            style={[
              styles.listItem,
              { borderBottomColor: colors.border },
            ]}
          >
            <View
              style={[styles.listDot, { backgroundColor: g.color }]}
            />
            <Text style={[styles.listLabel, { color: colors.foreground }]}>
              {g.name}
            </Text>
            <Text
              style={[styles.listCount, { color: colors.mutedForeground }]}
            >
              {categories.filter((c) => c.groupId === g.id).length} categories
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Categories
        </Text>
        {categories.map((c) => {
          const group = expenseGroups.find((g) => g.id === c.groupId);
          return (
            <View
              key={c.id}
              style={[
                styles.listItem,
                { borderBottomColor: colors.border },
              ]}
            >
              <View
                style={[styles.listDot, { backgroundColor: c.color }]}
              />
              <Text style={[styles.listLabel, { color: colors.foreground }]}>
                {c.name}
              </Text>
              <Text
                style={[styles.listCount, { color: colors.mutedForeground }]}
              >
                {group?.name ?? ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          About
        </Text>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>
            App Version
          </Text>
          <Text style={[styles.aboutValue, { color: colors.foreground }]}>
            1.0.0
          </Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>
            Data Storage
          </Text>
          <Text style={[styles.aboutValue, { color: colors.foreground }]}>
            Local (AsyncStorage)
          </Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>
            Total Transactions
          </Text>
          <Text style={[styles.aboutValue, { color: colors.foreground }]}>
            {transactions.length}
          </Text>
        </View>
      </View>
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
  heading: { fontSize: 24, fontFamily: "Inter_700Bold" },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 8 },
  sectionDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
    lineHeight: 20,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  exportIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  exportLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  exportMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listDot: { width: 10, height: 10, borderRadius: 5 },
  listLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  listCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  appearanceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  aboutLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  aboutValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
