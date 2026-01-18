import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";
import { getToken } from "../services/authStorage";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  const refreshAuth = useCallback(async () => {
    const token = await getToken();
    setIsAuthed(!!token);
  }, []);

  useEffect(() => {
    (async () => {
      await refreshAuth();
      setLoading(false);
    })();
  }, [refreshAuth]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthed ? (
        <Stack.Screen name="AppTabs" component={AppTabs} />
      ) : (
        <Stack.Screen name="AuthStack">
          {(props) => <AuthStack {...props} refreshAuth={refreshAuth} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
