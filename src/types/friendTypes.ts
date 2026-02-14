export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';

export interface FriendRequest {
  id: string;
  requestId: string;
  sender: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Friend {
  friendshipId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  status: FriendshipStatus;
  updatedAt: string;
}

export interface SendFriendRequestPayload {
  receiverId: string;
}

export interface AcceptFriendRequestPayload {
  requestId: string;
}
