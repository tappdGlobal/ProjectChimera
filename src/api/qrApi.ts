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


    return data;
  } catch (error: any) {
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

    return data;
  } catch (error: any) {
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


    return data;
  } catch (error: any) {
    throw error;
  }
};
