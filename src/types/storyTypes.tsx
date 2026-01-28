import { User } from "./authTypes";

export type StoryMediaType = "IMAGE" | "VIDEO";

export interface StoryMedia {
  id: string;
  type: StoryMediaType;
  url: string;
  thumbnailUrl?: string;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  media: StoryMedia;
  caption?: string;
  viewsCount: number;
  createdAt: string;
  expiresAt: string;
}

export interface StoryView {
  id: string;
  storyId: string;
  viewerId: string;
  viewer: User;
  viewedAt: string;
}
