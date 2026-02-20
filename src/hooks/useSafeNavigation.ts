import { useNavigation as useRawNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { AppStackParamList, RootTabParamList } from "../navigation/Routes";

export type AppNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList>,
  StackNavigationProp<AppStackParamList>
>;

/**
 * Safe wrapper around useNavigation that handles errors gracefully
 * Use this in places where navigation might not be available yet
 */
export const useSafeNavigation = () => {
  try {
    return useRawNavigation<AppNavigationProp>();
  } catch (error) {
    // Return a no-op navigation object if not in navigation context
    console.debug("Navigation not available in this context - returning mock");
    return {
      navigate: () => {},
      push: () => {},
      goBack: () => {},
      replace: () => {},
      reset: () => {},
      dispatch: () => {},
      setOptions: () => {},
      setParams: () => {},
      addListener: () => (() => {}),
      removeListener: () => {},
      isFocused: () => false,
      canGoBack: () => false,
    } as any;
  }
};
