/* ================= PHOTO TYPES ================= */

export interface PhotoFile {
  uri: string;
  name: string;
  type: string;
}

export interface PhotoUploadResponse {
  photos: string[];
}

export interface PhotoDeleteResponse {
  photos: string[];
}

export interface PhotoState {
  uploading: boolean;
  deleting: string | null; // photoUrl that is being deleted
  error: string | null;
}
