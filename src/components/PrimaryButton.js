import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export default function PrimaryButton({ title, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && { opacity: 0.9 },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  text: {
    color: COLORS.purple,
    fontWeight: "800",
    fontSize: 16,
  },
});
