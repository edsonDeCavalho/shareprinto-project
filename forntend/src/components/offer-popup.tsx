'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Clock, CheckCircle, XCircle, FileText, MapPin, Users } from 'lucide-react';
import { playNotificationSound } from '@/lib/sound';
import { AudioUtils } from '@/lib/audio-utils';
import { useUser } from '@/contexts/UserContext';

interface OfferDetails {
  orderId: string;
  description: string;
  materialType: string;
  typeOfPrinting: string;
  estimatedTime: number;
  cost: number;
  city: string;
  creatorName?: string;
  numberOfPrints: number;
  instructions?: string;
  // Sequential offer specific fields
  timeout?: number;
  sequentialOffer?: boolean;
  farmerPosition?: number;
  totalFarmers?: number;
}

interface OfferPopupProps {
  offer: OfferDetails;
  isOpen: boolean;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string) => void;
  onTimeout: (orderId: string) => void;
}

export function OfferPopup({ offer, isOpen, onAccept, onDecline, onTimeout }: OfferPopupProps) {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(offer.timeout || 20);
  const [isResponding, setIsResponding] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  console.log('🎪 OfferPopup render:', { isOpen, offer: offer?.orderId, timeLeft });

  // Play sound when popup opens
  useEffect(() => {
    if (isOpen && timeLeft === (offer.timeout || 20)) {
      // Add a small delay to ensure the popup is fully rendered
      const timer = setTimeout(() => {
        playOfferSound();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, offer.timeout]);

  // Timer countdown
  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up
            clearInterval(timerRef.current!);
            // Use setTimeout to avoid setState during render
            setTimeout(() => {
              onTimeout(offer.orderId);
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, timeLeft, onTimeout, offer.orderId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const playOfferSound = async () => {
    try {
      console.log('🔊 Attempting to play offer sound...');
      
      // Use the audio utility with correct paths - new offer sound should be primary
      const success = await AudioUtils.playSoundWithFallback(
        '/sounds/newOffrerProposition.mp3',
        [
          '/iconsImages/newOffrerProposition.mp3',
          '/iconsImages/declineOffee.mp3'
        ],
        0.7
      );
      
      if (!success) {
        console.log('⚠️ Could not play offer sound - this is normal if user has not interacted with the page yet');
      } else {
        console.log('✅ Offer sound played successfully');
      }
    } catch (error) {
      console.log('⚠️ Error playing offer sound (non-critical):', error);
    }
  };

  const handleAccept = async () => {
    console.log('✅ Farmer accepting offer:', offer);
    
    // WebSocket functionality removed

    try {
      // Play accept bell sound immediately
      const { playBellAcceptOffer } = await import('@/lib/sound');
      await playBellAcceptOffer();
    } catch (e) {
      console.warn('Could not play accept bell sound:', e);
    }

    onAccept?.(offer.orderId);
  };

  const handleDecline = () => {
    console.log('❌ Farmer declining offer:', offer);
    
    // WebSocket functionality removed

    onDecline?.(offer.orderId);
  };

  if (!isOpen) {
    console.log('🎪 OfferPopup: Not open, returning null');
    return null;
  }
  
  console.log('🎪 OfferPopup: Rendering popup content');

  const totalTime = offer.timeout || 20;
  const progressPercentage = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white animate-in zoom-in-95 duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-green-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              New Offer!
              {offer.sequentialOffer && offer.farmerPosition && offer.totalFarmers && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {offer.farmerPosition}/{offer.totalFarmers}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-mono text-orange-600">{timeLeft}s</span>
            </div>
          </div>
          
          {/* Timer Progress Bar */}
          <div className="mt-2">
            <Progress 
              value={progressPercentage} 
              className="h-2"
              style={{
                '--progress-background': timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#10b981'
              } as React.CSSProperties}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Order ID and Price */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-sm">
              {offer.orderId}
            </Badge>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Offer Price</div>
              <div className="text-3xl font-bold text-green-600">
                ${offer.cost}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{offer.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{offer.materialType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{offer.estimatedTime}h</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{offer.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{offer.numberOfPrints} prints</span>
            </div>
          </div>

          {/* Instructions (if any) */}
          {offer.instructions && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Special Instructions</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{offer.instructions}</p>
            </div>
          )}

          {/* Creator Info */}
          {offer.creatorName && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">From:</span> {offer.creatorName}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleAccept}
              disabled={isResponding}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isResponding ? 'Accepting...' : 'Accept Offer'}
            </Button>
            <Button
              onClick={handleDecline}
              disabled={isResponding}
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isResponding ? 'Declining...' : 'Decline'}
            </Button>
          </div>

          {/* Warning Message */}
          <div className="text-xs text-center text-gray-500 bg-yellow-50 p-2 rounded">
            ⚠️ This offer will expire in {timeLeft} seconds
            {offer.sequentialOffer && (
              <div className="mt-1 text-blue-600">
                🔄 Sequential offer - if you don't respond, it goes to the next farmer
              </div>
            )}
          </div>
          
          {/* Audio Status */}
          <div className="text-xs text-center text-blue-500 bg-blue-50 p-2 rounded">
            🔊 Audio notifications enabled
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
