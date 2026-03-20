import { apiClient } from './api';

export interface BankDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  ifsc: string;
}

export interface RedeemRequest {
  amount: number;
  bankDetails: BankDetails;
}

export interface RedeemResponse {
  success: boolean;
  message: string;
  redeemRequestId?: string;
}

export interface RedeemError {
  success: false;
  message: string;
  code?: string;
}

export const redeemService = {
  /**
   * Submit a redemption request
   * @param amount - Amount to redeem (in INR)
   * @param bankDetails - Bank account details for payout
   * @returns Promise with redemption response
   */
  async requestRedemption(amount: number, bankDetails: BankDetails): Promise<RedeemResponse> {
    try {
      const payload = {
        amount,
        bankDetails
      };
      console.log('🔵 REDEEM PAYLOAD:', JSON.stringify(payload, null, 2));
      
      const response = await apiClient.post<RedeemResponse>('/redeem', payload);
      
      return response;
    } catch (error: any) {
      const errorResponse: RedeemError = {
        success: false,
        message: 'Failed to process redemption request'
      };

      const data = error?.response?.data;

      if (data?.message) {
        errorResponse.message = String(data.message);
      } else if (data?.error) {
        const backendError = data.error;
        if (typeof backendError === 'string') {
          errorResponse.message = backendError;
        } else if (backendError?.message) {
          errorResponse.message = String(backendError.message);
        }
      } else if (error.message) {
        errorResponse.message = String(error.message);
      }

      // Add error code if available
      if (error.response?.status) {
        errorResponse.code = error.response.status.toString();
      }

      throw errorResponse;
    }
  },

  /**
   * Get redemption history (for future implementation)
   */
  async getRedemptionHistory(): Promise<any[]> {
    try {
      const response = await apiClient.get('/redeem/history');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch redemption history:', error);
      return [];
    }
  }
};
