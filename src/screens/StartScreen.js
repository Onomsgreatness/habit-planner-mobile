import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../theme/colors";

export default function StartScreen({ navigation }) {
  return (
    <LinearGradient
      colors={[COLORS.purple, COLORS.purpleLight]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>HABIT{"\n"}PLANNER</Text>
        <Text style={styles.subtitle}>Build routines, one day at a time.</Text>

        <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.primaryText}>Log In</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.secondaryText}>Sign Up</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  title: { color: COLORS.white, fontSize: 44, fontWeight: "900", lineHeight: 48 },
  subtitle: { color: COLORS.lavender, marginTop: 10, marginBottom: 26, fontSize: 14 },

  primaryBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryText: { color: COLORS.purple, fontWeight: "800", fontSize: 16 },

  secondaryBtn: {
    borderColor: COLORS.white,
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryText: { color: COLORS.white, fontWeight: "800", fontSize: 16 },
});
