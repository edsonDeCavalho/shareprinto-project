'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FarmerSearchAnimation } from '@/components/farmer-search-animation';
import { useRouter } from 'next/navigation';

export default function TestFarmerSearchPage() {
  const [showAnimation, setShowAnimation] = useState(false);
  const [orderData, setOrderData] = useState({
    locationData: {
      city: 'Paris'
    }
  });
  const router = useRouter();

  const handleStartSearch = () => {
    setShowAnimation(true);
  };

  const handleSearchComplete = (farmer: any) => {
    console.log('Search completed with farmer:', farmer);
    setShowAnimation(false);
    
    if (farmer) {
      alert(`Selected farmer: ${farmer.name} from ${farmer.city}`);
    } else {
      alert('No farmer selected');
    }
  };

  const handleCityChange = (city: string) => {
    setOrderData({
      locationData: {
        city: city
      }
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 Test Farmer Search Animation
        </h1>
        <p className="text-gray-600">
          Test the interactive farmer search animation with real map and farmer data
        </p>
      </div>

      {!showAnimation ? (
        <div className="space-y-6">
          {/* City Selection */}
          <Card>
            <CardHeader>
              <CardTitle>📍 Select City</CardTitle>
              <CardDescription>
                Choose a city to test the farmer search animation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Paris', 'Lyon', 'Marseille', 'Nice', 'Nantes', 'Strasbourg'].map((city) => (
                  <Button
                    key={city}
                    variant={orderData.locationData.city === city ? "default" : "outline"}
                    onClick={() => handleCityChange(city)}
                    className="justify-start"
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Settings */}
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Current Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Selected City:</span>
                  <span className="text-sm text-gray-600">{orderData.locationData.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data Source:</span>
                  <span className="text-sm text-gray-600">
                    {typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                      ? 'Mock Data (Development)' 
                      : 'Real API Data'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>📋 How to Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  <span>Click "Start Farmer Search" to begin the animation</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <span>Watch the search progress and map interaction</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <span>Click on farmers in the list to select them on the map</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">4.</span>
                  <span>Double-click on farmers to see detailed information</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">5.</span>
                  <span>Select a farmer or continue without one</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="flex gap-4">
            <Button 
              onClick={handleStartSearch}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              🚀 Start Farmer Search
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/creator/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <FarmerSearchAnimation
          orderData={orderData}
          onSearchComplete={handleSearchComplete}
        />
      )}
    </div>
  );
}
