import { User } from "./authTypes";

export interface NearbyAttendee extends User {
  distance: number; // in km
}

export interface InterestMatch {
  user: User;
  commonInterests: string[];
}
