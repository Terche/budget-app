import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme, THEMES } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import {
  transactionsToCSV,
  savingsToCSV,
  businessPlansToCSV,
} from "@/services/csvService";

const PALETTE = [
  "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16",
  "#f97316", "#6366f1", "#14b8a6", "#a855f7",
];

export default function SettingsScreen() {
  const colors = useColors();
  const { themeId, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    transactions,
    savingsEntries,
    businessPlans,
    categories,
    expenseGroups,
    userName,
    setUserName,
    addCategory,
    deleteCategory,
    addExpenseGroup,
    deleteExpenseGroup,
  } = useApp();
  const currentTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  const [nameInput, setNameInput] = useState(userName);

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState(PALETTE[0]);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(PALETTE[2]);
  const [newCatGroupId, setNewCatGroupId] = useState(expenseGroups[0]?.id ?? "");
  const [showCatForm, setShowCatForm] = useState(false);

  const groupInputRef = useRef<TextInput>(null);
  const catInputRef = useRef<TextInput>(null);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
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

  function handleAddGroup() {
    if (!newGroupName.trim()) return;
    addExpenseGroup({ name: newGroupName.trim(), color: newGroupColor });
    setNewGroupName("");
    setNewGroupColor(PALETTE[0]);
    setShowGroupForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleDeleteGroup(id: string, name: string) {
    const linked = categories.filter((c) => c.groupId === id).length;
    Alert.alert(
      "Delete Group",
      linked > 0
        ? `"${name}" has ${linked} categories. Deleting it will also remove those categories. Continue?`
        : `Delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            categories
              .filter((c) => c.groupId === id)
              .forEach((c) => deleteCategory(c.id));
            deleteExpenseGroup(id);
          },
        },
      ],
    );
  }

  function handleAddCategory() {
    if (!newCatName.trim()) return;
    if (!newCatGroupId) {
      Alert.alert("Select Group", "Please select an expense group first.");
      return;
    }
    addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      groupId: newCatGroupId,
    });
    setNewCatName("");
    setNewCatColor(PALETTE[2]);
    setShowCatForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleDeleteCategory(id: string, name: string) {
    Alert.alert("Delete Category", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteCategory(id) },
    ]);
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
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 42 }} />
      </View>

      {/* ── Profile Name ── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Dashboard Title</Text>
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              Shown at the top of your dashboard
            </Text>
          </View>
        </View>
        <View style={styles.nameRow}>
          <TextInput
            style={[
              styles.nameInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="Your Finances"
            placeholderTextColor={colors.mutedForeground}
            value={nameInput}
            onChangeText={setNameInput}
            returnKeyType="done"
            onSubmitEditing={() => setUserName(nameInput.trim())}
            maxLength={32}
          />
          <TouchableOpacity
            style={[
              styles.nameSaveBtn,
              {
                backgroundColor:
                  nameInput.trim() !== userName ? colors.primary : colors.muted,
              },
            ]}
            onPress={() => {
              setUserName(nameInput.trim());
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
            disabled={nameInput.trim() === userName}
          >
            <Feather
              name="check"
              size={16}
              color={nameInput.trim() !== userName ? "#fff" : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
        {nameInput.trim() && (
          <Text style={[styles.namePreview, { color: colors.mutedForeground }]}>
            Preview: <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>{nameInput.trim()}</Text>
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.section, styles.appearanceRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push("/theme-picker")}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
          <Feather name="sun" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 2 }]}>
            Appearance
          </Text>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {currentTheme.emoji} {currentTheme.name} · {mode === "dark" ? "Dark" : "Light"}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      {/* ── Expense Groups ── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Expense Groups
          </Text>
          <TouchableOpacity
            style={[styles.addRowBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}
            onPress={() => {
              setShowGroupForm((v) => !v);
              setTimeout(() => groupInputRef.current?.focus(), 100);
            }}
          >
            <Feather name={showGroupForm ? "x" : "plus"} size={14} color={colors.primary} />
            <Text style={[styles.addRowBtnText, { color: colors.primary }]}>
              {showGroupForm ? "Cancel" : "Add"}
            </Text>
          </TouchableOpacity>
        </View>

        {showGroupForm && (
          <View style={[styles.inlineForm, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              ref={groupInputRef}
              style={[styles.inlineInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder="Group name"
              placeholderTextColor={colors.mutedForeground}
              value={newGroupName}
              onChangeText={setNewGroupName}
              returnKeyType="done"
              onSubmitEditing={handleAddGroup}
            />
            <View style={styles.paletteRow}>
              {PALETTE.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.paletteDot, { backgroundColor: c }, newGroupColor === c && styles.paletteDotActive]}
                  onPress={() => setNewGroupColor(c)}
                >
                  {newGroupColor === c && <Feather name="check" size={10} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.inlineSaveBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddGroup}
            >
              <Text style={styles.inlineSaveBtnText}>Add Group</Text>
            </TouchableOpacity>
          </View>
        )}

        {expenseGroups.length === 0 ? (
          <Text style={[styles.emptyNote, { color: colors.mutedForeground }]}>No groups yet</Text>
        ) : (
          expenseGroups.map((g) => (
            <View key={g.id} style={[styles.listItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.listDot, { backgroundColor: g.color }]} />
              <Text style={[styles.listLabel, { color: colors.foreground }]}>{g.name}</Text>
              <Text style={[styles.listCount, { color: colors.mutedForeground }]}>
                {categories.filter((c) => c.groupId === g.id).length} cats
              </Text>
              <TouchableOpacity
                onPress={() => handleDeleteGroup(g.id, g.name)}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Feather name="trash-2" size={14} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* ── Categories ── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Categories
          </Text>
          <TouchableOpacity
            style={[styles.addRowBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}
            onPress={() => {
              setShowCatForm((v) => !v);
              setTimeout(() => catInputRef.current?.focus(), 100);
            }}
          >
            <Feather name={showCatForm ? "x" : "plus"} size={14} color={colors.primary} />
            <Text style={[styles.addRowBtnText, { color: colors.primary }]}>
              {showCatForm ? "Cancel" : "Add"}
            </Text>
          </TouchableOpacity>
        </View>

        {showCatForm && (
          <View style={[styles.inlineForm, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              ref={catInputRef}
              style={[styles.inlineInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder="Category name"
              placeholderTextColor={colors.mutedForeground}
              value={newCatName}
              onChangeText={setNewCatName}
              returnKeyType="done"
              onSubmitEditing={handleAddCategory}
            />

            <Text style={[styles.subLabel, { color: colors.mutedForeground }]}>Group</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 10 }}>
              {expenseGroups.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.groupChip,
                    {
                      backgroundColor: newCatGroupId === g.id ? g.color + "22" : colors.card,
                      borderColor: newCatGroupId === g.id ? g.color : colors.border,
                    },
                  ]}
                  onPress={() => setNewCatGroupId(g.id)}
                >
                  <View style={[styles.chipDot, { backgroundColor: g.color }]} />
                  <Text style={[styles.groupChipText, { color: newCatGroupId === g.id ? g.color : colors.mutedForeground }]}>
                    {g.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.subLabel, { color: colors.mutedForeground }]}>Color</Text>
            <View style={styles.paletteRow}>
              {PALETTE.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.paletteDot, { backgroundColor: c }, newCatColor === c && styles.paletteDotActive]}
                  onPress={() => setNewCatColor(c)}
                >
                  {newCatColor === c && <Feather name="check" size={10} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.inlineSaveBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddCategory}
            >
              <Text style={styles.inlineSaveBtnText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        )}

        {categories.length === 0 ? (
          <Text style={[styles.emptyNote, { color: colors.mutedForeground }]}>No categories yet</Text>
        ) : (
          categories.map((c) => {
            const group = expenseGroups.find((g) => g.id === c.groupId);
            return (
              <View key={c.id} style={[styles.listItem, { borderBottomColor: colors.border }]}>
                <View style={[styles.listDot, { backgroundColor: c.color }]} />
                <Text style={[styles.listLabel, { color: colors.foreground }]}>{c.name}</Text>
                <Text style={[styles.listCount, { color: colors.mutedForeground }]}>
                  {group?.name ?? ""}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteCategory(c.id, c.name)}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Feather name="trash-2" size={14} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

      {/* ── Export ── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Export Data (CSV)</Text>
        <Text style={[styles.metaText, { color: colors.mutedForeground, marginBottom: 12 }]}>
          Export your data as CSV files compatible with Google Sheets.
        </Text>

        {[
          { label: "Export Transactions", meta: `${transactions.length} records`, icon: "file-text", color: colors.primary, fn: exportTransactionsCSV },
          { label: "Export Savings", meta: `${savingsEntries.length} entries`, icon: "trending-up", color: colors.success, fn: exportSavingsCSV },
          { label: "Export Business Plans", meta: `${businessPlans.length} plans`, icon: "briefcase", color: colors.warning, fn: exportBusinessCSV },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.exportBtn, { borderColor: colors.border }]}
            onPress={item.fn}
          >
            <View style={[styles.iconBox, { backgroundColor: item.color + "22" }]}>
              <Feather name={item.icon as any} size={18} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.exportLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.meta}</Text>
            </View>
            <Feather name="share" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── About ── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
        {[
          { label: "App Version", value: "1.0.0" },
          { label: "Data Storage", value: "Local (AsyncStorage)" },
          { label: "Total Transactions", value: String(transactions.length) },
        ].map((row) => (
          <View key={row.label} style={styles.aboutRow}>
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{row.label}</Text>
            <Text style={[styles.aboutValue, { color: colors.foreground }]}>{row.value}</Text>
          </View>
        ))}
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
  appearanceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  addRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  addRowBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  inlineForm: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  inlineInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  subLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  paletteRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  paletteDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  paletteDotActive: {
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  groupChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  groupChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  inlineSaveBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  inlineSaveBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyNote: { fontSize: 13, fontFamily: "Inter_400Regular", paddingVertical: 8 },
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
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  exportLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  metaText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  aboutValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    marginBottom: 8,
  },
  nameInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  nameSaveBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  namePreview: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
});
