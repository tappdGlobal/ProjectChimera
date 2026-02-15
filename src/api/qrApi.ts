// api/qrApi.ts

import { apiClient } from "../services/api";
import {
  GenerateQRResponse,
  PreviewQRResponse,
  ScanQRResponse,
  QRTokenRequest,
  ScanQRRequest,
} from "../types/qrTypes";

// ===============================
// Generate QR
// ===============================
export const generateQR = async (): Promise<GenerateQRResponse> => {
  try {
    const data = await apiClient.post<GenerateQRResponse>("/qr/generate");

    console.log("✅ QR Generate API Data:", data);

    return data;
  } catch (error: any) {
    console.log("❌ QR Generate API Error:", error?.message || error);
    throw error;
  }
};

// ===============================
// Preview QR
// ===============================
export const previewQR = async (
  payload: QRTokenRequest
): Promise<PreviewQRResponse> => {
  try {
    const data = await apiClient.post<PreviewQRResponse>(
      "/qr/preview",
      payload
    );

    console.log("✅ QR Preview API Data:", data);

    return data;
  } catch (error: any) {
    console.log("❌ QR Preview API Error:", error?.message || error);
    throw error;
  }
};

// ===============================
// Scan QR (UPDATED)
// ===============================
export const scanQR = async (
  payload: ScanQRRequest
): Promise<ScanQRResponse> => {
  try {
    const data = await apiClient.post<ScanQRResponse>(
      "/qr/scan",
      payload
    );

    console.log("✅ QR Scan API Data:", data);

    return data;
  } catch (error: any) {
    console.log("❌ QR Scan API Error:", error?.message || error);
    throw error;
  }
};
