import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../services/api";
import { COLORS } from "../theme/colors";

const yyyyMmDd = (d) => d.toISOString().split("T")[0];

const lastNDates = (n) => {
  const arr = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    arr.push(yyyyMmDd(x));
  }
  return arr;
};

const countStreakEndingToday = (completedSet) => {
  let count = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);

  while (true) {
    const key = yyyyMmDd(d);
    if (!completedSet.has(key)) break;
    count += 1;
    d.setDate(d.getDate() - 1);
  }
  return count;
};

export default function ProgressScreen() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map: habitId -> { completedSet, count7, streak }
  const [habitStats, setHabitStats] = useState({});

  const dates7 = useMemo(() => lastNDates(7), []);

  const fetchHabitsAndStats = async () => {
    try {
      setLoading(true);

      // fetch habits
      const habitsRes = await api.get("/api/habits");
      const habitsList = habitsRes.data || [];
      setHabits(habitsList);

      if (habitsList.length === 0) {
        setHabitStats({});
        return;
      }

      // fetch progress for each habit (last 7 days)
      const from = dates7[0];
      const to = dates7[dates7.length - 1];

      const results = await Promise.all(
        habitsList.map(async (h) => {
          const res = await api.get(`/api/progress?habitId=${h._id}&from=${from}&to=${to}`);
          const records = res.data || [];

          const completedSet = new Set(
            records.filter((r) => r.completed).map((r) => r.date)
          );

          const count7 = dates7.filter((d) => completedSet.has(d)).length;
          const streak = countStreakEndingToday(completedSet);

          return [h._id, { completedSet, count7, streak }];
        })
      );

      setHabitStats(Object.fromEntries(results));
    } catch (err) {
      console.log("Progress load failed:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitsAndStats();
  }, []);

  // OVERALL percent = total completions / (habits * 7)
  const overall = useMemo(() => {
    const habitCount = habits.length;
    if (habitCount === 0) return { percent: 0, done: 0, total: 0 };

    const totalPossible = habitCount * 7;
    const done = habits.reduce((sum, h) => sum + (habitStats[h._id]?.count7 || 0), 0);
    const percent = totalPossible ? Math.round((done / totalPossible) * 100) : 0;

    return { percent, done, total: totalPossible };
  }, [habits, habitStats]);

  // Dot row: dot ON if at least one habit completed that day
  const dayDotOn = useMemo(() => {
    const map = {};
    for (const d of dates7) map[d] = false;

    for (const h of habits) {
      const set = habitStats[h._id]?.completedSet;
      if (!set) continue;
      for (const d of dates7) {
        if (set.has(d)) map[d] = true;
      }
    }
    return map;
  }, [dates7, habits, habitStats]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <LinearGradient colors={[COLORS.purple, COLORS.purpleLight]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerTop}>Habit forming made,</Text>
        <Text style={styles.headerBig}>Easy!</Text>

        {habits.length === 0 ? (
          <Text style={styles.subtitle}>Add a habit first to see your progress.</Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Progress Bar</Text>

            {/* Overall progress bar */}
            <View style={styles.barOuter}>
              <View style={[styles.barInner, { width: `${overall.percent}%` }]} />
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>{overall.percent}%</Text>
              </View>
            </View>

            <Text style={styles.smallMeta}>
              Completed {overall.done} of {overall.total} in the last 7 days
            </Text>

            {/* Keep dot row */}
            <View style={styles.dotsRow}>
              {dates7.map((d) => {
                const on = dayDotOn[d];
                return <View key={d} style={[styles.dot, on ? styles.dotOn : styles.dotOff]} />;
              })}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 26 }]}>Habits</Text>
            <ScrollView
              style={styles.habitScroll}
              contentContainerStyle={styles.habitScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {habits.map((h) => {
                const stats = habitStats[h._id] || { count7: 0, streak: 0 };
                return (
                  <View key={h._id} style={styles.habitCard}>
                    <View style={styles.habitLeft}>
                      <Text style={styles.habitTitle} numberOfLines={1}>
                        {h.title}
                      </Text>

                      <Text style={styles.habitMeta}>
                        Last 7 Days:{" "}
                        <Text style={styles.habitMetaBold}>{stats.count7}/7</Text>
                      </Text>
                    </View>

                    <View style={styles.habitRight}>
                      <Text style={styles.streakLabel}>Current Streak</Text>
                      <Text style={styles.streakValue}>{stats.streak}</Text>
                      <Text style={styles.streakUnit}>day(s)</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  content: {
    flex: 1,
    paddingTop: 90,
    paddingHorizontal: 22,
    paddingBottom: 20,
  },

  headerTop: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  headerBig: {
    color: COLORS.white,
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 2,
  },

  subtitle: {
    color: COLORS.lavender,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 18,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 22,
    marginBottom: 10,
  },

  smallMeta: {
    color: COLORS.lavender,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },

  // Progress bar
  barOuter: {
    height: 64,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "center",
  },
  barInner: {
    height: "100%",
    backgroundColor: "rgba(231, 211, 255, 0.95)",
  },
  percentBadge: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  percentText: {
    color: "#111",
    fontWeight: "900",
  },

  // Dots row
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    justifyContent: "center",
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOn: { backgroundColor: COLORS.white },
  dotOff: { backgroundColor: "rgba(255,255,255,0.35)" },

  habitScroll: {
    flex: 1, // takes remaining space so the rest stays fixed
    marginTop: 10,
    borderRadius: 10,
  },
  habitScrollContent: {
    paddingBottom: 12,
  },

  // Habit card
  habitCard: {
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  habitLeft: { flex: 1, paddingRight: 14 },
  habitTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#5A1377",
    marginBottom: 8,
  },
  habitMeta: { color: "#333", fontWeight: "700" },
  habitMetaBold: { fontWeight: "900" },

  habitRight: {
    width: 110,
    alignItems: "flex-end",
  },
  streakLabel: { color: "#7A2A90", fontWeight: "900", fontSize: 12 },
  streakValue: { color: "#111", fontWeight: "900", fontSize: 22, marginTop: 4 },
  streakUnit: { color: "#666", fontWeight: "700", fontSize: 12 },
});
