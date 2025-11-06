'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Send, Users, MapPin, Clock, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { FarmerLocation } from '@/services/farmerService';

interface OrderDetails {
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
}

interface CreatorOfferPopupProps {
  isOpen: boolean;
  availableFarmers: FarmerLocation[];
  orderDetails: OrderDetails;
  onSendOffers: (farmerIds: string[]) => void;
  onClose: () => void;
}

export function CreatorOfferPopup({ 
  isOpen, 
  availableFarmers, 
  orderDetails, 
  onSendOffers, 
  onClose 
}: CreatorOfferPopupProps) {
  const [isSending, setIsSending] = useState(false);
  const [offersSent, setOffersSent] = useState(false);

  // Automatically send offers when popup opens
  useEffect(() => {
    if (isOpen && availableFarmers.length > 0 && !offersSent) {
      const sendOffersAutomatically = async () => {
        setIsSending(true);
        try {
          // Send to all available farmers
          await onSendOffers(availableFarmers.map(f => f.id));
          setOffersSent(true);
        } catch (error) {
          console.error('Error sending offers:', error);
        } finally {
          setIsSending(false);
        }
      };

      // Small delay to show the popup first
      const timer = setTimeout(sendOffersAutomatically, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, availableFarmers, onSendOffers, offersSent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Offers...
                </>
              ) : offersSent ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Offers Sent!
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Sending Order to Farmers
                </>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              disabled={isSending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto">
          {/* Order Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Order Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Order ID:</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {orderDetails.orderId}
                </Badge>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Price:</span>
                <span className="ml-2 text-green-600 font-bold">${orderDetails.cost}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Material:</span>
                <span className="ml-2">{orderDetails.materialType}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Type:</span>
                <span className="ml-2">{orderDetails.typeOfPrinting}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Time:</span>
                <span className="ml-2">{orderDetails.estimatedTime}h</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Prints:</span>
                <span className="ml-2">{orderDetails.numberOfPrints}</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-blue-700 font-medium">Description:</span>
              <p className="text-sm text-blue-600 mt-1">{orderDetails.description}</p>
            </div>
            {orderDetails.instructions && (
              <div className="mt-3">
                <span className="text-blue-700 font-medium">Instructions:</span>
                <p className="text-sm text-blue-600 mt-1">{orderDetails.instructions}</p>
              </div>
            )}
          </div>

          {/* Status Display */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Available Farmers ({availableFarmers.length})
              </h3>
              {offersSent && (
                <Badge variant="default" className="bg-green-600 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Sent to All
                </Badge>
              )}
            </div>

            {isSending ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">Sending offers to all available farmers...</p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few moments
                </p>
              </div>
            ) : offersSent ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {availableFarmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="p-3 rounded-lg border-2 border-green-200 bg-green-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{farmer.name}</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {farmer.address || farmer.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-500 text-sm">
                          <span>⭐</span>
                          <span>{(farmer.rating || 0).toFixed(1)}</span>
                        </div>
                        {farmer.distance && (
                          <p className="text-xs text-gray-500">{farmer.distance.toFixed(1)} km</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {availableFarmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="p-3 rounded-lg border-2 border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{farmer.name}</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {farmer.address || farmer.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-500 text-sm">
                          <span>⭐</span>
                          <span>{(farmer.rating || 0).toFixed(1)}</span>
                        </div>
                        {farmer.distance && (
                          <p className="text-xs text-gray-500">{farmer.distance.toFixed(1)} km</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {offersSent ? (
              <Button
                onClick={onClose}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Close
              </Button>
            ) : isSending ? (
              <Button
                disabled
                className="flex-1 bg-blue-600 text-white"
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Offers...
              </Button>
            ) : (
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Info Message */}
          <div className="text-xs text-center text-gray-500 bg-gray-50 p-3 rounded">
            {isSending ? (
              <>⏳ Offers are being sent automatically to all available farmers...</>
            ) : offersSent ? (
              <>✅ Offers have been sent to all {availableFarmers.length} available farmers. They will receive notifications and can accept or decline.</>
            ) : (
              <>💡 Offers will be sent automatically to all available farmers when you confirm.</>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
