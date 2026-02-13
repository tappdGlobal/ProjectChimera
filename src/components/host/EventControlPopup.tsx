import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  BarChart3,
  QrCode,
  Users,
} from "lucide-react-native";
import { Theme } from "../../styles/Theme";

interface EventControlPopupProps {
  visible: boolean;
  onClose: () => void;
  activeTab: "analytics" | "scan" | "guests";
  onTabChange: (tab: "analytics" | "scan" | "guests") => void;
  AnalyticsContent: React.ReactNode;
  ScanContent: React.ReactNode;
  GuestsContent: React.ReactNode;
}

export const EventControlPopup: React.FC<EventControlPopupProps> = ({
  visible,
  onClose,
  activeTab,
  onTabChange,
  AnalyticsContent,
  ScanContent,
  GuestsContent,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* ✅ SafeAreaView ONLY HERE */}
        <SafeAreaView style={styles.safeContainer} edges={["top", "bottom"]}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Summer Jazz Festival</Text>

              <TouchableOpacity onPress={onClose}>
                <X size={24} color={Theme.colors.foreground} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Manage your event, scan tickets, and view real-time analytics
            </Text>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TabButton
                label="Analytics"
                icon={<BarChart3 size={18} />}
                active={activeTab === "analytics"}
                onPress={() => onTabChange("analytics")}
              />
              <TabButton
                label="Scan"
                icon={<QrCode size={18} />}
                active={activeTab === "scan"}
                onPress={() => onTabChange("scan")}
              />
              <TabButton
                label="Guests"
                icon={<Users size={18} />}
                active={activeTab === "guests"}
                onPress={() => onTabChange("guests")}
              />
            </View>

            {/* Body */}
            <View style={{ flex: 1, marginTop: 10 }}>
              {activeTab === "analytics" && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {AnalyticsContent}
                </ScrollView>
              )}

              {activeTab === "scan" && ScanContent}
              {activeTab === "guests" && GuestsContent}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const TabButton = ({
  label,
  icon,
  active,
  onPress,
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.tab,
      active && { backgroundColor: Theme.colors.primary },
    ]}
  >
    <View style={styles.tabInner}>
      {React.cloneElement(icon, {
        color: active
          ? Theme.colors.primaryForeground
          : Theme.colors.mutedForeground,
      })}
      <Text
        style={[
          styles.tabText,
          active && { color: Theme.colors.primaryForeground },
        ]}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  safeContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "92%",
    height: "94%",
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.l,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: Theme.colors.foreground,
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: Theme.colors.secondary,
    borderRadius: 50,
    padding: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 40,
    alignItems: "center",
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
    fontWeight: "500",
  },
};
