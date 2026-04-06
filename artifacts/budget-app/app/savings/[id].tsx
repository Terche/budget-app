import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

export default function SavingsPlanDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { savingsPlans, savingsEntries, generateSavingsEntries, deleteSavingsEntry } = useApp();

  const plan = savingsPlans.find((p) => p.id === id);
  const entries = useMemo(
    () =>
      savingsEntries
        .filter((e) => e.planId === id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [savingsEntries, id],
  );

  const total = useMemo(
    () => entries.reduce((s, e) => s + e.amount, 0),
    [entries],
  );

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  if (!plan) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text
          style={[
            styles.heading,
            { color: colors.foreground, textAlign: "center", marginTop: 100 },
          ]}
        >
          Plan not found
        </Text>
      </View>
    );
  }

  function handleGenerate() {
    generateSavingsEntries(id!);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleDeleteEntry(entryId: string) {
    Alert.alert("Delete Entry", "Remove this savings entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteSavingsEntry(entryId),
      },
    ]);
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad + 16,
        paddingHorizontal: 20,
        paddingBottom: botPad + 40,
      }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[
                styles.backBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.heading, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {plan.name}
              </Text>
              <Text
                style={[styles.subheading, { color: colors.mutedForeground }]}
              >
                Every 14 days · {formatCurrency(plan.contributionAmount)}/cycle
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.generateBtn,
                { backgroundColor: colors.accent },
              ]}
              onPress={handleGenerate}
            >
              <Feather name="refresh-cw" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.totalCard,
              { backgroundColor: colors.success + "18", borderColor: colors.success + "44" },
            ]}
          >
            <Text
              style={[styles.totalLabel, { color: colors.mutedForeground }]}
            >
              Total Accumulated
            </Text>
            <Text style={[styles.totalValue, { color: colors.success }]}>
              {formatCurrency(total)}
            </Text>
            <Text style={[styles.totalMeta, { color: colors.mutedForeground }]}>
              {entries.length} entries · Started{" "}
              {new Date(plan.startDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Entries
          </Text>
        </>
      }
      data={entries}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <EmptyState
          icon="clock"
          title="No entries yet"
          subtitle="Tap the refresh button to generate bi-weekly entries from your start date"
        />
      }
      renderItem={({ item }) => (
        <View
          style={[
            styles.entryItem,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.entryDot,
              { backgroundColor: item.isManual ? colors.warning : colors.success },
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.entryDate, { color: colors.foreground }]}>
              {new Date(item.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            {item.notes ? (
              <Text
                style={[styles.entryNotes, { color: colors.mutedForeground }]}
              >
                {item.notes}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.entryAmount, { color: colors.success }]}>
            +{formatCurrency(item.amount)}
          </Text>
          <TouchableOpacity
            onPress={() => handleDeleteEntry(item.id)}
            style={{ padding: 4 }}
          >
            <Feather name="trash-2" size={14} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  heading: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subheading: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  generateBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  totalCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
    gap: 6,
  },
  totalLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  totalValue: { fontSize: 32, fontFamily: "Inter_700Bold" },
  totalMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  entryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  entryDot: { width: 10, height: 10, borderRadius: 5 },
  entryDate: { fontSize: 14, fontFamily: "Inter_500Medium" },
  entryNotes: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  entryAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },
});
