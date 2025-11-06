'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Info } from 'lucide-react';
import { FarmerService, type FarmerLocation } from '@/services/farmerService';
import { Map } from '@/components/map';
import { CreatorOfferPopup } from '@/components/creator-offer-popup';
import { Suspense } from 'react';

function AvailableFarmersContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get('city') || 'Paris';
  const orderId = searchParams.get('orderId');
  const orderDescription = searchParams.get('description');
  const materialType = searchParams.get('materialType');
  const typeOfPrinting = searchParams.get('typeOfPrinting');
  const estimatedTime = searchParams.get('estimatedTime');
  const cost = searchParams.get('cost');
  const numberOfPrints = searchParams.get('numberOfPrints');
  const instructions = searchParams.get('instructions');
  const creatorName = searchParams.get('creatorName');
  
  const [city] = React.useState(initialCity);
  const [loading, setLoading] = React.useState(false);
  const [farmers, setFarmers] = React.useState<FarmerLocation[]>([]);
  const [geocodedFarmers, setGeocodedFarmers] = React.useState<Array<FarmerLocation & { lat: number; lng: number }>>([]);
  const [geocoding, setGeocoding] = React.useState(false);
  const [offersSent, setOffersSent] = React.useState(false);
  const [showOfferPopup, setShowOfferPopup] = React.useState(false);

  // DEPRECATED: Redirect to sequential offers instead of parallel dispatch
  const sendOffersToAllFarmers = React.useCallback(async (farmerIds: string[]) => {
    if (!orderId || offersSent) {
      console.log('🚫 Skipping offer sending - no orderId or already sent');
      return;
    }

    console.log('🚫 DEPRECATED: Parallel dispatch blocked - redirecting to sequential system');
    console.log(`🚫 Would have sent to ${farmerIds.length} farmers, redirecting to sequential instead`);
    
    // Redirect to sequential offers page instead of sending parallel offers
    const queryParams = new URLSearchParams({
      city: city,
      orderId: orderId,
      description: encodeURIComponent(orderDescription || '3D Printing Order'),
      materialType: materialType || 'PLA',
      typeOfPrinting: typeOfPrinting || 'FDM',
      estimatedTime: estimatedTime || '120',
      cost: cost || '50',
      numberOfPrints: numberOfPrints || '1',
      instructions: encodeURIComponent(instructions || ''),
      creatorName: encodeURIComponent(creatorName || 'Creator')
    });

    console.log('🎯 Redirecting to sequential offers page');
    window.location.href = `/sequential-offers?${queryParams.toString()}`;
    
    setOffersSent(true); // Prevent multiple redirects
  }, [orderId, orderDescription, materialType, typeOfPrinting, estimatedTime, cost, city, numberOfPrints, instructions, creatorName, offersSent]);

  const loadFarmers = React.useCallback(async (targetCity: string) => {
    setLoading(true);
    try {
      const results = await FarmerService.getFarmersByCity(targetCity);
      setFarmers(results || []);
      
      // Geocode farmer addresses for map display
      setGeocoding(true);
      const geocodedResults = [];
      
      console.log('🔍 Starting geocoding for', results?.length || 0, 'farmers');
      console.log('🔍 Farmer IDs that will be used for offers:', results?.map(f => ({ id: f.id, name: f.name })));
      
      for (let i = 0; i < (results || []).length; i++) {
        const farmer = results[i];
        console.log('📍 Processing farmer:', farmer.name, 'ID:', farmer.id, 'Address:', farmer.address);
        
        // Add delay between requests to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (farmer.address) {
          // Use the comprehensive geocoding function that includes zip code and country
          const coords = await FarmerService.geocodeFarmerLocationAddress(farmer);
          console.log('🌍 Geocoding result for', farmer.name, ':', coords);
          
          if (coords) {
            geocodedResults.push({
              ...farmer,
              lat: coords.lat,
              lng: coords.lng
            });
            console.log('✅ Added to geocoded results:', farmer.name);
          } else if (farmer.lat && farmer.lng) {
            // Fallback to existing coordinates if geocoding fails
            geocodedResults.push({
              ...farmer,
              lat: farmer.lat,
              lng: farmer.lng
            });
            console.log('📍 Using existing coordinates as fallback for:', farmer.name);
          } else {
            console.log('❌ No coordinates found for:', farmer.name);
          }
        } else if (farmer.lat && farmer.lng) {
          // Use existing coordinates if available
          geocodedResults.push({
            ...farmer,
            lat: farmer.lat,
            lng: farmer.lng
          });
          console.log('📍 Using existing coordinates for:', farmer.name);
        } else {
          console.log('⚠️ No address or coordinates for:', farmer.name);
        }
      }
      
      console.log('🎯 Final geocoded results:', geocodedResults.length, 'farmers');
      setGeocodedFarmers(geocodedResults);
      
      // Show offer popup if this is an order-related visit and farmers are available
      if (orderId && results && results.length > 0 && !offersSent) {
        console.log('🎯 Order detected with available farmers, showing offer popup');
        // Delay showing popup to ensure UI is ready
        setTimeout(() => {
          setShowOfferPopup(true);
        }, 1000);
      }
    } catch (e) {
      console.warn('Failed to load farmers', e);
      setFarmers([]);
      setGeocodedFarmers([]);
    } finally {
      setLoading(false);
      setGeocoding(false);
    }
  }, [orderId, offersSent]);

  React.useEffect(() => {
    loadFarmers(initialCity);
  }, [initialCity, loadFarmers]);


  // Calculate map center and zoom based on first farmer or default to city center
  const getMapCenter = () => {
    if (geocodedFarmers.length > 0) {
      // Zoom in on the first farmer
      const firstFarmer = geocodedFarmers[0];
      console.log(`🎯 Map focusing on first farmer: ${firstFarmer.name} at ${firstFarmer.lat}, ${firstFarmer.lng}`);
      return { lat: firstFarmer.lat, lng: firstFarmer.lng };
    }
    
    // Default city centers
    const cityCenters: Record<string, { lat: number; lng: number }> = {
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Lyon': { lat: 45.7640, lng: 4.8357 },
      'Marseille': { lat: 43.2965, lng: 5.3698 },
      'Nice': { lat: 43.7032, lng: 7.2662 },
      'Nantes': { lat: 47.2184, lng: -1.5536 },
      'Strasbourg': { lat: 48.5734, lng: 7.7521 }
    };
    
    return cityCenters[city] || cityCenters['Paris'];
  };

  // Get zoom level - closer zoom when focusing on first farmer
  const getMapZoom = () => {
    if (geocodedFarmers.length > 0) {
      // Zoom in closer on the first farmer
      return 15;
    }
    // Default zoom for city view
    return 12;
  };

  // Create order details for the popup
  const orderDetails = React.useMemo(() => ({
    orderId: orderId || '',
    description: orderDescription || '3D Printing Order',
    materialType: materialType || 'PLA',
    typeOfPrinting: typeOfPrinting || 'FDM',
    estimatedTime: parseInt(estimatedTime || '120'),
    cost: parseFloat(cost || '50'),
    city: city,
    creatorName: creatorName || 'Creator',
    numberOfPrints: parseInt(numberOfPrints || '1'),
    instructions: instructions || ''
  }), [orderId, orderDescription, materialType, typeOfPrinting, estimatedTime, cost, city, creatorName, numberOfPrints, instructions]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Deprecation Warning */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              🚫 Parallel Dispatch Blocked - Sequential System Active
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>This page now redirects to sequential dispatch. Orders are sent to farmers one by one with 20-second timeouts instead of all at once.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Available Farmers</h1>
        <p className="text-muted-foreground">
          Online and available farmers in <span className="font-semibold text-primary">{city}</span>
        </p>
        {orderId && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              📤 <span className="font-semibold">Order {orderId}</span> - Sending offers to all available farmers
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farmers List */}
        <Card>
        <CardHeader>
          <CardTitle>
            {farmers.length} farmer{farmers.length === 1 ? '' : 's'} found in {city}
            {geocoding && <span className="text-sm text-muted-foreground ml-2">(Geocoding addresses...)</span>}
          </CardTitle>
        </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {farmers.map((farmer) => (
                <div key={farmer.id} className="p-4 rounded-lg border hover:bg-secondary transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full mt-1">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{farmer.name}</p>
                        <div className="flex items-center gap-1 text-yellow-500 text-sm">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{(farmer.rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {farmer.address && (
                          <span>
                            {farmer.address}
                            {farmer.zipCode && `, ${farmer.zipCode}`}
                            {farmer.city && `, ${farmer.city}`}
                            {farmer.country && `, ${farmer.country}`}
                          </span>
                        )}
                        {!farmer.address && farmer.city}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          <Info className="mr-2 h-4 w-4" /> Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!loading && farmers.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No available farmers found in <span className="font-semibold">{city}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Try searching for a different city or check back later.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle>Farmer Locations in {city}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <Map
                farmers={geocodedFarmers}
                center={getMapCenter()}
                zoom={getMapZoom()}
              />
            </div>
            {geocodedFarmers.length === 0 && farmers.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No address coordinates available for map display.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Creator Offer Popup */}
      <CreatorOfferPopup
        isOpen={showOfferPopup}
        availableFarmers={farmers}
        orderDetails={orderDetails}
        onSendOffers={sendOffersToAllFarmers}
        onClose={() => setShowOfferPopup(false)}
      />
    </div>
  );
}

export default function AvailableFarmersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AvailableFarmersContent />
    </Suspense>
  );
}


