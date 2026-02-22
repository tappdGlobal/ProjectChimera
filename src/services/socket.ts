import { io, Socket } from "socket.io-client";
import { LegacyMessage } from "../types/chatTypes";

// Socket URL configuration - remove /api/v1 from base URL
const USE_PRODUCTION = true;
const PRODUCTION_SOCKET_URL = "https://tappd-backend-main.onrender.com";
const LOCAL_SOCKET_URL = "http://192.168.29.144:3000";

const SOCKET_URL = USE_PRODUCTION ? PRODUCTION_SOCKET_URL : LOCAL_SOCKET_URL;

class SocketService {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: LegacyMessage) => void)[] = [];
  private isConnecting: boolean = false;

  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;
  private lastConnectionAttempt: number = 0;
  private connectionCooldown: number = 30000; // 30 seconds cooldown

  connect(token: string) {
    // Prevent multiple simultaneous connection attempts
    if (this.socket?.connected || this.isConnecting) {
      console.log("Socket already connected or connecting");
      return;
    }

    // Validate token before connecting
    if (!token) {
      console.warn("Cannot connect socket: No token provided");
      return;
    }

    // Check if we've exceeded max attempts and need to cooldown
    const now = Date.now();
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      if (now - this.lastConnectionAttempt < this.connectionCooldown) {
        console.log("Socket connection cooldown active, skipping connection attempt");
        return;
      }
      // Reset attempts after cooldown
      this.connectionAttempts = 0;
    }

    this.isConnecting = true;
    this.connectionAttempts++;
    this.lastConnectionAttempt = now;

    try {
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"], // Allow fallback to polling
        reconnection: false, // Disable auto-reconnection - we'll handle it manually
        timeout: 10000, // 10 second timeout
        autoConnect: true,
      });

      this.socket.on("connect", () => {
        console.log("✅ Socket connected:", this.socket?.id);
        this.isConnecting = false;
        this.connectionAttempts = 0; // Reset attempts on successful connection
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        this.isConnecting = false;
      });

      this.socket.on("connect_error", (error: any) => {
        // Only log if it's not a timeout error to avoid spam
        if (error.message !== "timeout") {
          console.warn("Socket connection error:", error.message || error);
        }
        this.isConnecting = false;
        // Don't spam reconnection attempts - close socket on error
        if (this.socket) {
          this.socket.close();
          this.socket = null;
        }
      });

      // Listen for incoming messages
      this.socket.on("receiveMessage", (message: any) => {
        console.log("📩 Received message via socket:", JSON.stringify(message, null, 2));
        
        // Ensure message has senderId - backend might send it in different format
        // Include conversationId from backend to route message to correct chat
        const legacyMessage: LegacyMessage = {
          id: message.id || `msg-${Date.now()}`,
          senderId: message.senderId || message.sender?.id || "",
          receiverId: message.receiverId || "",
          content: message.content || "",
          messageType: message.messageType || "text",
          delivered: message.delivered || false,
          seen: message.seen || message.isRead || false,
          createdAt: message.createdAt || new Date().toISOString(),
          conversationId: message.conversationId || message.conversation?.id || "",
        };
        
        console.log("📩 Converted to LegacyMessage:", legacyMessage);
        this.messageCallbacks.forEach((callback) => callback(legacyMessage));
      });
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
      this.messageCallbacks = [];
      this.isConnecting = false;
      this.connectionAttempts = 0; // Reset attempts on manual disconnect
    }
  }

  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      console.log("🔗 Joining conversation:", conversationId);
      this.socket.emit("joinConversation", conversationId);
    } else {
      console.warn("Socket not connected. Cannot join conversation.");
    }
  }

  sendMessage(conversationId: string, content: string) {
    if (this.socket?.connected) {
      console.log("📤 Sending message via socket:", { conversationId, content });
      // Backend expects: { conversationId, content }
      // Backend will NOT spoof senderId - uses JWT user id
      this.socket.emit("sendMessage", {
        conversationId,
        content,
      });
    } else {
      console.warn("Socket not connected. Cannot send message.");
    }
  }

  onReceiveMessage(callback: (message: LegacyMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  removeMessageCallback(callback: (message: LegacyMessage) => void) {
    this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
