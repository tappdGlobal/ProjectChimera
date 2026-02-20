import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Image,
  ImageStyle,
} from "react-native";
import { Calendar, MapPin, Heart, Users } from "lucide-react-native";
import { Card, CardContent } from "../ui/Card";
import { Theme } from "../../styles/Theme";
import { ActivityIndicator } from "react-native";
import { useWishlistStore } from "../../store/wishlistStore";
import {
  removeFromWishlistApi,
} from "../../api/wishlistApi";
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

export function EventCard({
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
  const [loading, setLoading] = React.useState(false);
  const cardStyle: ViewStyle = {};
  const imageStyle: ImageStyle = {};

const toggleWishlist = useWishlistStore(
  (state) => state.toggleWishlist
);

const handleWishlistPress = async () => {
  if (!event?.id || loading) return;

  try {
    setLoading(true);
    await toggleWishlist(event.id); // API call inside store
  } catch (err) {
    console.log("Wishlist error:", err);
  } finally {
    setLoading(false);
  }
};


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

  // ---------------- LIST LAYOUT ----------------
  if (layout === "list") {
    const iconSize = 12;
    return (
      <Card style={{ ...styles.baseCardList, ...cardStyle }} onClick={onClick}>
        <View style={styles.listFlex}>
          {image ? (
            <Image source={{ uri: image }} style={styles.listImage} />
          ) : (
            <View style={[styles.listImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}

          <View style={styles.listImageContainer}>
            {showWishlist && (
              <TouchableOpacity
                style={styles.wishlistButtonSmall}
                onPress={handleWishlistPress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Theme.colors.primary} />
                ) : (
                  <Heart
                    size={iconSize}
                    color={Theme.colors.primary}
                    fill="none"
                  />
                )}
              </TouchableOpacity>
            )}
          </View>

          <CardContent style={styles.listContent}>
            <Text style={styles.listTitle}>{title}</Text>
            <View style={styles.infoSpaceY1}>
              <InfoBlock
                icon={<Calendar color={Theme.colors.primary} />}
                text={`${date} • ${time}`}
                iconSize={iconSize}
              />
              <InfoBlock
                icon={<MapPin color={Theme.colors.primary} />}
                text={location}
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
          </CardContent>
        </View>
      </Card>
    );
  }

  // ---------------- GRID LAYOUT ----------------
  const iconSize = 16;

  return (
    <Card style={{ ...styles.baseCardGrid, ...cardStyle }} onClick={onClick}>
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
            onPress={handleWishlistPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Heart
                size={20}
                color={Theme.colors.primary}
                fill="none"
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      <CardContent>
        <Text style={styles.gridTitle}>{title}</Text>

        <View style={styles.infoSpaceY1}>
          <InfoBlock
            icon={<Calendar color={Theme.colors.primary} />}
            text={`${date} • ${time}`}
            iconSize={iconSize}
          />
          <InfoBlock
            icon={<MapPin color={Theme.colors.primary} />}
            text={location}
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

        <View style={styles.addWishlistWrapper}>
          <TouchableOpacity
            style={styles.addWishlistButton}
            onPress={handleWishlistPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Heart
                size={20}
                color={Theme.colors.primary}
                fill="none"
              />
            )}

            <Text style={styles.addWishlistText}>
              Add to Wishlist
            </Text>
          </TouchableOpacity>
        </View>
      </CardContent>
    </Card>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  infoSpaceY1: {
    marginTop: 6,
  },

  // 🔥 THIS is what creates the spacing between Calendar & Location
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,   // ← increased from 6
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
  },

  imageBase: { width: "100%" },

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

  baseCardList: {},
  listFlex: { flexDirection: "row" },
  listImageContainer: {
    position: "relative",
    width: 96,
    height: 96,
    flexShrink: 0,
    borderTopLeftRadius: Theme.radius.lg,
    borderBottomLeftRadius: Theme.radius.lg,
  },
  listImage: { width: "100%", height: "100%" },
  listContent: { flex: 1, padding: 16 },
  listTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  wishlistButtonSmall: {
    position: "absolute",
    top: 4,
    right: 4,
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 9999,
  },

  placeholderImage: {
    backgroundColor: Theme.colors.muted,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: Theme.colors.mutedForeground,
    fontSize: 12,
  },

  addWishlistWrapper: {
    marginTop: 12,
    alignItems: "center",
  },
  addWishlistButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: "100%",
  },
  addWishlistText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
