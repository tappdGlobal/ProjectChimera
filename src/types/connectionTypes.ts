// connectionTypes.ts

export interface SendConnectionPayload {
  toUserId: string;
  lookingFor: "FRIENDSHIP" | "RELATIONSHIP";
}

export interface RespondConnectionPayload {
  requestId: string;
  action: "ACCEPT" | "REJECT";
}

export interface PendingConnectionUser {
  requestId: string;
  id: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  occupation: string;
  education: string;
  lookingFor: string;
  age: number;
  height: number;
  gender: string;
  location: string;
  interests: string[];
  smoking: string;
  drinking: string;
  profilePicUrl: string;
  photos: string[];
  latitude: number;
  longitude: number;
  locationVisibility: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AcceptedConnectionUser = PendingConnectionUser;
