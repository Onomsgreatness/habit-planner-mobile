import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../theme/colors";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import BackButton from "../components/BackButton";
import api from "../services/api";
import { saveToken } from "../services/authStorage";

export default function SignupScreen({ navigation, refreshAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!email || !password) return Alert.alert("Missing info", "Please enter email and password.");

    try {
      setLoading(true);
      const res = await api.post("/api/users/register", { email, password });
      await saveToken(res.data.token);
      await refreshAuth();
    } catch (err) {
      Alert.alert("Signup failed", err?.response?.data?.message || "Something went wrong");
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
        <Text style={styles.title}>Sign Up</Text>

        <TextField value={email} onChangeText={setEmail} placeholder="Email" />
        <TextField value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />

        <PrimaryButton title={loading ? "Creating..." : "Create Account"} onPress={onSignup} disabled={loading} />

        <View style={styles.inlineRow}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
                <Text style={styles.link}>Log in</Text>
            </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: { paddingTop: 54, paddingHorizontal: 16 },
  content: { paddingHorizontal: 24, paddingTop: 18 },
  title: { color: COLORS.white, fontSize: 28, fontWeight: "900", marginBottom: 16 },
  inlineRow: {flexDirection: "row", alignItems: "center", marginTop: 16, },
  linkText: { color: COLORS.lavender, fontWeight: "700" },
  link: { color: COLORS.white, fontWeight: "800" },
});
