const API_BASE_URL = '/api/notifications';

export interface Notification {
  id: string;
  userId: string;
  type: 'order_accepted' | 'order_completed' | 'order_cancelled' | 'payment_received' | 'system' | 'general';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationRequest {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
}

// Helper functions for creating specific types of notifications
export interface OrderNotificationData {
  orderId: string;
  orderStatus?: string;
  farmerId?: string;
  creatorId?: string;
}

export interface PaymentNotificationData {
  amount: number;
  currency: string;
  transactionId: string;
}

export class NotificationHelpers {
  static createOrderNotification(
    userId: string,
    type: 'order_accepted' | 'order_completed' | 'order_cancelled',
    orderData: OrderNotificationData,
    title: string,
    message: string
  ): CreateNotificationRequest {
    return {
      userId,
      type,
      title,
      message,
      data: {
        orderId: orderData.orderId,
        orderStatus: orderData.orderStatus,
        farmerId: orderData.farmerId,
        creatorId: orderData.creatorId,
      },
    };
  }

  static createPaymentNotification(
    userId: string,
    paymentData: PaymentNotificationData,
    title: string,
    message: string
  ): CreateNotificationRequest {
    return {
      userId,
      type: 'payment_received',
      title,
      message,
      data: {
        amount: paymentData.amount,
        currency: paymentData.currency,
        transactionId: paymentData.transactionId,
      },
    };
  }

  static createSystemNotification(
    userId: string,
    title: string,
    message: string,
    redirectPath?: string,
    queryParams?: Record<string, string>
  ): CreateNotificationRequest {
    return {
      userId,
      type: 'system',
      title,
      message,
      data: {
        redirectPath,
        queryParams,
      },
    };
  }
}

export class NotificationService {
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    // Notifications service disabled - return empty array
    console.log('Notifications service disabled');
    return [];
  }

  static async markAsRead(notificationId: string): Promise<void> {
    // Notifications service disabled - no-op
    console.log('Notifications service disabled - markAsRead ignored');
  }

  static async markAllAsRead(userId: string): Promise<void> {
    // Notifications service disabled - no-op
    console.log('Notifications service disabled - markAllAsRead ignored');
  }

  static async createNotification(notificationData: CreateNotificationRequest): Promise<Notification> {
    // Notifications service disabled - return mock notification
    console.log('Notifications service disabled - createNotification ignored');
    return {
      id: 'disabled',
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      read: false,
      data: notificationData.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    // Notifications service disabled - no-op
    console.log('Notifications service disabled - deleteNotification ignored');
  }

  static async getUnreadCount(userId: string): Promise<number> {
    // Notifications service disabled - return 0
    console.log('Notifications service disabled - getUnreadCount returning 0');
    return 0;
  }
}
