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

      set({ loading: true, error: null });

      const res = await createPaymentOrderApi({ bookingId });


      const order = res?.data;

      set({
        order,
        loading: false,
      });

      return order; // return order for Razorpay checkout
    } catch (error: any) {

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

      set({ loading: true });

      const res = await verifyPaymentApi({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      const verified = res?.data;

      set({
        verifiedBooking: verified,
        loading: false,
      });

    } catch (error: any) {

      set({
        error:
          error?.response?.data?.message || "Payment verification failed",
        loading: false,
      });
    }
  },

  /* ================= RESET ================= */

  reset: () => {

    set({
      order: null,
      loading: false,
      error: null,
      verifiedBooking: null,
    });
  },
}));