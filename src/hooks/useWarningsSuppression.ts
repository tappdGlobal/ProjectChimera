import { useEffect } from "react";
import { LogBox } from "react-native";

/**
 * Suppresses known non-critical warnings during development
 * Only use this for warnings that don't affect app functionality
 */
export const useWarningsSuppression = () => {
  useEffect(() => {
    // Suppress the navigation hook errors that occur during app initialization
    // These are non-blocking and occur before NavigationContainer is fully ready
    LogBox.ignoreLogs([
      "Couldn't get the navigation state",
      "Couldn't find a navigation object",
    ]);
  }, []);
};
