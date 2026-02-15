// types/qrTypes.ts

// ===============================
// Connection Intent Enum
// ===============================

export type ConnectionIntent =
  | "FRIENDSHIP"
  | "DATE"
  | "NETWORKING";

// ===============================
// Generate QR
// ===============================

export interface GenerateQRResponse {
  success: boolean;
  token: string;
  expiresAt: string;
}

// ===============================
// QR Token Request (UPDATED)
// ===============================

export interface QRTokenRequest {
  token: string;
  intent?: ConnectionIntent[]; // 🔥 optional for preview, required for scan
}

// ===============================
// QR Owner
// ===============================

export interface QROwner {
  id: string;
  name: string;
  username: string;
  profilePicUrl: string;
}

// ===============================
// Preview QR
// ===============================

export interface PreviewQRResponse {
  owner: QROwner;
  expiresAt: string;
}

// ===============================
// Scan QR
// ===============================

export interface ScanQRResponse {
  success: boolean;
  message: string;
  connection: any; // replace later with proper type
}
