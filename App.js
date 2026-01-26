import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { ensureNotificationPermission } from "./src/services/notifications";

export default function App() {
    useEffect(() => {
        ensureNotificationPermission();
    }, []);

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
