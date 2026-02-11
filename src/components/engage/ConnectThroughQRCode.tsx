import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Camera, Share2, Download } from "lucide-react-native";
import { Theme } from "../../styles/Theme";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef } from "react";
import { Share } from "react-native";
import { QRScanner } from "./QRScanner";
import * as FileSystem from "expo-file-system";

interface ConnectThroughQRCodeProps {
    onBack: () => void;
}

const QR_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in ms
const STORAGE_KEY = "QR_GENERATED_TIME";

export function ConnectThroughQRCode({ onBack }: ConnectThroughQRCodeProps) {
    const [qrData, setQrData] = useState<string | null>(null);
    const [showScanner, setShowScanner] = useState(false);

    const [remainingTime, setRemainingTime] = useState<number>(0);
    const qrRef = useRef<any>(null);


    // Generate QR
    const generateQR = async () => {
        const now = Date.now();

        const data = JSON.stringify({
            userId: "test_user",
            timestamp: now,
        });

        await AsyncStorage.setItem(STORAGE_KEY, now.toString());

        setQrData(data);
        setRemainingTime(QR_EXPIRY_TIME);
    };

    // Restore QR if app reopened
    const restoreQR = async () => {
        const storedTime = await AsyncStorage.getItem(STORAGE_KEY);
        if (!storedTime) return;

        const generatedTime = parseInt(storedTime);
        const now = Date.now();

        const diff = now - generatedTime;

        if (diff < QR_EXPIRY_TIME) {
            const remaining = QR_EXPIRY_TIME - diff;

            setQrData(
                JSON.stringify({
                    userId: "test_user",
                    timestamp: generatedTime,
                })
            );

            setRemainingTime(remaining);
        } else {
            await AsyncStorage.removeItem(STORAGE_KEY);
        }
    };

    const shareQR = async () => {
        if (!qrRef.current) return;

        qrRef.current.toDataURL(async (data: string) => {
            try {
                const file = new FileSystem.File(
                    FileSystem.Paths.cache,
                    "share_qr.png"
                );

                await file.write(data, {
                    encoding: "base64",
                });

                await Share.share({
                    url: file.uri,
                    message: "Scan this QR to connect on Tappd",
                });

            } catch (error) {
                console.log("Share error:", error);
            }
        });
    };



    // Countdown timer
    useEffect(() => {
        if (!qrData) return;

        const interval = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1000) {
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [qrData]);



    useEffect(() => {
        if (remainingTime === 0 && qrData) {
            AsyncStorage.removeItem(STORAGE_KEY);
            setQrData(null);
        }
    }, [remainingTime, qrData]);

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
        return <QRScanner onClose={() => setShowScanner(false)} />;
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
                {!qrData ? (
                    <TouchableOpacity style={styles.generateButton} onPress={generateQR}>
                        <Text style={styles.generateButtonText}>Generate QR</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <View style={styles.qrContainer}>
                            <QRCode
                                value={qrData}
                                size={220}
                                backgroundColor="#ffffff"
                                color="#000000"
                                getRef={(c) => (qrRef.current = c)}
                            />
                        </View>

                        <Text style={styles.timerText}>
                            QR expires in: {formatTime(remainingTime)}
                        </Text>

                        <View style={styles.qrActions}>
                            <TouchableOpacity style={styles.iconButton} onPress={shareQR}>
                                <Share2 size={18} color="#D946EF" />
                                <Text style={styles.iconButtonText}>Share QR</Text>
                            </TouchableOpacity>
                        </View>

                    </>
                )}

                {/* Camera Button */}
                <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => setShowScanner(true)}
                >
                    <Camera size={26} color="#fff" />
                </TouchableOpacity>


                <View style={styles.actions}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>Back to Menu</Text>
                    </TouchableOpacity>
                </View>

            </View>
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
