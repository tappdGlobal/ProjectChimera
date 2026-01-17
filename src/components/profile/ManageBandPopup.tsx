import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../styles/Theme";

interface ManageBandPopupProps {
    visible: boolean;
    onClose: () => void;
}

export const ManageBandPopup: React.FC<ManageBandPopupProps> = ({
    visible,
    onClose,
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Close Icon */}
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <Ionicons
                            name="close"
                            size={22}
                            color={Theme.colors.mutedForeground}
                        />
                    </TouchableOpacity>

                    {/* Header */}
                    <Text style={styles.title}>Manage TAPPD Bands</Text>
                    <Text style={styles.subtitle}>
                        View and manage your registered TAPPD bands
                    </Text>

                    {/* Empty State */}
                    <View style={styles.emptyState}>
                        <View style={styles.iconWrapper}>
                            <Ionicons
                                name="watch-outline"
                                size={32}
                                color={Theme.colors.mutedForeground}
                            />
                        </View>

                        <Text style={styles.emptyTitle}>No Bands Registered</Text>
                        <Text style={styles.emptySubtitle}>
                            Register your first TAPPD band to get started
                        </Text>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },

    container: {
        width: "90%",
        backgroundColor: Theme.colors.card,
        borderRadius: Theme.radius.xl,
        padding: Theme.spacing.l,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },


    closeIcon: {
        position: "absolute",
        top: Theme.spacing.m,
        right: Theme.spacing.m,
        zIndex: 10,
    },

    title: {
        color: Theme.colors.foreground,
        fontSize: 18,
        fontWeight: Theme.fontWeights.medium,
        marginBottom: 6,
    },

    subtitle: {
        color: Theme.colors.mutedForeground,
        fontSize: 14,
        marginBottom: Theme.spacing.xl,
    },

    emptyState: {
        alignItems: "center",
        marginVertical: Theme.spacing.xl,
    },

    iconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Theme.colors.muted,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Theme.spacing.m,
    },

    emptyTitle: {
        color: Theme.colors.foreground,
        fontSize: 16,
        fontWeight: Theme.fontWeights.medium,
        marginBottom: 6,
    },

    emptySubtitle: {
        color: Theme.colors.mutedForeground,
        fontSize: 13,
        textAlign: "center",
        maxWidth: 240,
    },

    closeButton: {
        alignSelf: "center",
        marginTop: Theme.spacing.l,
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: Theme.radius.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },

    closeButtonText: {
        color: Theme.colors.foreground,
        fontSize: 15,
        fontWeight: Theme.fontWeights.medium,
    },
});
