import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../theme/colors";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import BackButton from "../components/BackButton";
import api from "../services/api";
import { saveToken } from "../services/authStorage";

export default function LoginScreen({ navigation, refreshAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) return Alert.alert("Missing info", "Please enter email and password.");

    try {
      setLoading(true);
      const res = await api.post("/api/users/login", { email, password });
      await saveToken(res.data.token);
      await refreshAuth(); // switches to tabs
    } catch (err) {
      Alert.alert("Login failed", err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.purple, COLORS.purpleLight]} style={styles.container}>
      <View style={styles.topRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Log In</Text>

        <TextField value={email} onChangeText={setEmail} placeholder="Email" />
        <TextField value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />

        <PrimaryButton title={loading ? "Logging in..." : "Log In"} onPress={onLogin} disabled={loading} />

        <Pressable onPress={() => navigation.navigate("Signup")} style={{ marginTop: 16 }}>
          <Text style={styles.link}>Don’t have an account? Sign up</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: { paddingTop: 54, paddingHorizontal: 16 },
  content: { paddingHorizontal: 24, paddingTop: 18 },
  title: { color: COLORS.white, fontSize: 28, fontWeight: "900", marginBottom: 16 },
  link: { color: COLORS.lavender, fontWeight: "700" },
});
