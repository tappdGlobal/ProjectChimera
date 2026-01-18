import React, { useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Theme ,GRADIENT_COLORS} from "../../styles/Theme";

const { width } = Dimensions.get("window");

type MatchProfileProps = {
    images: any[];
    name: string;
    age: number;
    title: string;
    tag: string;
    about: string;
    height: string;
    fitness: string;
    diet: string;
    smoking: string;
    drinking: string;
    onLike?: () => void;
    onReject?: () => void;
};

const MatchProfile: React.FC<MatchProfileProps> = ({
    images,
    name,
    age,
    title,
    tag,
    about,
    height,
    fitness,
    diet,
    smoking,
    drinking,
    onLike,
    onReject,
}) => {

    const imageScrollRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    return (
        <LinearGradient
            colors={["#0b0016", "#14002a", "#1a0033"]}
            style={styles.container}
        >  {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onReject} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <View style={styles.center}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                <View style={styles.bottomLine} />



                {/* Spacer */}
                <View style={{ width: 22 }} />
            </View>


            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                {/* Image Carousel */}
                <View style={styles.imageWrapper}>
                    <ScrollView
                        ref={imageScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const index = Math.round(
                                e.nativeEvent.contentOffset.x / width
                            );
                            setActiveIndex(index);
                        }}
                        scrollEventThrottle={16}
                    >
                        {images.map((img, index) => (
                            <Image key={index} source={img} style={styles.image} />
                        ))}
                    </ScrollView>

                    {/* Left Arrow */}
                    {activeIndex > 0 && (
                        <TouchableOpacity
                            style={[styles.arrow, styles.leftArrow]}
                            onPress={() =>
                                imageScrollRef.current?.scrollTo({
                                    x: (activeIndex - 1) * width,
                                    animated: true,
                                })
                            }
                        >
                            <Ionicons
                                name="chevron-back"
                                size={22}
                                color={Theme.colors.foreground}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Right Arrow */}
                    {activeIndex < images.length - 1 && (
                        <TouchableOpacity
                            style={[styles.arrow, styles.rightArrow]}
                            onPress={() =>
                                imageScrollRef.current?.scrollTo({
                                    x: (activeIndex + 1) * width,
                                    animated: true,
                                })
                            }
                        >
                            <Ionicons
                                name="chevron-forward"
                                size={22}
                                color={Theme.colors.foreground}
                            />
                        </TouchableOpacity>
                    )}

                    {/* Pagination Dots */}
                    <View style={styles.dotsContainer}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === activeIndex && styles.activeDot,
                                ]}
                            />
                        ))}
                    </View>
                </View>


                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.name}>
                        {name}, {age}
                    </Text>
                    <Text style={styles.subtitle}>{title}</Text>

                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>

                    {/* About */}
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.sectionText}>{about}</Text>

                    {/* Vitals */}
                    <Text style={styles.sectionTitle}>Vitals</Text>
                    <View style={styles.row}>
                        <Info label="Height" value={height} />
                        <Info label="Fitness" value={fitness} />
                    </View>

                    <View style={styles.row}>
                        <Info label="Diet" value={diet} />
                    </View>

                    {/* Vices */}
                    <Text style={styles.sectionTitle}>Vices</Text>
                    <View style={styles.row}>
                        <Info label="Smoking" value={smoking} />
                        <Info label="Drinking" value={drinking} />
                    </View>
                </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.reject} onPress={onReject}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onLike} activeOpacity={0.85}>
  <LinearGradient
    colors={GRADIENT_COLORS.primary as [string, string]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.likeGradient}
  >
    <Ionicons
      name="heart"
      size={26}
      color={Theme.colors.primaryForeground}
    />
  </LinearGradient>
</TouchableOpacity>

            </View>
        </LinearGradient>
    );
};

export default MatchProfile;

/* ---------- Small reusable sub-component ---------- */
const Info = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.col}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

/* ---------------- Styles ---------------- */
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },

    /* ---------------- HEADER ---------------- */
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,

        height: 56,
        paddingHorizontal: Theme.spacing.m,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        backgroundColor: Theme.colors.background,
        zIndex: 10,
    },

    backBtn: {
        padding: Theme.spacing.s,
    },

    center: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
    },

    headerTitle: {
        color: Theme.colors.foreground,
        fontSize: 18,
        fontWeight: Theme.fontWeights.medium,
        marginBottom: Theme.spacing.s,
    },

    bottomLine: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 1,
        backgroundColor: Theme.colors.border,
    },

    /* ---------------- IMAGE ---------------- */
    image: {
        width,
        height: 420,
        resizeMode: "cover",
    },


    imageWrapper: {
        position: "relative",
        marginTop: 56 + Theme.spacing.s,
        height: 420,
        borderRadius: Theme.radius.xl,
        overflow: "hidden",
    },



    arrow: {
        position: "absolute",
        top: "45%",
        width: 36,
        height: 36,
        borderRadius: 18,

        backgroundColor: Theme.colors.muted,
        alignItems: "center",
        justifyContent: "center",

        zIndex: 10,
        elevation: 10,
    },



    leftArrow: {
        left: Theme.spacing.m,
    },

    rightArrow: {
        right: Theme.spacing.m,
    },

    dotsContainer: {
        position: "absolute",
        bottom: Theme.spacing.s,
        left: 0,
        right: 0,

        flexDirection: "row",
        justifyContent: "center",
        gap: 6,

        zIndex: 10,                   // iOS
        elevation: 10,                // 🔥 Android
    },

    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Theme.colors.mutedForeground,
    },


    activeDot: {
        width: 16,
        backgroundColor: Theme.colors.primary,
    },


    /* ---------------- CONTENT ---------------- */
    content: {
        padding: Theme.spacing.m,
    },

    name: {
        color: Theme.colors.foreground,
        fontSize: 22,
        fontWeight: Theme.fontWeights.medium,
    },

    subtitle: {
        color: Theme.colors.mutedForeground,
        marginTop: Theme.spacing.s,
        marginBottom: Theme.spacing.m,
    },

    tag: {
        alignSelf: "flex-start",
        backgroundColor: Theme.colors.secondary,
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: Theme.spacing.s / 1.5,
        borderRadius: Theme.radius.lg,
        marginBottom: Theme.spacing.l,
    },

    tagText: {
        color: Theme.colors.primary,
        fontSize: 13,
        fontWeight: Theme.fontWeights.medium,
    },

    sectionTitle: {
        color: Theme.colors.foreground,
        fontSize: 18,
        fontWeight: Theme.fontWeights.medium,
        marginTop: Theme.spacing.l,
        marginBottom: Theme.spacing.s,
    },

    sectionText: {
        color: Theme.colors.mutedForeground,
        lineHeight: 22,
    },

    row: {
        flexDirection: "row",
        marginTop: Theme.spacing.s,
    },

    col: {
        flex: 1,
    },

    label: {
        color: Theme.colors.mutedForeground,
        fontSize: 13,
    },

    value: {
        color: Theme.colors.foreground,
        fontSize: 15,
        marginTop: 2,
    },

    /* ---------------- ACTIONS ---------------- */
    actions: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        paddingVertical: Theme.spacing.m,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
        backgroundColor: Theme.colors.background,
    },

    reject: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Theme.colors.muted,
        alignItems: "center",
        justifyContent: "center",
    },

    like: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Theme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    likeGradient: {
  width: 64,
  height: 64,
  borderRadius: 32,
  alignItems: "center",
  justifyContent: "center",

  // Optional subtle elevation
  shadowColor: Theme.colors.primary,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 10,
  elevation: 8, // Android
},

});
