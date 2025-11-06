'use client';

import { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import useSocket from '../hooks/useSocket';

/**
 * Global Socket Manager Component
 * Automatically establishes socket connection when user is authenticated
 * and handles logout/disconnect events
 */
export const GlobalSocketManager: React.FC = () => {
  const { user, isAuthenticated } = useUser();
  const { showOfferPopup } = useNotification();
  
  const {
    isConnected,
    connect,
    disconnect,
    emitUserLogout,
    userStatusEvents
  } = useSocket({
    userId: user?.id, // Use MongoDB _id
    username: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email,
    autoConnect: false // We'll handle connection manually
  });

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isConnected) {
      console.log('🔌 Establishing socket connection for user:', user.email);
      
      // Store user ID globally for sequential offer responses
      (window as any).currentUserId = user.id || user.userId;
      localStorage.setItem('userId', user.id || user.userId || '');
      
      connect({
        userId: user.id, // Use MongoDB _id
        username: `${user.firstName} ${user.lastName}`,
        email: user.email
      });
    } else if (!isAuthenticated && isConnected) {
      console.log('🔌 Disconnecting socket - user not authenticated');
      
      // Clear user ID when disconnecting
      (window as any).currentUserId = null;
      localStorage.removeItem('userId');
      
      disconnect();
    }
  }, [isAuthenticated, user, isConnected, connect, disconnect]);

  // Handle offer notifications for farmers
  useEffect(() => {
    if (userStatusEvents.length > 0 && user?.userType === 'farmer') {
      const latestEvent = userStatusEvents[userStatusEvents.length - 1];
      
      // Check if this is an offer notification
      if (latestEvent.metadata?.offerNotification && latestEvent.metadata?.offerData) {
        const offerData = latestEvent.metadata.offerData;
        console.log('🎯 GlobalSocketManager: Received offer via Socket.IO:', offerData);
        
        showOfferPopup({
          orderId: offerData.orderId,
          description: offerData.description || 'New order available',
          materialType: offerData.materialType || 'PLA',
          typeOfPrinting: offerData.typeOfPrinting || 'FDM',
          estimatedTime: offerData.estimatedTime || 120,
          cost: offerData.cost || 25,
          city: offerData.city || 'Unknown',
          numberOfPrints: offerData.numberOfPrints || 1,
          instructions: offerData.instructions,
          creatorName: offerData.creatorName,
        });
      }
    }
  }, [userStatusEvents, user?.userType, showOfferPopup]);

  // Handle logout via socket
  useEffect(() => {
    if (user?.id && isConnected) {
      // Store the emitUserLogout function globally for use in logout
      (window as any).emitSocketLogout = () => {
        console.log('🔌 Emitting socket logout for user:', user.id);
        emitUserLogout(user.id);
      };
    }
  }, [user?.id, isConnected, emitUserLogout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected, disconnect]);

  // This component doesn't render anything
  return null;
};

export default GlobalSocketManager;


