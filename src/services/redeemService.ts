import { apiClient } from './api';

export interface RedeemRequest {
  amount: number;
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
   * @returns Promise with redemption response
   */
  async requestRedemption(amount: number): Promise<RedeemResponse> {
    try {
      const response = await apiClient.post<RedeemResponse>('/redeem', {
        amount
      });
      
      return response;
    } catch (error: any) {
      const errorResponse: RedeemError = {
        success: false,
        message: 'Failed to process redemption request'
      };

      if (error.response?.data?.message) {
        errorResponse.message = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorResponse.message = error.response.data.error;
      } else if (error.message) {
        errorResponse.message = error.message;
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
