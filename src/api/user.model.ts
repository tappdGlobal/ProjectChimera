export interface User {
  id: string;
  name: string;
  email: string;
  username: string;

  bio?: string;
  occupation?: string;
  education?: string;
  lookingFor?: string;
  age?: number;
  height?: number;
  gender?: string;
  location?: string;

  interests: string[];
  smoking?: string;
  drinking?: string;

  profilePicUrl?: string;
  photos: string[];

  latitude?: number;
  longitude?: number;
  locationVisibility: boolean;
  lastLocationUpdate?: string;

  createdAt: string;
  updatedAt: string;

  phone?: string;
  avatar?: string;
  isVerified?: boolean;
  emailVerifiedAt?: string;

  settings?: {
    notifications: boolean;
    privacy: boolean;
  };
}
