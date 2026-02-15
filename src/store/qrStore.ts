// store/qrStore.ts

import { create } from "zustand";
import {
  GenerateQRResponse,
  PreviewQRResponse,
  ScanQRResponse,
  QROwner,
  ConnectionIntent,
} from "../types/qrTypes";
import { generateQR, previewQR, scanQR } from "../api/qrApi";

interface QRState {
  token: string | null;
  expiresAt: string | null;
  previewUser: QROwner | null;
  loading: boolean;
  error: string | null;

  generateQRAction: () => Promise<GenerateQRResponse>;
  previewQRAction: (token: string) => Promise<PreviewQRResponse>;
  scanQRAction: (
    token: string,
    intent: ConnectionIntent[]
  ) => Promise<ScanQRResponse>;

  clearQR: () => void;
}

export const useQRStore = create<QRState>((set) => ({
  token: null,
  expiresAt: null,
  previewUser: null,
  loading: false,
  error: null,

  // ===============================
  // Generate QR
  // ===============================
  generateQRAction: async () => {
    try {
      set({ loading: true, error: null });

      const data = await generateQR();

      set({
        token: data.token,
        expiresAt: data.expiresAt,
        loading: false,
      });

      return data;
    } catch (error: any) {
      set({
        loading: false,
        error: error?.message || "Failed to generate QR",
      });

      throw error;
    }
  },

  // ===============================
  // Preview QR
  // ===============================
  previewQRAction: async (token: string) => {
    try {
      set({ loading: true, error: null });

      const data = await previewQR({ token });

      set({
        previewUser: data.owner,
        loading: false,
      });

      return data;
    } catch (error: any) {
      set({
        loading: false,
        error: error?.message || "Invalid or expired QR token",
      });

      throw error;
    }
  },

  // ===============================
  // Scan QR (UPDATED)
  // ===============================
  scanQRAction: async (
    token: string,
    intent: ConnectionIntent[]
  ) => {
    try {
      set({ loading: true, error: null });

      const data = await scanQR({
        token,
        intent,
      });

      set({ loading: false });

      return data;
    } catch (error: any) {
      set({
        loading: false,
        error: error?.message || "Failed to send connection request",
      });

      throw error; // 🔥 REQUIRED for toast to work
    }
  },

  clearQR: () => {
    set({
      token: null,
      expiresAt: null,
      previewUser: null,
      error: null,
    });
  },
}));
