interface OfferData {
  orderId: string;
  description: string;
  materialType: string;
  typeOfPrinting: string;
  estimatedTime: number;
  cost: number;
  city: string;
  numberOfPrints: number;
  instructions?: string;
  creatorName?: string;
}

interface SequentialOfferResult {
  success: boolean;
  acceptedBy?: string;
  message: string;
  totalFarmersContacted?: number;
  timeElapsed?: number;
}

interface FarmerResponse {
  orderId: string;
  farmerId: string;
  accepted: boolean;
}

export class SequentialOfferService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';

  /**
   * Start sequential offer dispatch for an order
   */
  static async startSequentialOffers(offerData: OfferData): Promise<SequentialOfferResult> {
    try {
      console.log(`🎯 Starting sequential offers for order ${offerData.orderId}`);
      
      const response = await fetch(`${this.API_BASE_URL}/api/sequential-offers/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Sequential offers completed successfully:`, result);
        return {
          success: true,
          acceptedBy: result.data?.acceptedBy,
          message: result.message,
          totalFarmersContacted: result.data?.totalFarmersContacted,
          timeElapsed: result.data?.timeElapsed
        };
      } else {
        console.log(`❌ Sequential offers completed without acceptance:`, result);
        return {
          success: false,
          message: result.message,
          totalFarmersContacted: result.data?.totalFarmersContacted,
          timeElapsed: result.data?.timeElapsed
        };
      }
    } catch (error) {
      console.error('Error starting sequential offers:', error);
      return {
        success: false,
        message: 'Failed to start sequential offer dispatch',
        totalFarmersContacted: 0,
        timeElapsed: 0
      };
    }
  }

  /**
   * Send farmer response (accept/decline)
   */
  static async sendFarmerResponse(response: FarmerResponse): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`📨 Sending farmer response:`, response);
      
      const apiResponse = await fetch(`${this.API_BASE_URL}/api/sequential-offers/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      });

      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      
      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('Error sending farmer response:', error);
      return {
        success: false,
        message: 'Failed to send farmer response'
      };
    }
  }

  /**
   * Cancel an active offer session
   */
  static async cancelOfferSession(orderId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🚫 Cancelling offer session for order ${orderId}`);
      
      const response = await fetch(`${this.API_BASE_URL}/api/sequential-offers/${orderId}/cancel`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('Error cancelling offer session:', error);
      return {
        success: false,
        message: 'Failed to cancel offer session'
      };
    }
  }

  /**
   * Get active offer sessions
   */
  static async getActiveOffers(): Promise<{
    success: boolean;
    activeOffers?: Array<{
      orderId: string;
      currentFarmerIndex: number;
      totalFarmers: number;
      startTime: string;
      currentFarmer?: string;
    }>;
    count?: number;
  }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/sequential-offers/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: result.success,
        activeOffers: result.data?.activeOffers,
        count: result.data?.count
      };
    } catch (error) {
      console.error('Error getting active offers:', error);
      return {
        success: false
      };
    }
  }
}

