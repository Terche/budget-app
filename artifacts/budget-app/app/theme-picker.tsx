import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { THEMES, useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

export default function ThemePickerScreen() {
  const colors = useColors();
  const { themeId, mode, setThemeId, setMode } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={mode === "dark" ? "light-content" : "dark-content"} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Appearance</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          COLOR MODE
        </Text>
        <View style={[styles.modeRow, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              { borderRadius: colors.radius - 2 },
              mode === "light" && { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
            ]}
            onPress={() => setMode("light")}
          >
            <Feather name="sun" size={18} color={mode === "light" ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.modeBtnText, { color: mode === "light" ? colors.primary : colors.mutedForeground }]}>
              Light
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              { borderRadius: colors.radius - 2 },
              mode === "dark" && { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
            ]}
            onPress={() => setMode("dark")}
          >
            <Feather name="moon" size={18} color={mode === "dark" ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.modeBtnText, { color: mode === "dark" ? colors.primary : colors.mutedForeground }]}>
              Dark
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 28 }]}>
          COLOR THEME
        </Text>
        <View style={styles.themeGrid}>
          {THEMES.map((theme) => {
            const palette = mode === "dark" ? theme.dark : theme.light;
            const isSelected = themeId === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: colors.card,
                    borderRadius: colors.radius,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setThemeId(theme.id)}
              >
                <View style={styles.swatchRow}>
                  <View style={[styles.swatch, { backgroundColor: palette.primary }]} />
                  <View style={[styles.swatch, { backgroundColor: palette.background }]} />
                  <View style={[styles.swatch, { backgroundColor: palette.success }]} />
                  <View style={[styles.swatch, { backgroundColor: palette.expense }]} />
                </View>
                <View style={styles.themeCardFooter}>
                  <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                  <Text style={[styles.themeName, { color: colors.foreground }]}>
                    {theme.name}
                  </Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                    <Feather name="check" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>PREVIEW</Text>
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.card,
              borderRadius: colors.radius,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.previewRow}>
            <View style={[styles.previewIcon, { backgroundColor: colors.accent, borderRadius: colors.radius / 2 }]}>
              <Feather name="trending-up" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.previewTitle, { color: colors.foreground }]}>Total Balance</Text>
              <Text style={[styles.previewSub, { color: colors.mutedForeground }]}>Updated now</Text>
            </View>
            <Text style={[styles.previewAmount, { color: colors.income }]}>₱24,500</Text>
          </View>
          <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
          <View style={styles.previewRow}>
            <View style={[styles.previewIcon, { backgroundColor: "#fee2e2", borderRadius: colors.radius / 2 }]}>
              <Feather name="arrow-down-left" size={16} color={colors.expense} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.previewTitle, { color: colors.foreground }]}>Groceries</Text>
              <Text style={[styles.previewSub, { color: colors.mutedForeground }]}>Today</Text>
            </View>
            <Text style={[styles.previewAmount, { color: colors.expense }]}>-₱850</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 10,
  },
  modeRow: {
    flexDirection: "row",
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  modeBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  themeCard: {
    width: "47%",
    padding: 14,
    position: "relative",
    overflow: "hidden",
  },
  swatchRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  themeCardFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  themeEmoji: { fontSize: 16 },
  themeName: { fontSize: 13, fontFamily: "Inter_500Medium" },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  previewLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginTop: 28,
    marginBottom: 10,
  },
  previewCard: { padding: 16 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  previewIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  previewTitle: { fontSize: 14, fontFamily: "Inter_500Medium" },
  previewSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  previewAmount: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  previewDivider: { height: StyleSheet.hairlineWidth, marginVertical: 12 },
});
