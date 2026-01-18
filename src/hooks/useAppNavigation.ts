import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { AppStackParamList, RootTabParamList } from "../navigation/Routes";

// Combine Stack and Tab navigation props
export type AppNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList>,
  StackNavigationProp<AppStackParamList>
>;

// Export a typed hook
export const useAppNavigation = () => useNavigation<AppNavigationProp>();
