import { RootNavigator } from "./src/navigation/RootNavigator";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { databaseService } from "./src/services/databaseService";
import { syncService } from "./src/services/syncService";

// NOTE: The main logic from the Figma output App.tsx will move to AppNavigator.tsx

export default function App() {
  useEffect(() => {
    const init = async () => {
      await databaseService.initDatabase();
      await syncService.syncActions();
    };
    init();
  }, []);

  return (
    <>
      <RootNavigator />
      <StatusBar style="light" />
    </>
  );
}
