import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
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

type EntryType = "deposit" | "withdrawal";

export default function AccountDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bankAccounts, accountEntries, addAccountEntry, deleteAccountEntry } =
    useApp();

  const account = bankAccounts.find((a) => a.id === id);
  const entries = [...accountEntries]
    .filter((e) => e.accountId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [entryType, setEntryType] = useState<EntryType>("deposit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Platform.OS === "web" ? 34 : 0;

  if (!account) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={{ color: colors.mutedForeground }}>Account not found</Text>
      </View>
    );
  }

  function handleAddEntry() {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    addAccountEntry({
      accountId: id!,
      type: entryType,
      amount: parsedAmount,
      date: new Date().toISOString().split("T")[0],
      description: description.trim(),
    });
    setAmount("");
    setDescription("");
    setShowForm(false);
  }

  function handleDeleteEntry(entryId: string) {
    Alert.alert("Delete Entry", "Remove this transaction from this account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAccountEntry(entryId),
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.accountName, { color: colors.foreground }]}>
            {account.name}
          </Text>
          <Text
            style={[styles.accountMeta, { color: colors.mutedForeground }]}
          >
            {account.bankName} · {account.accountType}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addEntryBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowForm((v) => !v)}
        >
          <Feather
            name={showForm ? "x" : "plus"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.balanceCard,
          {
            backgroundColor: account.color + "18",
            borderColor: account.color + "44",
          },
        ]}
      >
        <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>
          Current Balance
        </Text>
        <Text style={[styles.balanceValue, { color: account.color }]}>
          {formatCurrency(account.balance)}
        </Text>
      </View>

      {showForm && (
        <View
          style={[
            styles.form,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              marginHorizontal: 20,
            },
          ]}
        >
          <View style={styles.typeToggle}>
            {(["deposit", "withdrawal"] as EntryType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor:
                      entryType === t
                        ? t === "deposit"
                          ? colors.success + "22"
                          : colors.destructive + "22"
                        : "transparent",
                    borderColor:
                      entryType === t
                        ? t === "deposit"
                          ? colors.success
                          : colors.destructive
                        : colors.border,
                  },
                ]}
                onPress={() => setEntryType(t)}
              >
                <Feather
                  name={t === "deposit" ? "arrow-down-left" : "arrow-up-right"}
                  size={14}
                  color={
                    entryType === t
                      ? t === "deposit"
                        ? colors.success
                        : colors.destructive
                      : colors.mutedForeground
                  }
                />
                <Text
                  style={[
                    styles.toggleText,
                    {
                      color:
                        entryType === t
                          ? t === "deposit"
                            ? colors.success
                            : colors.destructive
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[
              styles.formInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="Amount (₱)"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <TextInput
            style={[
              styles.formInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            style={[
              styles.confirmBtn,
              {
                backgroundColor:
                  entryType === "deposit"
                    ? colors.success
                    : colors.destructive,
              },
            ]}
            onPress={handleAddEntry}
          >
            <Text style={styles.confirmBtnText}>
              {entryType === "deposit" ? "Add Deposit" : "Add Withdrawal"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: botPad + 100,
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="list" size={36} color={colors.mutedForeground} />
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              No transactions yet
            </Text>
            <Text
              style={[styles.emptySubText, { color: colors.mutedForeground }]}
            >
              Tap + to record a deposit or withdrawal
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.entryRow,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.entryIcon,
                {
                  backgroundColor:
                    item.type === "deposit"
                      ? colors.success + "22"
                      : colors.destructive + "22",
                },
              ]}
            >
              <Feather
                name={
                  item.type === "deposit" ? "arrow-down-left" : "arrow-up-right"
                }
                size={16}
                color={
                  item.type === "deposit" ? colors.success : colors.destructive
                }
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.entryDesc, { color: colors.foreground }]}>
                {item.description ||
                  (item.type === "deposit" ? "Deposit" : "Withdrawal")}
              </Text>
              <Text
                style={[styles.entryDate, { color: colors.mutedForeground }]}
              >
                {new Date(item.date).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <Text
              style={[
                styles.entryAmount,
                {
                  color:
                    item.type === "deposit"
                      ? colors.success
                      : colors.destructive,
                },
              ]}
            >
              {item.type === "deposit" ? "+" : "-"}
              {formatCurrency(item.amount)}
            </Text>
            <TouchableOpacity
              onPress={() => handleDeleteEntry(item.id)}
              style={styles.deleteEntryBtn}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  headerCenter: { flex: 1 },
  accountName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  accountMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textTransform: "capitalize",
  },
  addEntryBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceCard: {
    margin: 20,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
  },
  form: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
    gap: 10,
  },
  typeToggle: {
    flexDirection: "row",
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  formInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  confirmBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  entryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  entryDesc: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  entryDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  entryAmount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  deleteEntryBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
