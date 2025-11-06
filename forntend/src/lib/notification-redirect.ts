import { Notification } from '@/services/notificationService';

export interface NotificationRedirect {
  path: string;
  query?: Record<string, string>;
}

export function getNotificationRedirect(notification: Notification): NotificationRedirect | null {
  // Extract relevant data from notification
  const { type, data } = notification;
  
  switch (type) {
    case 'order_accepted':
    case 'order_completed':
    case 'order_cancelled':
      // Redirect to order details page
      if (data?.orderId || data?.orderID) {
        return {
          path: `/orders/${data.orderId || data.orderID}`,
        };
      }
      // Fallback to orders page
      return {
        path: '/orders',
      };
      
    case 'payment_received':
      // Redirect to finance page
      return {
        path: '/finance',
      };
      
    case 'system':
      // For system notifications, check if there's specific data
      if (data?.redirectPath) {
        return {
          path: data.redirectPath,
          query: data.queryParams,
        };
      }
      // No redirect for general system notifications
      return null;
      
    case 'general':
      // For general notifications, check if there's specific data
      if (data?.redirectPath) {
        return {
          path: data.redirectPath,
          query: data.queryParams,
        };
      }
      // No redirect for general notifications
      return null;
      
    default:
      return null;
  }
}

export function buildRedirectUrl(redirect: NotificationRedirect): string {
  if (!redirect.query || Object.keys(redirect.query).length === 0) {
    return redirect.path;
  }
  
  const queryString = new URLSearchParams(redirect.query).toString();
  return `${redirect.path}?${queryString}`;
}



