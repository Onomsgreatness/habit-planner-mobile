import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";
import { COLORS } from "../theme/colors";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import { scheduleHabitNotifications, cancelHabitNotifications } from "../services/notifications";

const FREQS = [
  { key: "daily", label: "Daily" },
  { key: "weekdays", label: "Weekdays" },
  { key: "weekends", label: "Weekends" },
  { key: "custom", label: "Custom" },
];

export default function AddHabitScreen({ navigation, route }) {
    const habit = route?.params?.habit || null;
    const isEdit = useMemo(() => !!habit?._id, [habit]);

  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [reminderTime, setReminderTime] = useState(""); 
  const [loading, setLoading] = useState(false);


  //Reset when habit is null
  useEffect(() => {
    if (habit && habit._id) {
        //Edit form
        setTitle(habit.title || "");
        setFrequency(habit.frequency || "daily");
        setReminderTime(habit.reminderTime || "");
    } else {
      //Reset form
      setTitle("");
      setFrequency("daily");
      setReminderTime("");
    }
  }, [habit]);

  const onAdd = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a habit name.");
      return;
    }

    if (reminderTime && !/^\d{2}:\d{2}$/.test(reminderTime)) {
      Alert.alert("Invalid time", "Use HH:MM format, e.g. 08:00");
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        const res = await api.put(`/api/habits/${habit._id}`, {
            title: title.trim(),
            frequency,
            reminderTime: reminderTime ? reminderTime : null,
            active: true,
        });

        const updatedHabit = res.data;

        //reschedule / cancel based on reminderTime
        if (updatedHabit.reminderTime) {
            await scheduleHabitNotifications(updatedHabit);
        } else {
            await cancelHabitNotifications(updatedHabit._id);
        }
      } else {

        const res = await api.post("/api/habits", {
          title: title.trim(),
          frequency,
          reminderTime: reminderTime ? reminderTime : null,
          active: true,
        });

        const createdHabit = res.data;

        if (createdHabit.reminderTime) {
          await scheduleHabitNotifications(createdHabit); //schedule locally
        }
      }
      // Go back to Home tab
      navigation.navigate("Home");
    } catch (err) {
      Alert.alert("Failed to add habit", err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.purple, COLORS.purpleLight]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add Activity</Text>

        <Text style={styles.label}>Title</Text>
        <TextField value={title} onChangeText={setTitle} placeholder="e.g. Reading" />

        <Text style={styles.label}>Reminder Time (optional)</Text>
        <TextField value={reminderTime} onChangeText={setReminderTime} placeholder="08:00" />

        <Text style={styles.label}>How Often?</Text>
        <View style={styles.freqRow}>
          {FREQS.map((f) => {
            const active = frequency === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFrequency(f.key)}
                style={[
                  styles.freqPill,
                  active && styles.freqPillActive,
                ]}
              >
                <Text style={[styles.freqText, active && styles.freqTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 18 }}>
          <PrimaryButton
            title={loading ? "Adding..." : "Add"}
            onPress={onAdd}
            disabled={loading}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    paddingTop: 70,
    paddingHorizontal: 24,
  },

  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 22,
  },

  label: {
    color: COLORS.lavender,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 10,
  },

  freqRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  freqPill: {
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  freqPillActive: {
    backgroundColor: COLORS.white,
  },
  freqText: {
    color: "#333",
    fontWeight: "800",
  },
  freqTextActive: {
    color: COLORS.purple,
  },
});
