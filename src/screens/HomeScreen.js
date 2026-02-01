import React, { useEffect, useState, useCallback } from "react";
import {View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";
import { COLORS } from "../theme/colors";
import PrimaryButton from "../components/PrimaryButton";
import { cancelHabitNotifications } from "../services/notifications";


export default function HomeScreen({ navigation }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState({});
  const [username, setUsername] = useState("");

  const today = () => new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const formatDate = () => {
    const d = new Date();
    const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
    const date = d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    return { weekday, date };
  };

  const { weekday, date } = formatDate();

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/users/me");
      setUsername(res.data.name || res.data.email || "");
    } catch (err) {
      setUsername("");
    }
  };

  const fetchHabits = async () => {
    try {
      const res = await api.get("/api/habits");
      setHabits(res.data);
    } catch (err) {
      console.log("Failed to fetch habits", err?.message);
    } finally {
      setLoading(false);
    }
  };

  const markDone = async (habitId) => {
    setCompletedToday((prev) => ({ ...prev, [habitId]: true }));

    try {
      await api.post("/api/progress/complete", {
        habitId,
        date: today(),
      });
    } catch (err) {
      setCompletedToday((prev) => {
        const copy = { ...prev };
        delete copy[habitId];
        return copy;
      });
      console.log("Failed to mark habit done", err?.message);
    }
  };

  const deleteHabit = (habitId) => {
  Alert.alert("Delete habit?", "This will remove the habit permanently.", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          await api.delete(`/api/habits/${habitId}`);
          await cancelHabitNotifications(habitId);

          // Refresh list
          fetchHabits();
        } catch (err) {
          console.log("Failed to delete habit", err?.message);
        }
      },
    },
  ]);
};


  useEffect(() => {
    (async () => {
      await fetchUser();
      await fetchHabits();
    })();
  }, []);

  // Refresh habits whenever you return to Home (after adding/editing)
  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  // EMPTY STATE (no habits)
  if (habits.length === 0) {
    return (
      <LinearGradient
        colors={[COLORS.purple, COLORS.purpleLight]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.username}>{username || "Friend"}</Text>

          <Text style={styles.dateText}>{weekday},</Text>
          <Text style={styles.dateText}>{date}</Text>

          <Pressable
            style={styles.createEditBtn}
            onPress={() => navigation.navigate("Add")}
          >
            <Text style={styles.createEditText}>Create/Edit</Text>
          </Pressable>
        </View>

        <View style={styles.emptyWrap}>
          <Image
            source={require("../../assets/images/empty-habits.png")}
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.emptyTitle}>No habits yet</Text>
          <Text style={styles.emptySubtitle}>
            Start building better routines by adding your first habit.
          </Text>

          <PrimaryButton
            title="Add your first habit"
            onPress={() => navigation.navigate("Add")}
          />
        </View>
      </LinearGradient>
    );
  }

  // HABIT LIST
  return (
    <LinearGradient
      colors={[COLORS.purple, COLORS.purpleLight]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome,</Text>

        <Text style={styles.username} numberOfLines={2}>
          {username || "Friend"}
        </Text>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.dateText}>{weekday},</Text>
            <Text style={styles.dateText}>{date}</Text>
          </View>

          <Pressable
            style={styles.createEditBtn}
            onPress={() => navigation.navigate("Add")}
          >
            <Text style={styles.createEditText}>Create/Edit</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Activities</Text>
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        data={habits}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const done = !!completedToday[item._id];

          return (
            <View style={styles.card}>
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>
                  {item.frequency}
                  {item.reminderTime ? ` • ${item.reminderTime}` : ""}
                </Text>
              </View>

              <PrimaryButton
                title={done ? "Done ✓" : "Mark Done"}
                onPress={() => markDone(item._id)}
                disabled={done}
              />

              <View style={styles.rowActions}>
                <Pressable
                  style={styles.smallBtn}
                  onPress={() => navigation.navigate("Add", { habit: item })}
                >
                  <Text style={styles.smallBtnText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={[styles.smallBtn, styles.deleteBtn]}
                  onPress={() => deleteHabit(item._id)}
                >
                  <Text style={[styles.smallBtnText, styles.deleteText]}>Delete</Text>
                </Pressable>
              </View>

            </View>
          );
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },

  welcome: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "900",
  },

  username: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 2,
  },

  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dateText: {
    color: COLORS.lavender,
    fontSize: 14,
    fontWeight: "700",
  },

  createEditBtn: {
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  createEditText: {
    color: COLORS.black,
    fontWeight: "800",
  },

  sectionTitle: {
    marginTop: 26,
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  image: {
    width: 260,
    height: 260,
    marginBottom: 24,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.lavender,
    textAlign: "center",
    marginBottom: 20,
  },

  // Habit card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.black,
  },
  cardSub: {
    color: "#666",
    marginTop: 4,
  },

  rowActions: {
  flexDirection: "row",
  gap: 10,
  marginTop: 10,
},
smallBtn: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.06)",
  paddingVertical: 10,
  borderRadius: 14,
  alignItems: "center",
},
smallBtnText: {
  fontWeight: "900",
  color: "#333",
},
deleteBtn: {
  backgroundColor: "rgba(255,0,0,0.08)",
},
deleteText: {
  color: "#B00020",
},

});
