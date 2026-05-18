import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";
import { FREQ_LABELS, freqDays } from "@/app/(tabs)/plans";

export default function PlanDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { savingsPlans, savingsEntries, updateSavingsPlan, deleteSavingsPlan, addSavingsEntry, deleteSavingsEntry } = useApp();

  const plan = savingsPlans.find((p) => p.id === id);

  const entries = useMemo(
    () => [...(savingsEntries.filter((e) => e.planId === id))].sort((a, b) => b.date.localeCompare(a.date)),
    [savingsEntries, id],
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [entryAmount, setEntryAmount] = useState(plan ? String(plan.contributionAmount) : "");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [entryNotes, setEntryNotes] = useState("");

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  const totalSaved = useMemo(() => entries.reduce((s, e) => s + e.amount, 0), [entries]);

  const projectedDates = useMemo((): string[] => {
    if (!plan) return [];
    const days = freqDays(plan);
    const today = new Date().toISOString().split("T")[0];
    const dates: string[] = [];
    let d = new Date(plan.startDate);
    for (let i = 0; i < 12; i++) {
      const iso = d.toISOString().split("T")[0];
      if (iso > today) dates.push(iso);
      d.setDate(d.getDate() + days);
    }
    return dates.slice(0, 6);
  }, [plan]);

  if (!plan) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.heading, { color: colors.foreground }]}>Plan not found</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>
    );
  }

  function handleAddEntry() {
    const amount = parseFloat(entryAmount);
    if (!amount || amount <= 0) { Alert.alert("Validation", "Enter a valid amount."); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addSavingsEntry({ planId: plan!.id, date: entryDate, amount, isManual: true, notes: entryNotes.trim() });
    setEntryAmount(String(plan!.contributionAmount));
    setEntryDate(new Date().toISOString().split("T")[0]);
    setEntryNotes("");
    setShowAddForm(false);
  }

  function handleDeleteEntry(entryId: string) {
    Alert.alert("Delete Entry", "Remove this contribution?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteSavingsEntry(entryId) },
    ]);
  }

  function handleToggleActive() {
    updateSavingsPlan({ ...plan!, isActive: !plan!.isActive });
  }

  function handleDeletePlan() {
    Alert.alert("Delete Plan", `Delete "${plan!.name}" and all its contributions?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteSavingsPlan(plan!.id); router.back(); } },
    ]);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.foreground }]} numberOfLines={1}>{plan.name}</Text>
        <TouchableOpacity onPress={handleDeletePlan} style={styles.headerBtn}>
          <Feather name="trash-2" size={18} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: botPad + insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.summaryAmount, { color: colors.primaryForeground }]}>{formatCurrency(totalSaved)}</Text>
          <Text style={[styles.summaryLabel, { color: colors.primaryForeground + "cc" }]}>Total Saved</Text>
          <View style={styles.summaryMeta}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaVal, { color: colors.primaryForeground }]}>{entries.length}</Text>
              <Text style={[styles.metaKey, { color: colors.primaryForeground + "99" }]}>Entries</Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: colors.primaryForeground + "33" }]} />
            <View style={styles.metaItem}>
              <Text style={[styles.metaVal, { color: colors.primaryForeground }]}>{FREQ_LABELS[plan.frequency]}</Text>
              <Text style={[styles.metaKey, { color: colors.primaryForeground + "99" }]}>Frequency</Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: colors.primaryForeground + "33" }]} />
            <View style={styles.metaItem}>
              <Text style={[styles.metaVal, { color: colors.primaryForeground }]}>{formatCurrency(plan.contributionAmount)}</Text>
              <Text style={[styles.metaKey, { color: colors.primaryForeground + "99" }]}>Per Entry</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Controls</Text>
          </View>
          <View style={[styles.controlsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.controlRow} onPress={handleToggleActive} activeOpacity={0.7}>
              <View style={styles.controlLeft}>
                <Feather name={plan.isActive ? "pause-circle" : "play-circle"} size={20} color={plan.isActive ? colors.mutedForeground : colors.primary} />
                <Text style={[styles.controlLabel, { color: colors.foreground }]}>
                  {plan.isActive ? "Pause Plan" : "Resume Plan"}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            <View style={[styles.controlDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.controlRow} onPress={() => setShowAddForm(!showAddForm)} activeOpacity={0.7}>
              <View style={styles.controlLeft}>
                <Feather name="plus-circle" size={20} color={colors.primary} />
                <Text style={[styles.controlLabel, { color: colors.foreground }]}>Log a Contribution</Text>
              </View>
              <Feather name={showAddForm ? "chevron-up" : "chevron-right"} size={16} color={colors.mutedForeground} />
            </TouchableOpacity>

            {showAddForm && (
              <View style={[styles.addForm, { borderTopColor: colors.border }]}>
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Amount (₱)</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  value={entryAmount}
                  onChangeText={setEntryAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedForeground}
                />
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  value={entryDate}
                  onChangeText={setEntryDate}
                  placeholder="2025-01-01"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                />
                <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Notes (optional)</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  value={entryNotes}
                  onChangeText={setEntryNotes}
                  placeholder="Optional note"
                  placeholderTextColor={colors.mutedForeground}
                />
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddEntry}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save Contribution</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {projectedDates.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Schedule</Text>
            <View style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {projectedDates.map((date, i) => (
                <View key={date}>
                  <View style={styles.scheduleRow}>
                    <Feather name="calendar" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.scheduleDate, { color: colors.foreground }]}>{formatDate(date)}</Text>
                    <Text style={[styles.scheduleAmount, { color: colors.primary }]}>{formatCurrency(plan.contributionAmount)}</Text>
                  </View>
                  {i < projectedDates.length - 1 && (
                    <View style={[styles.scheduleDivider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Contribution History{entries.length > 0 ? ` (${entries.length})` : ""}
          </Text>
          {entries.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="inbox" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No contributions logged yet.</Text>
              <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Tap "Log a Contribution" above to record your first entry.</Text>
            </View>
          ) : (
            <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {entries.map((entry, i) => (
                <View key={entry.id}>
                  <View style={styles.entryRow}>
                    <View style={[styles.entryDot, { backgroundColor: colors.primary }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.entryDate, { color: colors.foreground }]}>{formatDate(entry.date)}</Text>
                      {entry.notes ? (
                        <Text style={[styles.entryNotes, { color: colors.mutedForeground }]}>{entry.notes}</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.entryAmount, { color: colors.foreground }]}>{formatCurrency(entry.amount)}</Text>
                    <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Feather name="x" size={14} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                  {i < entries.length - 1 && (
                    <View style={[styles.entryDivider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
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
  heading: { fontSize: 18, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center", marginHorizontal: 8 },
  headerBtn: { width: 36, alignItems: "center" },
  summaryCard: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  summaryAmount: { fontSize: 36, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  summaryMeta: { flexDirection: "row", marginTop: 20, gap: 0 },
  metaItem: { flex: 1, alignItems: "center" },
  metaVal: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  metaKey: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  metaDivider: { width: StyleSheet.hairlineWidth, marginVertical: 4 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  controlsCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  controlRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  controlLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  controlLabel: { fontSize: 15, fontFamily: "Inter_400Regular" },
  controlDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  addForm: { borderTopWidth: StyleSheet.hairlineWidth, padding: 16, gap: 4 },
  formLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 4, marginTop: 8 },
  formInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, fontFamily: "Inter_400Regular", borderWidth: 1 },
  saveBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 12 },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  scheduleCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  scheduleDate: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  scheduleAmount: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  scheduleDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
  emptyCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 32, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 4 },
  emptyHint: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
  historyCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  entryRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  entryDot: { width: 8, height: 8, borderRadius: 4 },
  entryDate: { fontSize: 14, fontFamily: "Inter_500Medium" },
  entryNotes: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  entryAmount: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  entryDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
});
