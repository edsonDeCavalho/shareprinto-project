'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Star, MapPin, Printer, Clock, CheckCircle } from 'lucide-react';
import { FarmerLocation } from '@/services/farmerService';

interface FarmerDetailsModalProps {
  farmer: FarmerLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (farmer: FarmerLocation) => void;
}

export function FarmerDetailsModal({ farmer, isOpen, onClose, onSelect }: FarmerDetailsModalProps) {
  if (!isOpen || !farmer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold text-gray-900">
            Farmer Details
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Farmer Info */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-600">
                {farmer.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{farmer.name}</h3>
            <div className="flex items-center justify-center gap-1 text-yellow-500 mt-1">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{farmer.rating}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Status</span>
            <Badge 
              variant={farmer.available ? "default" : "secondary"}
              className={farmer.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
            >
              {farmer.available ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Available
                </>
              ) : (
                'Busy'
              )}
            </Badge>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">{farmer.address}</p>
              <p className="text-xs text-gray-500">{farmer.distance.toFixed(1)} km away</p>
            </div>
          </div>

          {/* Printers */}
          {farmer.printers && farmer.printers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Available Printers ({farmer.printers.length})
              </h4>
              <div className="space-y-2">
                {farmer.printers.map((printer, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">{printer.name}</p>
                    <p className="text-xs text-blue-700">{printer.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Response Time */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Response Time</p>
              <p className="text-xs text-gray-500">Usually responds within 30 minutes</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => onSelect(farmer)}
              disabled={!farmer.available}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Select This Farmer
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>

          {!farmer.available && (
            <p className="text-xs text-gray-500 text-center">
              This farmer is currently busy. You can still select them, but they may take longer to respond.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
