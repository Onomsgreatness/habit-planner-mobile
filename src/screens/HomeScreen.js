import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";
import { COLORS } from "../theme/colors";
import PrimaryButton from "../components/PrimaryButton";

export default function HomeScreen({ navigation }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    try {
      const res = await api.get("/api/habits");
      setHabits(res.data);
    } catch (err) {
      console.log("Failed to fetch habits", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  //EMPTY STATE
  if (habits.length === 0) {
    return (
      <LinearGradient colors={[COLORS.purple, COLORS.purpleLight]} style={styles.container}>
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

  //HABIT LIST (when data exists)
  return (
    <LinearGradient colors={[COLORS.purple, COLORS.purpleLight]} style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={habits}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.frequency}</Text>
            </View>

            <PrimaryButton
              title="Mark Done"
              onPress={() => console.log("TODO: mark done")}
            />
          </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {flex: 1,alignItems: "center",justifyContent: "center",},

  // Empty state styles
  emptyWrap: {flex: 1,alignItems: "center",justifyContent: "center",paddingHorizontal: 24,},
  image: {width: 260,height: 260,marginBottom: 24,},
  emptyTitle: {color: COLORS.white,fontSize: 24,fontWeight: "900",marginBottom: 8,},
  emptySubtitle: {color: COLORS.lavender,textAlign: "center",marginBottom: 20,},

  // Habit card styles
  card: {backgroundColor: COLORS.white,borderRadius: 16,padding: 16,marginBottom: 12,},
  cardTitle: {fontSize: 16,fontWeight: "800",color: COLORS.black,},
  cardSub: {color: "#666",marginBottom: 10,},
});