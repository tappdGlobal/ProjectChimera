export type Gender = "MALE" | "FEMALE" | "OTHER";
export type LookingFor = "FRIENDSHIP" | "DATING" | "NETWORKING";
export type Smoking = "NO" | "YES" | "OCCASIONALLY";
export type Drinking = "NO" | "YES" | "SOCIALLY";

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  bio?: string;
  occupation?: string;
  education?: string;
  lookingFor?: LookingFor;
  age?: number;
  height?: number;
  gender?: Gender;
  location?: string;
  interests?: string[];
  smoking?: Smoking;
  drinking?: Drinking;
  profilePicUrl?: string;
  photos?: string[];
  latitude?: number;
  longitude?: number;
  locationVisibility?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data?: T;
}
