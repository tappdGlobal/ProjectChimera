// src/components/common/EventCard.tsx

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
// ... (ensure Image is imported from react-native)
import { Calendar, MapPin, Heart, Users } from "lucide-react-native";
import { Card, CardContent } from "../ui/Card"; // Our migrated card
import { Theme } from "../../styles/Theme";

interface EventCardProps {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  image?: string;
  attendees?: number;
  isWishlisted?: boolean;
  event?: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
    isWishlisted?: boolean;
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
  isWishlisted: propIsWishlisted,
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
  const isWishlisted = propIsWishlisted || event?.isWishlisted || false;

  // Width and Height logic translation:
  const cardStyle: ViewStyle = {};
  const imageStyle: ImageStyle = {};

  if (layout === "grid") {
    // Grid layout focuses on width
    if (size === "small") {
      cardStyle.width = 248; // w-64 equivalent (adjust to RN density, 64*0.25=16)
      imageStyle.height = 128; // h-32
    } else if (size === "large") {
      cardStyle.width = "100%"; // w-full
      imageStyle.height = 192; // h-48
    } else {
      // medium (default)
      cardStyle.width = 288; // w-72
      imageStyle.height = 160; // h-40
    }
    cardStyle.flexShrink = 0; // flex-shrink-0
  } else if (layout === "list") {
    // List layout is always full width and has a fixed image size
    cardStyle.width = "100%"; // w-full
  }

  // --- Inner Info Block Component ---
  const InfoBlock: React.FC<{
    icon: React.ReactNode;
    text: string;
    iconSize: number;
  }> = ({ icon, text, iconSize }) => (
    <View style={styles.infoRow}>
      <View style={{ width: iconSize, height: iconSize }}>{icon}</View>
      <Text style={[styles.infoText, { fontSize: iconSize * 0.75 }]}>
        {text}
      </Text>
    </View>
  );

  // --- List Layout ---
  if (layout === "list") {
    const iconSize = 12; // w-3 h-3
    return (
      <Card style={{ ...styles.baseCardList, ...cardStyle }} onClick={onClick}>
        <View style={styles.listFlex}>
          {/* Image */}
          <Image
            source={{ uri: image }} // Use { uri: src } format
            alt={title}
            style={styles.listImage}
            resizeMode="cover"
            // Error handling is managed by the native Image component itself now
          />
          <View style={styles.listImageContainer}>
            {showWishlist && (
              <TouchableOpacity style={styles.wishlistButtonSmall}>
                <Heart
                  size={iconSize}
                  color={
                    isWishlisted
                      ? Theme.colors.primary
                      : Theme.colors.foreground
                  }
                  fill={isWishlisted ? Theme.colors.primary : "none"}
                />
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

  // --- Grid Layout (Default) ---
  const iconSize = 16; // w-4 h-4
  return (
    <Card style={{ ...styles.baseCardGrid, ...cardStyle }} onClick={onClick}>
      <Image
        source={{ uri: image }} // Use { uri: src } format
        alt={title}
        style={[styles.imageBase, imageStyle]}
        resizeMode="cover"
      />
      <View style={styles.relative}>
        {showWishlist && (
          <TouchableOpacity style={styles.wishlistButtonLarge}>
            <Heart
              size={20} // w-5 h-5 (slightly larger)
              color={
                isWishlisted ? Theme.colors.primary : Theme.colors.foreground
              }
              fill={isWishlisted ? Theme.colors.primary : "none"}
            />
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
      </CardContent>
    </Card>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  // Shared
  infoSpaceY1: {
    gap: 4, // space-y-1 equivalent
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // gap-2
  },
  infoText: {
    color: Theme.colors.mutedForeground, // text-white/70
    // text-xs for list, text-sm for grid/medium
    flexShrink: 1,
  },
  relative: {
    position: "relative",
  },
  imageBase: {
    width: "100%",
    // Height is set via imageStyle prop
    // Do not set overflow here; handled in container if needed
  },

  // Grid Layout
  baseCardGrid: {
    // Use default styles from Card.tsx
  },
  gridTitle: {
    color: Theme.colors.foreground, // text-white
    fontSize: 16,
    fontWeight: "bold", // Assuming h4 is bold
    marginBottom: 8, // mb-2
    // line-clamp-2 achieved by using numberOfLines={2} in the component (not available in this simple Text component)
  },
  wishlistButtonLarge: {
    position: "absolute",
    top: 12, // top-3
    right: 12, // right-3
    padding: 8, // p-2
    backgroundColor: "rgba(0, 0, 0, 0.5)", // bg-black/50
    borderRadius: 9999,
  },

  // List Layout
  baseCardList: {
    // border-0 is implicitly handled if Card doesn't apply a border
  },
  listFlex: {
    flexDirection: "row",
  },
  listImageContainer: {
    position: "relative",
    width: 96, // w-24
    height: 96, // h-24
    flexShrink: 0,
    // overflow: "hidden", // Remove this line to avoid passing to ImageStyle
    borderTopLeftRadius: Theme.radius.lg,
    borderBottomLeftRadius: Theme.radius.lg,
  },
  listImage: {
    width: "100%",
    height: "100%",
  },
  listContent: {
    flex: 1, // flex-1
    padding: 16, // p-4
  },
  listTitle: {
    color: Theme.colors.foreground,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  wishlistButtonSmall: {
    position: "absolute",
    top: 4, // top-1
    right: 4, // right-1
    padding: 4, // p-1
    backgroundColor: "rgba(0, 0, 0, 0.5)", // bg-black/50
    borderRadius: 9999,
  },
});
