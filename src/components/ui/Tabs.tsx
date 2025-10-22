// src/components/ui/Tabs.tsx

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { Theme, GRADIENT_COLORS } from "../../styles/Theme";
import { LinearGradient } from "expo-linear-gradient";

const initialLayout = { width: Dimensions.get("window").width };

// --- 1. Tabs Component (Root) ---
interface TabsProps {
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
}

// Context to collect route data from children
const TabParserContext = React.createContext<{
  routes: { key: string; title: string; element: React.ReactNode }[];
} | null>(null);

export function Tabs({ children, value, onValueChange, style }: TabsProps) {
  // Memoize routes and scenes to prevent constant re-rendering
  const { routes, sceneMap } = useMemo(() => {
    const r: { key: string; title: string; element: React.ReactNode }[] = [];
    const sm: Record<string, React.FC> = {};

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.type === TabsList) {
          // Extract Triggers from TabsList
          if (
            React.isValidElement(child) &&
            (child.props as TabsListProps).children
          ) {
            React.Children.forEach(
              (child.props as TabsListProps).children,
              (trigger) => {
                if (
                  React.isValidElement(trigger) &&
                  trigger.type === TabsTrigger
                ) {
                  r.push({
                    key: (trigger as React.ReactElement<TabsTriggerProps>).props
                      .value,
                    title: (trigger as React.ReactElement<TabsTriggerProps>)
                      .props.children,
                    element: null,
                  });
                }
              }
            );
          }
        } else if (child.type === TabsContent) {
          // Extract Content from TabsContent
          const key = (child.props as TabsContentProps).value;
          const content = (child.props as TabsContentProps).children;
          sm[key] = () => <View style={styles.contentWrapper}>{content}</View>;
        }
      }
    });
    return { routes: r, sceneMap: sm };
  }, [children]);

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      style={styles.tabBar}
      // Note: indicatorStyle is overridden by custom renderTabBarItem for gradient look
      indicatorStyle={styles.indicator}
      renderLabel={() => null} // Disable default label rendering
      renderTabBarItem={(tabBarProps) => {
        const route = tabBarProps.route as { key: string; title: string };
        const isSelected = route.key === value;

        // This is a complex approximation of the shadcn/tailwind styling logic:
        // data-[state=active]:gradient-primary data-[state=active]:text-white
        // We handle the background and text color separately.

        const triggerContent = (
          <View style={styles.triggerContent}>
            {isSelected && (
              // Apply the active background visual (gradient)
              <LinearGradient
                colors={
                  GRADIENT_COLORS.primary as [string, string, ...string[]]
                }
                style={styles.activeGradientBackground}
                start={[0, 0]}
                end={[1, 1]}
              />
            )}
            <Text
              style={[
                styles.labelBase,
                isSelected ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {route.title}
            </Text>
          </View>
        );

        // TabsList can be a simple flex row, or a grid structure (grid-cols-3)
        // Here, we let the TabBar handle the flex distribution.
        return (
          <TouchableOpacity
            {...tabBarProps}
            onPress={() => onValueChange(route.key)}
            style={styles.triggerBase}
            activeOpacity={0.8}
          >
            {triggerContent}
          </TouchableOpacity>
        );
      }}
    />
  );

  const initialIndex = routes.findIndex((route) => route.key === value) || 0;

  return (
    <TabView
      navigationState={{ index: initialIndex, routes }}
      renderScene={SceneMap(sceneMap)}
      onIndexChange={(index) => onValueChange(routes[index].key)}
      initialLayout={initialLayout}
      renderTabBar={renderTabBar}
      style={style}
    />
  );
}

// --- 2. TabsList (Wrapper for Triggers - defines the overall tab bar style) ---
interface TabsListProps {
  children: React.ReactNode;
  className?: string; // Ignore
  style?: ViewStyle;
}
export function TabsList({ children, style }: TabsListProps) {
  // This wrapper defines the visual container for the tabs (e.g., bg-white/5 border border-white/10)
  return <View style={[styles.listBase, style]}>{children}</View>;
}

// --- 3. TabsTrigger (Individual Button Text) ---
interface TabsTriggerProps {
  children: string; // The text content of the tab
  value: string;
  className?: string; // Ignore
}
export function TabsTrigger({ children, value }: TabsTriggerProps) {
  // This component's rendering is handled inside the main Tabs component's renderTabBar
  return <Text>{children}</Text>;
}

// --- 4. TabsContent (The displayed content) ---
interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string; // Ignore
}
export function TabsContent({ children, value }: TabsContentProps) {
  // The actual content rendering is done via SceneMap
  return <View>{children}</View>;
}

// --- STYLESHEET (Approximation of ShadCN/Tailwind Styles) ---
const styles = StyleSheet.create({
  // TabsList: bg-white/5 border border-white/10
  listBase: {
    backgroundColor: Theme.colors.muted, // bg-white/5
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    // The TabBar renders inside this View, so styles will need careful blending
  },
  tabBar: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
  },
  indicator: {
    height: 0, // Hide the default indicator
  },
  // TabsTrigger Base Style
  triggerBase: {
    flex: 1, // Distribute width evenly
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12, // py-3
    // We remove horizontal padding to let the inner content handle it
  },
  triggerContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.radius.sm,
    // In Host.tsx: bg-primary/20 text-primary border-primary/30
  },
  labelBase: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    zIndex: 10, // Ensure text is above the gradient background
    paddingHorizontal: 10,
    paddingVertical: 4, // Padding around the text
  },
  labelActive: {
    color: Theme.colors.foreground, // text-white (When gradient is active)
  },
  labelInactive: {
    color: Theme.colors.mutedForeground, // text-white/70
  },
  contentWrapper: {
    paddingHorizontal: 0, // Content wrapper needs no padding as screen components have it
    paddingTop: 16,
  },
  // Gradient background for active trigger
  activeGradientBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Theme.radius.sm,
  },
});
