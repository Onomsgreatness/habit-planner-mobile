import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import AddHabitScreen from "../screens/AddHabitScreen";
import ProgressScreen from "../screens/ProgressScreen";
import { COLORS } from "../theme/colors";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: 64 },
        tabBarIcon: ({ focused, size }) => {
          const icon =
            route.name === "Home"
              ? focused
                ? "home"
                : "home-outline"
              : route.name === "Add"
              ? focused
                ? "add-circle"
                : "add-circle-outline"
              : focused
              ? "stats-chart"
              : "stats-chart-outline";

          return (
            <Ionicons
              name={icon}
              size={size || 28}
              color={focused ? COLORS.purple : "#777"}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add" component={AddHabitScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
    </Tab.Navigator>
  );
}
