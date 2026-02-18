// connectionTypes.ts

/* ===============================
   ENUMS
================================= */

export type ConnectionIntent =
  | "FRIENDSHIP"
  | "RELATIONSHIP"
  | "NETWORKING"; // add more if backend supports

export type ConnectionAction = "ACCEPT" | "REJECT";

/* ===============================
   SEND CONNECTION
================================= */

export interface SendConnectionPayload {
  toUserId: string;
  intent: ConnectionIntent[];   // 🔥 changed from lookingFor
}

/* ===============================
   RESPOND TO CONNECTION
================================= */

export interface RespondConnectionPayload {
  requestId: string;
  action: ConnectionAction;
  intent: ConnectionIntent[];   // 🔥 required now as per Swagger
}

/* ===============================
   BASE USER (Reusable)
================================= */

export interface BaseConnectionUser {
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

  interests?: string[];
  smoking?: string;
  drinking?: string;

  profilePicUrl?: string;
  photos?: string[];

  latitude?: number;
  longitude?: number;
  locationVisibility?: boolean;

  createdAt: string;
  updatedAt: string;
}

/* ===============================
   PENDING CONNECTION USER
================================= */

export interface PendingConnectionUser extends BaseConnectionUser {
  requestId: string;
  intent: ConnectionIntent[];
}

/* ===============================
   ACCEPTED CONNECTION USER
================================= */

export interface AcceptedConnectionUser extends BaseConnectionUser {
  connectionId: string;        // 🔥 different from requestId
  intent: ConnectionIntent[];
}
