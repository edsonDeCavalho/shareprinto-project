'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, MapPin, User, Printer, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FarmerLocation } from '@/services/farmerService';
import { playOrderAcceptedSound } from '@/lib/sound';

interface FarmerAcceptancePopupProps {
  farmer: FarmerLocation;
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function FarmerAcceptancePopup({ 
  farmer, 
  orderId, 
  isOpen, 
  onClose, 
  onContinue 
}: FarmerAcceptancePopupProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Play success sound
      playOrderAcceptedSound().catch(error => {
        console.error('Error playing sound:', error);
      });

      // Show confetti animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  ease: "easeOut",
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
                }}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-2 border-green-500 shadow-2xl">
            <CardContent className="p-6">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="flex justify-center mb-4"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-center text-green-600 mb-2"
              >
                Offer Accepted! 🎉
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-gray-600 mb-6"
              >
                Your order has been accepted by a qualified farmer!
              </motion.p>

              {/* Farmer Details */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{farmer.name}</h3>
                    <p className="text-sm text-gray-600">Professional Farmer</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{farmer.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Location</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{farmer.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Distance</span>
                    <span className="text-sm font-medium">{farmer.distance.toFixed(1)} km away</span>
                  </div>

                  {farmer.printers && farmer.printers.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Printers</span>
                      <div className="flex items-center gap-1">
                        <Printer className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{farmer.printers.length} available</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Order Info */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Order ID</span>
                  <Badge variant="secondary" className="font-mono">
                    {orderId}
                  </Badge>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3"
              >
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={onContinue}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Continue to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
