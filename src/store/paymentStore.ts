import { create } from "zustand";
import {
  createPaymentOrderApi,
  verifyPaymentApi,
} from "../api/paymentApi";
import {
  RazorpayOrderResponse,
  VerifyPaymentResponse,
} from "../types/paymentTypes";

interface PaymentState {
  order: RazorpayOrderResponse | null;
  loading: boolean;
  error: string | null;
  verifiedBooking: VerifyPaymentResponse | null;

  createOrder: (bookingId: string) => Promise<RazorpayOrderResponse | null>;
  verifyPayment: (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ) => Promise<void>;

  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  order: null,
  loading: false,
  error: null,
  verifiedBooking: null,

  /* ================= CREATE ORDER ================= */

  createOrder: async (bookingId: string) => {
    try {
      console.log("📤 CREATE ORDER REQUEST - bookingId:", bookingId);

      set({ loading: true, error: null });

      const res = await createPaymentOrderApi({ bookingId });

      console.log("📥 CREATE ORDER API RESPONSE:", res);

      const order = res?.data;

      console.log("🧾 RAZORPAY ORDER:", order);

      set({
        order,
        loading: false,
      });

      console.log("🎟 Razorpay Order Stored In State:", order);

      return order; // return order for Razorpay checkout
    } catch (error: any) {
      console.log("❌ CREATE ORDER ERROR:", error);

      set({
        error: error?.response?.data?.message || "Order creation failed",
        loading: false,
      });

      return null;
    }
  },

  /* ================= VERIFY PAYMENT ================= */

  verifyPayment: async (
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  ) => {
    try {
      console.log("📤 VERIFY PAYMENT REQUEST:", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      set({ loading: true });

      const res = await verifyPaymentApi({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      console.log("📥 VERIFY PAYMENT API RESPONSE:", res);

      const verified = res?.data;

      set({
        verifiedBooking: verified,
        loading: false,
      });

      console.log("🎫 VERIFIED BOOKING STORED:", verified);
    } catch (error: any) {
      console.log("❌ VERIFY PAYMENT ERROR:", error);

      set({
        error:
          error?.response?.data?.message || "Payment verification failed",
        loading: false,
      });
    }
  },

  /* ================= RESET ================= */

  reset: () => {
    console.log("♻️ RESET PAYMENT STORE");

    set({
      order: null,
      loading: false,
      error: null,
      verifiedBooking: null,
    });
  },
}));