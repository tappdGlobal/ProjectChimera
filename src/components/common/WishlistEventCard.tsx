import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Image,
  ImageStyle,
  ActivityIndicator,
} from "react-native";
import { Calendar, MapPin, Heart, Users } from "lucide-react-native";
import { Card, CardContent } from "../ui/Card";
import { Theme } from "../../styles/Theme";
import { useWishlistStore } from "../../store/wishlistStore";

interface EventCardProps {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  image?: string;
  attendees?: number;
  event?: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
  };
  size?: "small" | "medium" | "large";
  layout?: "grid" | "list";
  showWishlist?: boolean;
  onClick?: () => void;
}

export function WishlistEventCard({
  event,
  title: propTitle,
  date: propDate,
  time: propTime,
  location: propLocation,
  image: propImage,
  attendees,
  size = "medium",
  layout = "grid",
  showWishlist = false,
  onClick,
}: EventCardProps) {
  const title = propTitle || event?.title || "";
  const date = propDate || event?.date || "";
  const time = propTime || event?.time || "";
  const location = propLocation || event?.location || "";
  const image = propImage || event?.image || "";

  /* 🔥 NEW STORE STRUCTURE */
const wishlistLoadingMap = useWishlistStore(
  (state) => state.wishlistLoadingMap ?? {}
);

const removeFromWishlist = useWishlistStore(
  (state) => state.removeFromWishlist
);

const actionLoading =
  event?.id && wishlistLoadingMap
    ? wishlistLoadingMap[event.id] ?? false
    : false;

  const handleRemoveWishlist = async () => {
    if (!event?.id || actionLoading) return;
    await removeFromWishlist(event.id);
  };

  const formatDateTime = () => {
    try {
      if (!date) return "Date TBA";

      const dateObj = new Date(date);

      if (isNaN(dateObj.getTime())) return `${date} • ${time}`;

      const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const formattedTime = dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return `${formattedDate} • ${formattedTime}`;
    } catch {
      return `${date} • ${time}`;
    }
  };

  const cardStyle: ViewStyle = {};
  const imageStyle: ImageStyle = {};

  if (layout === "grid") {
    if (size === "small") {
      cardStyle.width = 248;
      imageStyle.height = 128;
    } else if (size === "large") {
      cardStyle.width = "100%";
      imageStyle.height = 192;
    } else {
      cardStyle.width = 288;
      imageStyle.height = 160;
    }
    cardStyle.flexShrink = 0;
  } else if (layout === "list") {
    cardStyle.width = "100%";
  }

  const InfoBlock: React.FC<{
    icon: React.ReactNode;
    text: string;
    iconSize: number;
  }> = ({ icon, text, iconSize }) => (
    <View style={styles.infoRow}>
      <View style={[styles.iconWrapper, { width: iconSize, height: iconSize }]}>
        {icon}
      </View>
      <Text style={[styles.infoText, { fontSize: iconSize * 0.75 }]}>
        {text}
      </Text>
    </View>
  );

  const iconSize = layout === "list" ? 12 : 16;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onClick}>
      <Card style={{ ...styles.baseCardGrid, ...cardStyle }}>
        <View style={styles.imageWrapper}>
          {image ? (
            <Image source={{ uri: image }} style={[styles.imageBase, imageStyle]} />
          ) : (
            <View style={[styles.imageBase, imageStyle, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}

          {showWishlist && (
            <TouchableOpacity
              style={styles.wishlistButtonLarge}
              onPress={handleRemoveWishlist}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Heart size={20} color={Theme.colors.primary} fill="none" />
              )}
            </TouchableOpacity>
          )}
        </View>

        <CardContent>
          <Text style={styles.gridTitle}>{title}</Text>

          <View style={styles.infoSpaceY1}>
            <InfoBlock
              icon={<Calendar color={Theme.colors.primary} />}
              text={formatDateTime()}
              iconSize={iconSize}
            />
            <InfoBlock
              icon={<MapPin color={Theme.colors.primary} />}
              text={location || "Location unavailable"}
              iconSize={iconSize}
            />
            {attendees !== undefined && attendees > 0 && (
              <InfoBlock
                icon={<Users color={Theme.colors.primary} />}
                text={`${attendees} attending`}
                iconSize={iconSize}
              />
            )}
          </View>

          {showWishlist && (
            <View style={styles.removeWishlistWrapper}>
              <TouchableOpacity
                style={styles.removeWishlistButton}
                onPress={handleRemoveWishlist}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Heart size={18} color="#fff" fill="#fff" />
                )}
                <Text style={styles.removeWishlistText}>
                  Remove from Wishlist
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  infoSpaceY1: {
    marginTop: 6,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  iconWrapper: {
    marginRight: 8,
  },

  infoText: {
    color: Theme.colors.mutedForeground,
    flexShrink: 1,
  },

  imageWrapper: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderTopLeftRadius: Theme.radius.lg,
    borderTopRightRadius: Theme.radius.lg,
  },

  imageBase: {
    width: "100%",
  },

  gridTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  wishlistButtonLarge: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 9999,
  },

  removeWishlistWrapper: {
    marginTop: 12,
    alignItems: "center",
  },

  removeWishlistButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#d01d20",
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: "100%",
  },

  removeWishlistText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  baseCardGrid: {},

  placeholderImage: {
    backgroundColor: Theme.colors.muted,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },
});