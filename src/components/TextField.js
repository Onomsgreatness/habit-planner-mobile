import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export default function TextField({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
}) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B9A3FF"
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    color: COLORS.black,
  },
});
