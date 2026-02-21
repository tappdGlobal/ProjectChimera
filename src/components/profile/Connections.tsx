import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Theme } from "../../styles/Theme";
import { useConnectionStore } from "../../store/connectionStore";
import { ConnectionDetailModal } from "./ConnectionDetailModal";
import { useFocusEffect } from "@react-navigation/native";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface Props {
  defaultAvatar: string;
}

export const Connections = ({ defaultAvatar }: Props) => {
  const {
    acceptedConnections,
    fetchAcceptedConnections,
    loading,
  } = useConnectionStore();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchAcceptedConnections();
    }, [fetchAcceptedConnections])
  );

  const getIntentStyle = (intent: string) => {
    if (intent === "RELATIONSHIP")
      return { label: "match", bg: "#DB2777" };
    if (intent === "NETWORKING")
      return { label: "business", bg: "#F59E0B" };
    return { label: "friend", bg: "#2563EB" };
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      ) : (
        <View style={styles.grid}>
          {acceptedConnections.map((user: any) => {
            const intent =
              user.intent?.[0] || "FRIENDSHIP";
            const pill = getIntentStyle(intent);

            return (
              <TouchableOpacity
                key={user.id}
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => {
                  setSelectedUser(user);
                  setShowModal(true);
                }}
              >
                <Image
                  source={{
                    uri:
                      user.profilePicUrl ||
                      user.photo ||
                      defaultAvatar,
                  }}
                  style={styles.avatar}
                />

                <Text style={styles.name}>{user.name}</Text>

                {user.age && (
                  <Text style={styles.age}>
                    {user.age} years old
                  </Text>
                )}

                <View
                  style={[
                    styles.intentPill,
                    { backgroundColor: pill.bg },
                  ]}
                >
                  <Text style={styles.intentText}>
                    {pill.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* DETAIL MODAL */}
      <ConnectionDetailModal
        visible={showModal}
        user={selectedUser}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: "#1A1433",
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 16,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  age: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },

  intentPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  intentText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "lowercase",
  },
});
