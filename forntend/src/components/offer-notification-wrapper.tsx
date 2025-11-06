'use client';

import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useNotification } from '@/contexts/NotificationContext';

export function OfferNotificationWrapper() {
  const { user, isAuthenticated } = useUser();
  const { showOfferPopup } = useNotification();

  // Only listen for window events (fallback for local testing)
  // Socket.IO events are now handled by GlobalSocketManager
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<any>;
      const data = custom.detail;
      if (!data) return;
      
      console.log('🎯 Global notification: Received offer via window event (fallback):', data);
      showOfferPopup({
        orderId: data.orderId,
        description: data.description || 'New order available',
        materialType: data.materialType || 'PLA',
        typeOfPrinting: data.typeOfPrinting || 'FDM',
        estimatedTime: data.estimatedTime || 120,
        cost: data.cost || 25,
        city: data.city || 'Unknown',
        numberOfPrints: data.numberOfPrints || 1,
        instructions: data.instructions,
        creatorName: data.creatorName,
      });
    };

    window.addEventListener('shareprinto:new-offer', handler as EventListener);
    return () => window.removeEventListener('shareprinto:new-offer', handler as EventListener);
  }, [showOfferPopup]);

  // This component doesn't render anything visible
  return null;
}