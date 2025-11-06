'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Users, CheckCircle, X, Printer, Star } from 'lucide-react';
import { FarmerService, FarmerLocation } from '@/services/farmerService';
import { Map } from '@/components/map';
import { FarmerDetailsModal } from '@/components/farmer-details-modal';
import { useUser } from '@/contexts/UserContext';
import { OrderService } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { FarmerAcceptancePopup } from '@/components/farmer-acceptance-popup';

interface FarmerSearchAnimationProps {
  orderData: any;
  onSearchComplete: (farmer: FarmerLocation | null) => void;
}

export function FarmerSearchAnimation({ orderData, onSearchComplete }: FarmerSearchAnimationProps) {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [searching, setSearching] = useState(true);
  const [foundFarmer, setFoundFarmer] = useState<FarmerLocation | null>(null);
  const [farmerLocations, setFarmerLocations] = useState<FarmerLocation[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Default to Paris
  const [mapZoom, setMapZoom] = useState(12);
  const [showFarmerModal, setShowFarmerModal] = useState(false);
  const [selectedFarmerForModal, setSelectedFarmerForModal] = useState<FarmerLocation | null>(null);
  const [currentFarmerIndex, setCurrentFarmerIndex] = useState(0);
  const [sendingOffers, setSendingOffers] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [showAcceptancePopup, setShowAcceptancePopup] = useState(false);
  const [acceptedFarmerData, setAcceptedFarmerData] = useState<FarmerLocation | null>(null);

  const steps = [
    'Initializing search algorithm...',
    'Scanning local farmers in your area...',
    'Checking availability and ratings...',
    'Calculating optimal matches...',
    'Sending offers to available farmers...'
  ];

  // Fetch real farmers from the same city
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const city = orderData.locationData?.city || 'Paris';
        
        // Update map center based on city
        const cityCoordinates: Record<string, { lat: number; lng: number }> = {
          'Paris': { lat: 48.8566, lng: 2.3522 },
          'Lyon': { lat: 45.7640, lng: 4.8357 },
          'Marseille': { lat: 43.2965, lng: 5.3698 },
          'Nice': { lat: 43.7032, lng: 7.2662 },
          'Nantes': { lat: 47.2184, lng: -1.5536 },
          'Strasbourg': { lat: 48.5734, lng: 7.7521 }
        };

        if (cityCoordinates[city]) {
          setMapCenter(cityCoordinates[city]);
        }

        // Always fetch real online+available farmers from dispatcher hierarchy API
        const farmers = await FarmerService.getFarmersByCity(city);
        setFarmerLocations(farmers || []);
      } catch (error) {
        console.error('Error fetching farmers:', error);
        setFarmerLocations([]);
      }
    };

    fetchFarmers();
  }, [orderData.locationData?.city, orderData.materialType, orderData.buildVolume]);

  const startSequentialOffers = React.useCallback(async () => {
    setSendingOffers(true);
    
    try {
      const result = await FarmerService.sendSequentialOffers(
        orderData,
        // onOfferSent callback
        (farmer) => {
          console.log(`📤 Sending offer to: ${farmer.name}`);
          setSelectedFarmerId(farmer.id);
          setCurrentFarmerIndex(prev => prev + 1);
        },
        // onOfferAccepted callback
        (farmer) => {
          console.log(`✅ Offer accepted by: ${farmer.name}`);
          setFoundFarmer(farmer);
          setSelectedFarmerId(farmer.id);
          setSendingOffers(false);
        },
        // onOfferDeclined callback
        (farmer) => {
          console.log(`❌ Offer declined by: ${farmer.name}`);
          setSelectedFarmerId(null);
        },
        // onNoFarmersAvailable callback
        () => {
          console.log('❌ No farmers available');
          setSendingOffers(false);
          onSearchComplete(null);
        }
      );
    } catch (error) {
      console.error('Error sending sequential offers:', error);
      setSendingOffers(false);
      onSearchComplete(null);
    }
  }, [orderData, onSearchComplete]);

  useEffect(() => {
    const searchInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(searchInterval);
          setSearching(false);
          
          // Start sending sequential offers
          startSequentialOffers();
          return prev;
        }
      });
    }, 2000);

    return () => clearInterval(searchInterval);
  }, [steps.length, farmerLocations, startSequentialOffers]);

  // WebSocket functionality removed - no longer needed for order creation
  // The order creation process now works without real-time farmer matching


  const handleFarmerClick = (farmer: FarmerLocation) => {
    setSelectedFarmerId(farmer.id);
    if (farmer.lat && farmer.lng) {
      setMapCenter({ lat: farmer.lat, lng: farmer.lng });
      setMapZoom(15);
    }
  };

  const handleFarmerDoubleClick = (farmer: FarmerLocation) => {
    setSelectedFarmerForModal(farmer);
    setShowFarmerModal(true);
  };

  const handleFarmerSelect = (farmer: FarmerLocation) => {
    setFoundFarmer(farmer);
    setSelectedFarmerId(farmer.id);
    setShowFarmerModal(false);
  };

  const handleContinue = () => {
    onSearchComplete(foundFarmer);
  };

  const handleNoMatch = () => {
    onSearchComplete(null);
  };

  const handleAcceptancePopupClose = () => {
    setShowAcceptancePopup(false);
  };

  const handleAcceptancePopupContinue = () => {
    setShowAcceptancePopup(false);
    onSearchComplete(foundFarmer);
  };

  // Convert farmer locations to map format
  const mapFarmers = farmerLocations
    .filter(farmer => farmer.lat && farmer.lng)
    .map(farmer => ({
      id: farmer.id,
      name: farmer.name,
      lat: farmer.lat!,
      lng: farmer.lng!,
      available: farmer.available
    }));

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-6xl mx-4 bg-white max-h-[90vh] overflow-hidden">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-2xl font-bold text-green-800">
              🔍 Searching for Farmers
            </CardTitle>
            <p className="text-green-700">
              Finding the perfect farmer for your project in {orderData.locationData?.city || 'your city'}
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {/* Search Progress */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                <span className="text-lg font-medium text-gray-700">
                  {steps[currentStep]}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Map and Farmer List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interactive Map */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">📍 Farmers in Your Area</h3>
                <div className="h-80 rounded-lg overflow-hidden border-2 border-green-200">
                  <Map 
                    farmers={mapFarmers}
                    center={mapCenter}
                    zoom={mapZoom}
                    selectedFarmerId={selectedFarmerId}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  💡 Double-click on a farmer marker to see detailed information
                </p>
              </div>

              {/* Farmer List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">👨‍🌾 Available Farmers</h3>
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {farmerLocations.map((farmer) => (
                    <div
                      key={farmer.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedFarmerId === farmer.id
                          ? 'border-green-500 bg-green-50'
                          : farmer.available
                          ? 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                      onClick={() => handleFarmerClick(farmer)}
                      onDoubleClick={() => handleFarmerDoubleClick(farmer)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            farmer.available ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <h4 className="font-semibold text-gray-900">{farmer.name}</h4>
                            <p className="text-sm text-gray-600">{farmer.address}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{farmer.rating}</span>
                          </div>
                          <p className="text-xs text-gray-500">{farmer.distance.toFixed(1)} km away</p>
                        </div>
                      </div>
                      
                      {farmer.printers && farmer.printers.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <Printer className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {farmer.printers.length} printer{farmer.printers.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            {!searching && (
              <div className="mt-6">
                {sendingOffers ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <div>
                        <h3 className="font-semibold text-blue-800">Sending Offers to Farmers</h3>
                        <p className="text-blue-700">
                          Sending offers to available farmers in {orderData.locationData?.city || 'your city'}...
                        </p>
                        {selectedFarmerId && (
                          <p className="text-sm text-blue-600 mt-1">
                            Currently offering to: {farmerLocations.find(f => f.id === selectedFarmerId)?.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-blue-700">
                        <span>Progress: {currentFarmerIndex} / {farmerLocations.length}</span>
                        <span>⏱️ 30s per farmer</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(currentFarmerIndex / Math.max(farmerLocations.length, 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (foundFarmer || offerAccepted) ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-800">
                          {offerAccepted ? "Offer Accepted! 🎉" : "Perfect Match Found!"}
                        </h3>
                        <p className="text-green-700">
                          {foundFarmer ? 
                            `${foundFarmer.name} accepted your offer and is ready to print your project.` :
                            "A farmer has accepted your offer! Your order is now being processed."
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      {foundFarmer ? (
                        <>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              ⭐ {foundFarmer.rating} Rating
                            </Badge>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              📍 {foundFarmer.distance.toFixed(1)} km away
                            </Badge>
                          </div>
                          <div className="text-sm text-green-600 mt-1">
                            {foundFarmer.printers?.length || 0} printers available
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            ✅ Offer Accepted
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            🎯 Order Assigned
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex gap-3">
                      <Button 
                        onClick={handleContinue}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {foundFarmer ? `Continue with ${foundFarmer.name}` : "Continue to Dashboard"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleNoMatch}
                      >
                        Look for other options
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <X className="w-6 h-6 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-yellow-800">No Farmers Available</h3>
                        <p className="text-yellow-700">
                          No farmers accepted the offer. We'll notify you when someone becomes available.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        onClick={handleNoMatch}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Continue Anyway
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Farmer Details Modal */}
      <FarmerDetailsModal
        farmer={selectedFarmerForModal}
        isOpen={showFarmerModal}
        onClose={() => setShowFarmerModal(false)}
        onSelect={handleFarmerSelect}
      />

      {/* Farmer Acceptance Popup */}
      {acceptedFarmerData && (
        <FarmerAcceptancePopup
          farmer={acceptedFarmerData}
          orderId={orderData.orderID || orderData.orderId || 'unknown'}
          isOpen={showAcceptancePopup}
          onClose={handleAcceptancePopupClose}
          onContinue={handleAcceptancePopupContinue}
        />
      )}
    </>
  );
}
