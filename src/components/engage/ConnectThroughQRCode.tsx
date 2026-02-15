import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Camera, Share2 } from "lucide-react-native";
import { Theme } from "../../styles/Theme";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QRScanner } from "./QRScanner";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import { useQRStore } from "../../store/qrStore";
import { ConnectPurposeModal } from "./ConnectPurposeModal";
import { ConnectionIntent } from "../../types/qrTypes";


interface ConnectThroughQRCodeProps {
    onBack: () => void;
}
type ConnectionType = "friend" | "date" | "networking";
const STORAGE_KEY = "QR_DATA";

const intentMap: Record<ConnectionType, ConnectionIntent> = {
    friend: "FRIENDSHIP",
    date: "DATE",
    networking: "NETWORKING",
};

export function ConnectThroughQRCode({ onBack }: ConnectThroughQRCodeProps) {
    const { generateQRAction } = useQRStore();

    const [token, setToken] = useState<string | null>(null);
    const [showConnectModal, setShowConnectModal] = useState(false);

    const [showScanner, setShowScanner] = useState(false);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedIntent, setSelectedIntent] = useState<ConnectionIntent[]>([]);


    const qrRef = useRef<any>(null);



    // ===============================
    // Generate QR (Backend)
    // ===============================
    const generateQR = async () => {
        try {
            if (remainingTime > 0 || isGenerating) return;

            setIsGenerating(true);

            const data = await generateQRAction();

            if (!data?.token || !data?.expiresAt) {
                throw new Error("Invalid backend response");
            }

            await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    token: data.token,
                    expiresAt: data.expiresAt,
                })
            );

            // 🔥 IMPORTANT — this controls UI
            setToken(data.token);


            const expiryTime = new Date(data.expiresAt).getTime();
            const now = Date.now();
            const remaining = expiryTime - now;

            setRemainingTime(remaining > 0 ? remaining : 0);

            Toast.show({
                type: "success",
                text1: "QR Generated Successfully",
            });

        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Failed to generate QR",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // ===============================
    // Restore QR
    // ===============================
    const restoreQR = async () => {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (!stored) {
            setToken(null);
            setRemainingTime(0);
            return;
        }

        const { token, expiresAt } = JSON.parse(stored);

        const expiryTime = new Date(expiresAt).getTime();
        const now = Date.now();
        const remaining = expiryTime - now;

        if (remaining > 0) {
            setToken(token);
            setRemainingTime(remaining);
        } else {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setToken(null);
            setRemainingTime(0);
        }
    };



    // ===============================
    // Countdown Timer (Same as dummy)
    // ===============================
    useEffect(() => {
        if (!token) return;

        const interval = setInterval(() => {
            setRemainingTime(prev => {
                const updated = prev - 1000;

                if (updated <= 0) {
                    AsyncStorage.removeItem(STORAGE_KEY);
                    setToken(null);
                    return 0;
                }

                return updated;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [token]);


    useEffect(() => {
        restoreQR();
    }, []);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    if (showScanner) {
        return (
            <QRScanner
                onClose={() => setShowScanner(false)}
                intent={selectedIntent}
            />
        );
    }


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Show QR to Connect</Text>
                <Text style={styles.headerSubtitle}>
                    Let others scan your QR code to connect instantly
                </Text>
            </View>

            <View style={[styles.content, { alignItems: "center" }]}>
                {!token ? (
                    <TouchableOpacity
                        style={[
                            styles.generateButton,
                            (remainingTime > 0 || isGenerating) && { opacity: 0.6 },
                        ]}
                        onPress={generateQR}
                        disabled={remainingTime > 0 || isGenerating}
                    >
                        {isGenerating ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.generateButtonText}>
                                {remainingTime > 0 ? "QR Active" : "Generate QR"}
                            </Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <>
                        <View style={styles.qrContainer}>
                            <QRCode
                                value={token || ""}
                                size={300}
                                backgroundColor="#ffffff"
                                color="#000000"
                                ecl="H"
                                quietZone={20}
                                getRef={(c) => (qrRef.current = c)}
                            />
                        </View>

                        <Text style={styles.timerText}>
                            QR expires in: {formatTime(remainingTime)}
                        </Text>

                        <View style={styles.qrActions}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={async () => {
                                    if (!qrRef.current) return;
                                    qrRef.current.toDataURL(async (data: string) => {
                                        const fileUri =
                                            FileSystem.cacheDirectory + "share_qr.png";
                                        await FileSystem.writeAsStringAsync(fileUri, data, {
                                            encoding: FileSystem.EncodingType.Base64,
                                        });
                                        await Sharing.shareAsync(fileUri);
                                    });
                                }}
                            >
                                <Share2 size={18} color="#D946EF" />
                                <Text style={styles.iconButtonText}>Share QR</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => setShowConnectModal(true)}

                >
                    <Camera size={26} color="#fff" />
                </TouchableOpacity>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                    >
                        <Text style={styles.backButtonText}>Back to Menu</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ConnectPurposeModal
  visible={showConnectModal}
  onClose={() => setShowConnectModal(false)}

  onScanNow={(selected) => {
    console.log("Selected from modal:", selected);

    const mapped = selected
      .map((item) => intentMap[item as ConnectionType])
      .filter(Boolean);

    console.log("Mapped intents:", mapped);

    if (!mapped.length) {
      Toast.show({
        type: "error",
        text1: "Please select at least one connection purpose",
      });
      return;
    }

    setSelectedIntent(mapped);
    setShowConnectModal(false);

    setTimeout(() => {
      setShowScanner(true);
    }, 200);
  }}
/>




        </View>
    );
}





const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F0A1F",
        paddingTop: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
    },
    content: {
        padding: 16,
    },
    qrContainer: {
        width: 280,
        height: 280,
        backgroundColor: "#fff",
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    qrImage: {
        width: "100%",
        height: "100%",
    },
    actions: {
        marginTop: 40,
        alignItems: "center",
        gap: 16,
    },
    scanButton: {
        alignItems: "center",
        gap: 8,
    },
    scanIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    scanButtonText: {
        color: Theme.colors.mutedForeground,
        fontSize: 14,
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        marginTop: 16,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "500",
    },
    generateButton: {
        paddingVertical: 14,
        paddingHorizontal: 40,
        backgroundColor: "#D946EF",
        borderRadius: 12,
    },
    generateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    timerText: {
        marginTop: 20,
        color: "#9CA3AF",
        fontSize: 14,
    },
    qrActions: {
        flexDirection: "row",
        gap: 20,
        marginTop: 20,
    },
    iconButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: "rgba(217,70,239,0.15)",
    },

    iconButtonText: {
        color: "#D946EF",
        fontWeight: "600",
    },
    cameraButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
    },

});
