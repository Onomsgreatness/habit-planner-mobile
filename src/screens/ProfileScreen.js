// src/screens/ProfileScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";
import { COLORS } from "../theme/colors";
import { clearToken } from "../services/authStorage";

export default function ProfileScreen({ navigation }) {
  const [username, setUsername] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/users/me");
        setUsername(res.data?.name || res.data?.email || "");
      } catch (e) {
        setUsername("");
      }
    })();
  }, []);

  const onLogout = () => {
    Alert.alert("Log out?", "You’ll need to sign in again to access your habits.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await clearToken();

          // Reset navigation so user can’t go “Back” into the app
          navigation.reset({
            index: 0,
            routes: [{ name: "AuthStack" }], // <-- must match your Auth screen name
          });
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={[COLORS.purple, COLORS.purpleLight]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value} numberOfLines={2}>
          {username || "—"}
        </Text>

        <Pressable style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 80, paddingHorizontal: 22 },

  title: { color: COLORS.white, fontSize: 30, fontWeight: "900", marginBottom: 18 },

  label: { color: COLORS.lavender, fontWeight: "800", marginBottom: 8 },
  value: { color: COLORS.white, fontSize: 20, fontWeight: "900", marginBottom: 30 },

  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  logoutText: { color: "#B00020", fontWeight: "900", fontSize: 16 },
});

//CHANGE THE ICON AND THE LAYOUT FOR THE LOGOUT AND BEFORE THAT CREATE A PROTOTYPE ON FIGMA