import React from "react";
import {
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoFocus?: boolean;
}

export const FormField = React.forwardRef<TextInput, FormFieldProps>(
  function FormField(
    {
      label,
      value,
      onChangeText,
      placeholder,
      keyboardType,
      returnKeyType,
      onSubmitEditing,
      multiline,
      numberOfLines,
      autoCapitalize = "sentences",
      autoFocus,
    },
    ref,
  ) {
    const colors = useColors();

    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              backgroundColor: colors.muted,
              color: colors.foreground,
              borderColor: colors.border,
            },
            multiline ? styles.multiline : null,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType ?? (multiline ? "default" : "next")}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={multiline ?? false}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  multiline: {
    height: 80,
    textAlignVertical: "top",
  },
});
