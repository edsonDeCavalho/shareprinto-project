'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { OfferPopup } from '@/components/offer-popup';
import { SequentialOfferService } from '@/services/sequentialOfferService';

interface OfferDetails {
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
  offerId?: string; // For tracking individual offer responses
}

interface NotificationContextType {
  showOfferPopup: (offer: OfferDetails) => void;
  hideOfferPopup: () => void;
  currentOffer: OfferDetails | null;
  isOfferVisible: boolean;
  hasUnreadOffers: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [currentOffer, setCurrentOffer] = useState<OfferDetails | null>(null);
  const [isOfferVisible, setIsOfferVisible] = useState(false);
  const [hasUnreadOffers, setHasUnreadOffers] = useState(false);

  const showOfferPopup = useCallback((offer: OfferDetails) => {
    console.log('🎯 Global notification: Showing offer popup:', offer);
    setCurrentOffer(offer);
    setIsOfferVisible(true);
    setHasUnreadOffers(true);
    console.log('🎯 State updated, popup should be visible now');
  }, []); // Fixed: Empty dependency array since this function doesn't depend on any external values

  const hideOfferPopup = useCallback(() => {
    console.log('🎯 Global notification: Hiding offer popup');
    setCurrentOffer(null);
    setIsOfferVisible(false);
    setHasUnreadOffers(false);
  }, []);

  const handleAccept = useCallback(async (orderId: string) => {
    console.log('✅ Global notification: Farmer accepting offer:', orderId);
    
    // Send acceptance response directly to dispatcher
    if (currentOffer?.offerId) {
      try {
        const dispatcherUrl = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';
        const response = await fetch(`${dispatcherUrl}/api/user-status/offer-response`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            offerId: currentOffer.offerId,
            accepted: true
          }),
        });
        
        if (response.ok) {
          console.log('✅ Farmer acceptance response sent to dispatcher');
        } else {
          console.error('❌ Failed to send acceptance response to dispatcher');
        }
      } catch (error) {
        console.error('❌ Error sending acceptance response:', error);
      }
    }
    
    // Play accept bell sound
    try {
      const { playBellAcceptOffer } = await import('@/lib/sound');
      await playBellAcceptOffer();
    } catch (e) {
      console.warn('Could not play accept bell sound:', e);
    }

    // Hide popup
    hideOfferPopup();
    
    // Show success message
    if (typeof window !== 'undefined') {
      alert(`✅ Order ${orderId} accepted! Check your dashboard for details.`);
    }
  }, [hideOfferPopup, currentOffer]);

  const handleDecline = useCallback(async (orderId: string) => {
    console.log('❌ Global notification: Farmer declining offer:', orderId);
    
    // Send decline response directly to dispatcher
    if (currentOffer?.offerId) {
      try {
        const dispatcherUrl = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';
        const response = await fetch(`${dispatcherUrl}/api/user-status/offer-response`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            offerId: currentOffer.offerId,
            accepted: false
          }),
        });
        
        if (response.ok) {
          console.log('❌ Farmer decline response sent to dispatcher');
        } else {
          console.error('❌ Failed to send decline response to dispatcher');
        }
      } catch (error) {
        console.error('❌ Error sending decline response:', error);
      }
    }
    
    hideOfferPopup();
  }, [hideOfferPopup, currentOffer]);

  const handleTimeout = useCallback(async (orderId: string) => {
    console.log('⏱️ Global notification: Offer timed out:', orderId);
    
    // Send timeout response (treated as decline) directly to dispatcher
    if (currentOffer?.offerId) {
      try {
        const dispatcherUrl = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';
        const response = await fetch(`${dispatcherUrl}/api/user-status/offer-response`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            offerId: currentOffer.offerId,
            accepted: false // Timeout is treated as decline
          }),
        });
        
        if (response.ok) {
          console.log('⏱️ Farmer timeout response sent to dispatcher');
        } else {
          console.error('❌ Failed to send timeout response to dispatcher');
        }
      } catch (error) {
        console.error('❌ Error sending timeout response:', error);
      }
    }
    
    hideOfferPopup();
  }, [hideOfferPopup, currentOffer]);

  return (
    <NotificationContext.Provider
      value={{
        showOfferPopup,
        hideOfferPopup,
        currentOffer,
        isOfferVisible,
        hasUnreadOffers
      }}
    >
      {children}
      
      {/* Global Offer Popup */}
      {currentOffer && (
        <>
          {console.log('🎪 Rendering OfferPopup with:', { currentOffer, isOfferVisible })}
          <OfferPopup
            offer={currentOffer}
            isOpen={isOfferVisible}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onTimeout={handleTimeout}
          />
        </>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
