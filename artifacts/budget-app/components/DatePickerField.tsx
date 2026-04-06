import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (dateStr: string) => void;
}

function toDate(str: string): Date {
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

function toStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  const colors = useColors();
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(toDate(value));

  const displayDate = toDate(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (Platform.OS === "web") {
    return (
      <View style={styles.wrapper}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            backgroundColor: colors.input,
            color: colors.foreground,
            border: `1px solid ${colors.border}`,
            borderRadius: colors.radius,
            padding: "12px 14px",
            fontSize: 15,
            width: "100%",
            boxSizing: "border-box",
            fontFamily: "Inter_400Regular",
            outline: "none",
          }}
        />
      </View>
    );
  }

  const handleChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
      if (selected) onChange(toStr(selected));
    } else {
      if (selected) setTempDate(selected);
    }
  };

  const handleConfirmIOS = () => {
    onChange(toStr(tempDate));
    setShow(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.trigger,
          {
            backgroundColor: colors.input,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
        onPress={() => {
          setTempDate(toDate(value));
          setShow(true);
        }}
      >
        <Feather name="calendar" size={16} color={colors.mutedForeground} />
        <Text style={[styles.triggerText, { color: colors.foreground }]}>
          {displayDate}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
      </TouchableOpacity>

      {Platform.OS === "android" && show && (
        <DateTimePicker
          value={toDate(value)}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={new Date(2100, 0, 1)}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal
          visible={show}
          transparent
          animationType="slide"
          onRequestClose={() => setShow(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalSheet,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={[styles.modalAction, { color: colors.mutedForeground }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  {label}
                </Text>
                <TouchableOpacity onPress={handleConfirmIOS}>
                  <Text style={[styles.modalAction, { color: colors.primary }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                style={{ width: "100%" }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  modalAction: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
