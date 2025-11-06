'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FarmerService, FarmerLocation } from '@/services/farmerService';
import { useToast } from '@/hooks/use-toast';

export default function TestOrdersAlgorithmPage() {
  const [city, setCity] = useState('Paris');
  const [materialType, setMaterialType] = useState('PLA');
  const [buildVolume, setBuildVolume] = useState(1000000); // 100x100x100mm
  const [minRating, setMinRating] = useState(4.0);
  const [maxDistance, setMaxDistance] = useState(50);
  const [farmers, setFarmers] = useState<FarmerLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerLocation | null>(null);
  const { toast } = useToast();

  const cities = ['Paris', 'Lyon', 'Marseille', 'Nice', 'Nantes', 'Strasbourg'];
  const materials = ['PLA', 'ABS', 'PETG', 'TPU', 'Resin'];
  const buildVolumes = [
    { label: 'Small (100x100x100mm)', value: 1000000 },
    { label: 'Medium (200x200x200mm)', value: 8000000 },
    { label: 'Large (300x300x300mm)', value: 27000000 },
    { label: 'Extra Large (400x400x400mm)', value: 64000000 }
  ];

  const handleSearchFarmers = async () => {
    setLoading(true);
    try {
      const orderRequirements = {
        materialType,
        buildVolume,
        minRating,
        maxDistance
      };

      const results = await FarmerService.runFarmerSearchAlgorithm(city, orderRequirements);
      setFarmers(results);
      
      toast({
        title: "Search Complete",
        description: `Found ${results.length} available farmers in ${city}`,
      });
    } catch (error) {
      console.error('Error searching farmers:', error);
      toast({
        title: "Error",
        description: "Failed to search for farmers. Using mock data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedFarmer) {
      toast({
        title: "No Farmer Selected",
        description: "Please select a farmer first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const orderRequirements = {
        materialType,
        buildVolume,
        minRating,
        maxDistance
      };

      // Create a mock order ID for testing
      const mockOrderID = `TEST_${Date.now()}`;
      
      const result = await FarmerService.autoAssignFarmerToOrder(mockOrderID, city, orderRequirements);
      
      if (result.success) {
        toast({
          title: "Assignment Successful",
          description: result.message,
        });
      } else {
        toast({
          title: "Assignment Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error auto-assigning farmer:', error);
      toast({
        title: "Error",
        description: "Failed to auto-assign farmer to order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 Test Orders Algorithm
        </h1>
        <p className="text-gray-600">
          Test the farmer search and assignment algorithm in the Orders service
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Search Configuration</CardTitle>
            <CardDescription>
              Configure the search parameters for the farmer algorithm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* City Selection */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Material Type */}
            <div className="space-y-2">
              <Label htmlFor="material">Material Type</Label>
              <Select value={materialType} onValueChange={setMaterialType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Build Volume */}
            <div className="space-y-2">
              <Label htmlFor="buildVolume">Build Volume</Label>
              <Select value={buildVolume.toString()} onValueChange={(value) => setBuildVolume(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select build volume" />
                </SelectTrigger>
                <SelectContent>
                  {buildVolumes.map((bv) => (
                    <SelectItem key={bv.value} value={bv.value.toString()}>{bv.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Rating */}
            <div className="space-y-2">
              <Label htmlFor="minRating">Minimum Rating</Label>
              <Input
                id="minRating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
              />
            </div>

            {/* Max Distance */}
            <div className="space-y-2">
              <Label htmlFor="maxDistance">Maximum Distance (km)</Label>
              <Input
                id="maxDistance"
                type="number"
                min="1"
                max="1000"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSearchFarmers}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Searching...' : '🔍 Search Farmers'}
              </Button>
              <Button 
                onClick={handleAutoAssign}
                disabled={loading || !selectedFarmer}
                variant="outline"
                className="flex-1"
              >
                {loading ? 'Assigning...' : '🤖 Auto Assign'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Search Results</CardTitle>
            <CardDescription>
              Farmers found by the algorithm (sorted by match score)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {farmers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No farmers found. Click "Search Farmers" to start.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {farmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedFarmer?.id === farmer.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                    }`}
                    onClick={() => setSelectedFarmer(farmer)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{farmer.name}</h4>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Score: {farmer.matchScore?.toFixed(1) || 'N/A'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Rating:</span>
                        <span className="ml-1 font-medium">⭐ {farmer.rating}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Distance:</span>
                        <span className="ml-1 font-medium">{farmer.distance.toFixed(1)} km</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-1 font-medium ${farmer.available ? 'text-green-600' : 'text-red-600'}`}>
                          {farmer.available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Printers:</span>
                        <span className="ml-1 font-medium">{farmer.printers?.length || 0}</span>
                      </div>
                    </div>

                    {farmer.address && (
                      <p className="text-xs text-gray-500 mt-2">{farmer.address}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Algorithm Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🤖 Algorithm Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">1.</span>
              <span><strong>Filtering:</strong> Only available and online farmers</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">2.</span>
              <span><strong>Distance Calculation:</strong> Based on city coordinates with penalty for distance</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">3.</span>
              <span><strong>Match Score:</strong> Rating × 2 - Distance Penalty + Availability Bonus</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">4.</span>
              <span><strong>Requirements Filtering:</strong> Material type, build volume, rating, distance</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">5.</span>
              <span><strong>Sorting:</strong> By match score (highest first)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
