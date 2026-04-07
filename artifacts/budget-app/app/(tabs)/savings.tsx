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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/services/roiService";

const ACCOUNT_ICONS: Record<string, string> = {
  BDO: "🏦",
  BPI: "🏦",
  UnionBank: "🏦",
  Metrobank: "🏦",
  "Security Bank": "🏦",
  PNB: "🏦",
  Landbank: "🏦",
  GCash: "📱",
  Maya: "📱",
  Cash: "💵",
  Other: "💳",
};

export default function AccountsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bankAccounts, accountEntries, deleteBankAccount } = useApp();

  const totalBalance = useMemo(
    () => bankAccounts.reduce((sum, a) => sum + a.balance, 0),
    [bankAccounts],
  );

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  function handleDelete(id: string, name: string) {
    Alert.alert(
      "Delete Account",
      `Delete "${name}" and all its transaction history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBankAccount(id),
        },
      ],
    );
  }

  function accountRecentEntries(accountId: string) {
    return [...accountEntries]
      .filter((e) => e.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
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
          Accounts
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
          {
            backgroundColor: colors.primary + "18",
            borderColor: colors.primary + "44",
          },
        ]}
      >
        <View
          style={[styles.totalIcon, { backgroundColor: colors.primary + "22" }]}
        >
          <Feather name="credit-card" size={22} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
            Total Balance
          </Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            {formatCurrency(totalBalance)}
          </Text>
        </View>
        <View style={styles.totalRight}>
          <Text style={[styles.accountCount, { color: colors.mutedForeground }]}>
            {bankAccounts.length} account{bankAccounts.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {bankAccounts.length === 0 ? (
        <EmptyState
          icon="credit-card"
          title="No bank accounts"
          subtitle="Add your BDO, BPI, GCash, or any account to track your balance"
        />
      ) : (
        bankAccounts.map((account) => {
          const recent = accountRecentEntries(account.id);
          const icon = ACCOUNT_ICONS[account.bankName] ?? "💳";

          return (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.accountCard,
                {
                  backgroundColor: colors.card,
                  borderColor: account.color + "55",
                  borderLeftColor: account.color,
                },
              ]}
              activeOpacity={0.88}
              onPress={() =>
                router.push({
                  pathname: "/savings/[id]",
                  params: { id: account.id },
                })
              }
            >
              <View style={styles.accountHeader}>
                <View style={styles.accountLeft}>
                  <View
                    style={[
                      styles.accountEmoji,
                      { backgroundColor: account.color + "22" },
                    ]}
                  >
                    <Text style={styles.emojiText}>{icon}</Text>
                  </View>
                  <View>
                    <Text
                      style={[styles.accountName, { color: colors.foreground }]}
                    >
                      {account.name}
                    </Text>
                    <Text
                      style={[
                        styles.accountMeta,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {account.bankName} ·{" "}
                      {account.accountType.charAt(0).toUpperCase() +
                        account.accountType.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.accountRight}>
                  <Text
                    style={[styles.accountBalance, { color: account.color }]}
                  >
                    {formatCurrency(account.balance)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(account.id, account.name)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <Feather
                      name="trash-2"
                      size={14}
                      color={colors.destructive}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {recent.length > 0 && (
                <View
                  style={[
                    styles.recentEntries,
                    { borderTopColor: colors.border },
                  ]}
                >
                  {recent.map((entry) => (
                    <View key={entry.id} style={styles.entryRow}>
                      <Feather
                        name={
                          entry.type === "deposit" ? "arrow-down-left" : "arrow-up-right"
                        }
                        size={12}
                        color={
                          entry.type === "deposit"
                            ? colors.success
                            : colors.destructive
                        }
                      />
                      <Text
                        style={[
                          styles.entryDesc,
                          { color: colors.mutedForeground },
                        ]}
                        numberOfLines={1}
                      >
                        {entry.description || (entry.type === "deposit" ? "Deposit" : "Withdrawal")}
                      </Text>
                      <Text
                        style={[
                          styles.entryAmt,
                          {
                            color:
                              entry.type === "deposit"
                                ? colors.success
                                : colors.destructive,
                          },
                        ]}
                      >
                        {entry.type === "deposit" ? "+" : "-"}
                        {formatCurrency(entry.amount)}
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
    gap: 14,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  totalIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  totalRight: {
    marginLeft: "auto",
  },
  accountCount: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  accountCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 14,
    overflow: "hidden",
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  accountEmoji: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 22,
  },
  accountName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  accountMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textTransform: "capitalize",
  },
  accountRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  accountBalance: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  deleteBtn: {
    padding: 4,
  },
  recentEntries: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  entryDesc: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  entryAmt: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
