import { create } from "zustand";
import {
  getFriendsApi,
  getFriendRequestsApi,
  sendFriendRequestApi,
  acceptFriendRequestApi,
  rejectFriendRequestApi,
  blockUserApi,
  unblockUserApi,
  removeFriendApi,
} from "../api/friendApi";
import { Friend, FriendRequest } from "../types/friendTypes";

interface FriendState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  loading: boolean;
  error: string | null;

  getFriends: () => Promise<void>;
  getFriendRequests: () => Promise<void>;
  sendFriendRequest: (receiverId: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  rejectFriendRequest: (requestId: string) => Promise<boolean>;
  blockUser: (userId: string) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
  clearFriendData: () => void;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  friendRequests: [],
  loading: false,
  error: null,

  getFriends: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getFriendsApi();
      const friendsData = (res as any).data || res;
      
      // Normalize friend data to ensure avatar field exists
      const normalizedFriends: Friend[] = Array.isArray(friendsData) 
        ? friendsData.map((friend: any) => ({
            ...friend,
            user: {
              ...friend.user,
              // Map profilePicUrl to avatar if avatar is not present
              avatar: friend.user?.avatar || friend.user?.profilePicUrl || friend.user?.profilePicture || "",
            },
          }))
        : [];
      
      console.log("[FriendStore] Fetched friends:", normalizedFriends.length);
      set({
        friends: normalizedFriends,
        loading: false,
      });
    } catch (err: any) {
      console.error("Get friends error:", err);
      // Handle 404 as empty friends list (no friends yet)
      if (err.response?.status === 404) {
        set({ friends: [], loading: false });
      } else {
        set({ loading: false, error: err.message || "Failed to fetch friends" });
      }
    }
  },

  getFriendRequests: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getFriendRequestsApi();
      const requestsData = (res as any).data || res;
      set({
        friendRequests: Array.isArray(requestsData) ? requestsData : [],
        loading: false,
      });
    } catch (err: any) {
      console.error("Get friend requests error:", err);
      set({ loading: false, error: err.message || "Failed to fetch friend requests" });
    }
  },

  sendFriendRequest: async (receiverId: string) => {
    try {
      set({ loading: true, error: null });
      await sendFriendRequestApi({ receiverId });
      set({ loading: false });
      return true;
    } catch (err: any) {
      console.error("Send friend request error:", err);
      set({ loading: false, error: err.message || "Failed to send friend request" });
      return false;
    }
  },

  acceptFriendRequest: async (requestId: string) => {
    try {
      set({ loading: true, error: null });
      await acceptFriendRequestApi({ requestId });
      
      // Remove from requests and refresh friends list
      set((state) => ({
        friendRequests: state.friendRequests.filter((req) => req.requestId !== requestId),
        loading: false,
      }));
      
      // Refresh friends list
      get().getFriends();
      return true;
    } catch (err: any) {
      console.error("Accept friend request error:", err);
      set({ loading: false, error: err.message || "Failed to accept friend request" });
      return false;
    }
  },

  rejectFriendRequest: async (requestId: string) => {
    try {
      set({ loading: true, error: null });
      await rejectFriendRequestApi(requestId);
      
      // Remove from requests
      set((state) => ({
        friendRequests: state.friendRequests.filter((req) => req.requestId !== requestId),
        loading: false,
      }));
      return true;
    } catch (err: any) {
      console.error("Reject friend request error:", err);
      set({ loading: false, error: err.message || "Failed to reject friend request" });
      return false;
    }
  },

  blockUser: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      await blockUserApi(userId);
      
      // Remove from friends list
      set((state) => ({
        friends: state.friends.filter((friend) => friend.user.id !== userId),
        loading: false,
      }));
      return true;
    } catch (err: any) {
      console.error("Block user error:", err);
      set({ loading: false, error: err.message || "Failed to block user" });
      return false;
    }
  },

  unblockUser: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      await unblockUserApi(userId);
      set({ loading: false });
      return true;
    } catch (err: any) {
      console.error("Unblock user error:", err);
      set({ loading: false, error: err.message || "Failed to unblock user" });
      return false;
    }
  },

  removeFriend: async (friendshipId: string) => {
    try {
      set({ loading: true, error: null });
      await removeFriendApi(friendshipId);
      
      // Remove from friends list
      set((state) => ({
        friends: state.friends.filter((friend) => friend.friendshipId !== friendshipId),
        loading: false,
      }));
      return true;
    } catch (err: any) {
      console.error("Remove friend error:", err);
      set({ loading: false, error: err.message || "Failed to remove friend" });
      return false;
    }
  },

  clearFriendData: () => {
    set({
      friends: [],
      friendRequests: [],
      error: null,
    });
  },
}));
