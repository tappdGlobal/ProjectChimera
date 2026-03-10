import { apiClient } from "../services/api";
import { ApiResponse } from "../types/authTypes";

/* ================= CREATE ORDER ================= */

export interface CreateOrderPayload {
    bookingId: string;
}

export interface RazorpayOrderResponse {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
}

export const createPaymentOrderApi = (
    payload: CreateOrderPayload
): Promise<ApiResponse<RazorpayOrderResponse>> => {
    return apiClient.post("/payments/create-order", payload);
};

/* ================= VERIFY PAYMENT ================= */

export interface VerifyPaymentPayload {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface VerifyPaymentResponse {
    id: string;
    status: string;
    qrCode: string;
}

export const verifyPaymentApi = (
    payload: VerifyPaymentPayload
): Promise<ApiResponse<VerifyPaymentResponse>> => {
    return apiClient.post("/payments/verify", payload);
};
