const API_BASE_URL = '/api/auth';
const ORDERS_API_BASE_URL = '/api/orders';

export interface FarmerInfo {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  userType: string;
  online: boolean;
  score?: number;
  avatar?: string;
  // Location fields
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  // Printer information
  printers?: any[];
  available?: boolean;
}

export interface FarmerLocation {
  id: string;
  name: string;
  city: string;
  rating: number;
  distance: number;
  available: boolean;
  position: { x: number; y: number };
  // Real location data
  address?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  lat?: number;
  lng?: number;
  printers?: any[];
  matchScore?: number;
}

export class FarmerService {
  static async getFarmerById(farmerId: string): Promise<FarmerInfo | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${farmerId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Farmer not found
        }
        throw new Error(`Failed to fetch farmer data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        return null;
      }
      
      return result.user;
    } catch (error) {
      console.error('Error fetching farmer:', error);
      return null;
    }
  }

  static async getFarmerByPhone(phone: string): Promise<FarmerInfo | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${phone}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Farmer not found
        }
        throw new Error(`Failed to fetch farmer data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        return null;
      }
      
      return result.user;
    } catch (error) {
      console.error('Error fetching farmer:', error);
      return null;
    }
  }

  static async getAllFarmers(): Promise<FarmerInfo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/farmers`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch farmers: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        return [];
      }
      
      return result.farmers || [];
    } catch (error) {
      console.error('Error fetching all farmers:', error);
      return [];
    }
  }

  // Normalize city names for consistent matching
  static normalizeCityName(city: string): string {
    if (!city) return '';
    
    // Convert to lowercase and trim
    const normalized = city.toLowerCase().trim();
    
    // Handle common city name variations
    const cityMappings: Record<string, string> = {
      'paris': 'Paris',
      'lyon': 'Lyon',
      'marseille': 'Marseille',
      'nice': 'Nice',
      'nantes': 'Nantes',
      'strasbourg': 'Strasbourg',
      'toulouse': 'Toulouse',
      'lille': 'Lille',
      'bordeaux': 'Bordeaux',
      'rennes': 'Rennes'
    };
    
    return cityMappings[normalized] || city;
  }

  static async getFarmersByCity(city: string): Promise<FarmerLocation[]> {
    try {
      const normalizedCity = this.normalizeCityName(city);
      console.log(`🔍 Searching for farmers in city: "${city}" (normalized: "${normalizedCity}")`);
      
      // Use the new farmer hierarchy API via Next.js proxy
      const response = await fetch(`/api/user-status/available-farmers-by-city?city=${encodeURIComponent(normalizedCity)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch farmers by city: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.data?.farmers) {
        console.warn('No farmers found in hierarchy for city:', normalizedCity);
        return [];
      }
      
      // Transform the result to match our interface and filter by exact city match
      const cityCenter: Record<string, { lat: number; lng: number }> = {
        'Paris': { lat: 48.8566, lng: 2.3522 },
        'Lyon': { lat: 45.7640, lng: 4.8357 },
        'Marseille': { lat: 43.2965, lng: 5.3698 },
        'Nice': { lat: 43.7032, lng: 7.2662 },
        'Nantes': { lat: 47.2184, lng: -1.5536 },
        'Strasbourg': { lat: 48.5734, lng: 7.7521 }
      };

      const farmers = result.data.farmers
        .map((farmer: any) => {
          const id = farmer.userId || farmer.id;
          const name = farmer.fullName || farmer.username || farmer.name || 'Farmer';
          const farmerCity = farmer.city;
          const lat = typeof farmer.latitude === 'number' ? farmer.latitude : (typeof farmer.lat === 'number' ? farmer.lat : (cityCenter[farmerCity]?.lat));
          const lng = typeof farmer.longitude === 'number' ? farmer.longitude : (typeof farmer.lng === 'number' ? farmer.lng : (cityCenter[farmerCity]?.lng));

          return {
            id,
            name,
            city: farmerCity,
            rating: typeof farmer.rating === 'number' ? farmer.rating : 4.5,
            distance: typeof farmer.distance === 'number' ? farmer.distance : Math.random() * 10,
            available: Boolean(farmer.available),
            position: { x: 0, y: 0 },
            address: farmer.address,
            state: farmer.state,
            zipCode: farmer.zipCode,
            country: farmer.country || 'France',
            lat,
            lng,
            printers: farmer.printers || [],
            matchScore: typeof farmer.matchScore === 'number' ? farmer.matchScore : Math.random() * 100
          } as FarmerLocation;
        })
        .filter((farmer: FarmerLocation) => {
          // Strict city matching - only return farmers from the exact requested city
          const farmerCityNormalized = this.normalizeCityName(farmer.city || '');
          const matches = farmerCityNormalized === normalizedCity;
          if (!matches) {
            console.log(`🚫 Filtering out farmer ${farmer.name} from ${farmer.city} (requested: ${normalizedCity})`);
          }
          return matches;
        });

      console.log(`✅ Found ${farmers.length} farmers in ${normalizedCity}`);
      return farmers;
    } catch (error) {
      console.error('Error fetching farmers by city from hierarchy:', error);
      // Fallback to mock data for the specific city
      return this.getMockFarmersByCity(this.normalizeCityName(city));
    }
  }

  static async runFarmerSearchAlgorithm(city: string, orderRequirements?: any): Promise<FarmerLocation[]> {
    try {
      console.log(`🔍 Running farmer search algorithm for city: ${city}`);
      
      const response = await fetch(`${ORDERS_API_BASE_URL}/search/farmers/algorithm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: city,
          orderRequirements: orderRequirements
        }),
      });
      
      if (!response.ok) {
        console.warn(`⚠️ Orders API not available (${response.status}), using mock data for city: ${city}`);
        // Fallback to mock data if API is not available
        return this.getMockFarmersByCity(city);
      }
      
      const result = await response.json();
      
      if (result.success && result.farmers) {
        return result.farmers.map((farmer: any) => ({
          id: farmer.id,
          name: farmer.name,
          city: farmer.city,
          rating: farmer.rating,
          distance: farmer.distance,
          available: farmer.available,
          position: { 
            x: 20 + Math.random() * 60, 
            y: 20 + Math.random() * 60 
          },
          address: farmer.address,
          lat: farmer.lat,
          lng: farmer.lng,
          printers: farmer.printers,
          matchScore: farmer.matchScore
        }));
      }
      
      console.warn(`⚠️ No farmers found from API, using mock data for city: ${city}`);
      return this.getMockFarmersByCity(city);
      
    } catch (error) {
      console.error('❌ Error running farmer search algorithm:', error);
      console.log(`🔄 Falling back to mock data for city: ${city}`);
      // Fallback to mock data on error
      return this.getMockFarmersByCity(city);
    }
  }

  static async autoAssignFarmerToOrder(orderID: string, city: string, orderRequirements?: any): Promise<{ success: boolean; farmer?: FarmerLocation; message: string }> {
    try {
      const response = await fetch(`${ORDERS_API_BASE_URL}/${orderID}/auto-assign-farmer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: city,
          orderRequirements: orderRequirements
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to auto-assign farmer: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.farmer) {
        // Transform the farmer data
        const farmer: FarmerLocation = {
          id: result.farmer.id,
          name: result.farmer.name,
          city: result.farmer.city,
          rating: result.farmer.rating,
          distance: result.farmer.distance,
          available: result.farmer.available,
          position: { 
            x: 20 + Math.random() * 60, 
            y: 20 + Math.random() * 60 
          },
          address: result.farmer.address,
          lat: result.farmer.lat,
          lng: result.farmer.lng,
          printers: result.farmer.printers,
          matchScore: result.farmer.matchScore
        };
        
        return { success: true, farmer, message: result.message };
      }
      
      return { success: false, message: result.message };
    } catch (error) {
      console.error('Error auto-assigning farmer to order:', error);
      return { success: false, message: 'Failed to auto-assign farmer to order' };
    }
  }

  static async sendSequentialOffers(orderData: any, onOfferSent?: (farmer: FarmerLocation) => void, onOfferAccepted?: (farmer: FarmerLocation) => void, onOfferDeclined?: (farmer: FarmerLocation) => void, onNoFarmersAvailable?: () => void): Promise<{ success: boolean; farmer?: FarmerLocation; message: string }> {
    try {
      const city = orderData.locationData?.city || 'Paris';
      
      // Get all available farmers in the city
      const availableFarmers = await this.runFarmerSearchAlgorithm(city, {
        materialType: orderData.materialType,
        buildVolume: orderData.buildVolume,
        minRating: 4.0,
        maxDistance: 50
      });

      if (availableFarmers.length === 0) {
        onNoFarmersAvailable?.();
        return { 
          success: false, 
          message: 'No available farmers found in your area. We will notify you when someone becomes available.' 
        };
      }

      console.log(`🔍 Found ${availableFarmers.length} available farmers in ${city}`);

      // Send offers sequentially to each farmer
      for (let i = 0; i < availableFarmers.length; i++) {
        const farmer = availableFarmers[i];
        
        console.log(`📤 Sending offer to farmer ${i + 1}/${availableFarmers.length}: ${farmer.name}`);
        
        // Notify that we're sending an offer to this farmer
        onOfferSent?.(farmer);

        // Send the offer to this specific farmer
        const offerResult = await this.sendOfferToFarmer(farmer.id, orderData);
        
        if (offerResult.success) {
          console.log(`✅ Farmer ${farmer.name} accepted the offer!`);
          onOfferAccepted?.(farmer);
          return { 
            success: true, 
            farmer, 
            message: `Order assigned to ${farmer.name} successfully!` 
          };
        } else {
          console.log(`❌ Farmer ${farmer.name} declined or didn't respond`);
          onOfferDeclined?.(farmer);
          
          // Wait a bit before sending to the next farmer
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // If we get here, no farmer accepted
      console.log(`❌ No farmers accepted the offer after trying all ${availableFarmers.length} farmers`);
      return { 
        success: false, 
        message: 'No farmers accepted the offer. We will notify you when someone becomes available.' 
      };

    } catch (error) {
      console.error('Error sending sequential offers:', error);
      return { 
        success: false, 
        message: 'Failed to send offers to farmers' 
      };
    }
  }

  private static async sendOfferToFarmer(farmerId: string, orderData: any): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      // Import webSocketService
      // WebSocket service removed
      
      // Create a unique offer ID
      const offerId = `offer-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Set up a timeout for 30 seconds
      const timeout = setTimeout(() => {
        console.log(`⏰ Offer to farmer ${farmerId} timed out after 30 seconds`);
        resolve({ success: false, message: 'Offer timed out' });
      }, 30000); // 30 seconds

      // Listen for the farmer's response
      const handleOfferResponse = (data: any) => {
        if (data.offerId === offerId) {
          clearTimeout(timeout);
          // WebSocket functionality removed
          
          if (data.accepted) {
            resolve({ success: true, message: 'Offer accepted' });
          } else {
            resolve({ success: false, message: 'Offer declined' });
          }
        }
      };

      // WebSocket functionality removed
      // Simulate offer response for testing
      setTimeout(() => {
        resolve({ success: true, message: 'Offer accepted (simulated)' });
      }, 2000);
    });
  }

  // Mock data for testing when API is not available
  static getMockFarmersByCity(city: string): FarmerLocation[] {
    const normalizedCity = this.normalizeCityName(city);
    console.log(`🎭 Using mock data for city: "${city}" (normalized: "${normalizedCity}")`);
    
    const mockFarmers: Record<string, FarmerLocation[]> = {
      'Paris': [
        { 
          id: '1', 
          name: 'Jean Dupont', 
          city: 'Paris', 
          rating: 4.8, 
          distance: 2.1, 
          available: true, 
          position: { x: 20, y: 30 },
          address: '123 Rue de la Paix',
          state: 'Île-de-France',
          zipCode: '75001',
          country: 'France',
          lat: 48.8584,
          lng: 2.2945,
          printers: [{ name: 'Prusa i3 MK3S+', type: 'FDM' }],
          matchScore: 9.2
        },
        { 
          id: '2', 
          name: 'Marie Garcia', 
          city: 'Paris', 
          rating: 4.6, 
          distance: 3.5, 
          available: false, 
          position: { x: 70, y: 20 },
          address: '456 Avenue des Champs-Élysées',
          state: 'Île-de-France',
          zipCode: '75008',
          country: 'France',
          lat: 48.8606,
          lng: 2.3376,
          printers: [{ name: 'Anycubic Photon Mono X', type: 'SLA' }],
          matchScore: 7.8
        },
        { 
          id: '3', 
          name: 'David Chen', 
          city: 'Paris', 
          rating: 4.9, 
          distance: 1.8, 
          available: true, 
          position: { x: 80, y: 70 },
          address: '789 Boulevard Saint-Germain',
          state: 'Île-de-France',
          zipCode: '75006',
          country: 'France',
          lat: 48.8530,
          lng: 2.3499,
          printers: [{ name: 'Bambu Lab X1 Carbon', type: 'FDM' }],
          matchScore: 9.6
        },
        { 
          id: '4', 
          name: 'Sarah Johnson', 
          city: 'Paris', 
          rating: 4.7, 
          distance: 4.2, 
          available: true, 
          position: { x: 30, y: 80 },
          address: '321 Rue de Rivoli, Paris',
          lat: 48.8575,
          lng: 2.3594,
          printers: [{ name: 'Elegoo Saturn 2', type: 'SLA' }],
          matchScore: 8.9
        },
        { 
          id: '5', 
          name: 'Michael Brown', 
          city: 'Paris', 
          rating: 4.5, 
          distance: 5.1, 
          available: true, 
          position: { x: 60, y: 40 },
          address: '654 Place de la République, Paris',
          lat: 48.8722,
          lng: 2.3265,
          printers: [{ name: 'Ultimaker S5', type: 'FDM' }],
          matchScore: 8.3
        },
        // New test user: Sarah Farmer in Paris
        { 
          id: 'sarah-farmer-002', 
          name: 'Sarah Farmer', 
          city: 'Paris', 
          rating: 4.9, 
          distance: 1.2, 
          available: true, 
          position: { x: 45, y: 55 },
          address: '15 Rue du Faubourg Saint-Honoré, Paris',
          lat: 48.8698,
          lng: 2.3077,
          printers: [
            { name: 'Elegoo Mars 3 Pro', type: 'SLA', buildVolume: '143x89x175mm' },
            { name: 'Prusa i3 MK3S+', type: 'FDM', buildVolume: '250x210x210mm' }
          ],
          matchScore: 9.8
        }
      ],
      'Lyon': [
        { 
          id: '6', 
          name: 'Pierre Martin', 
          city: 'Lyon', 
          rating: 4.9, 
          distance: 0.8, 
          available: true, 
          position: { x: 25, y: 35 },
          address: '123 Place Bellecour, Lyon',
          lat: 45.7640,
          lng: 4.8357,
          printers: [{ name: 'Bambu Lab P1P', type: 'FDM' }],
          matchScore: 9.8
        },
        { 
          id: '7', 
          name: 'Sophie Dubois', 
          city: 'Lyon', 
          rating: 4.8, 
          distance: 1.2, 
          available: true, 
          position: { x: 75, y: 25 },
          address: '456 Rue de la République, Lyon',
          lat: 45.7630,
          lng: 4.8272,
          printers: [{ name: 'Creality Ender 3 S1 Pro', type: 'FDM' }],
          matchScore: 9.4
        }
      ],
      'Marseille': [
        { 
          id: '8', 
          name: 'Antoine Moreau', 
          city: 'Marseille', 
          rating: 4.8, 
          distance: 1.5, 
          available: true, 
          position: { x: 40, y: 45 },
          address: '123 Vieux-Port, Marseille',
          lat: 43.2965,
          lng: 5.3698,
          printers: [{ name: 'Creality CR-10 Smart', type: 'FDM' }],
          matchScore: 9.1
        }
      ]
    };

    return mockFarmers[normalizedCity] || [];
  }

  // Get farmers for a specific order based on order city
  static async getFarmersForOrder(orderCity: string): Promise<FarmerLocation[]> {
    console.log(`🎯 Getting farmers for order in city: ${orderCity}`);
    const farmers = await this.getFarmersByCity(orderCity);
    
    // Log the results for debugging
    console.log(`📊 Found ${farmers.length} farmers for order in ${orderCity}:`, 
      farmers.map(f => `${f.name} (${f.city})`));
    
    return farmers;
  }

  // Helper function to check if we should use mock data
  static shouldUseMockData(): boolean {
    return typeof window !== 'undefined' && window.location.hostname === 'localhost';
  }

  // Geocode a free-form address string to coordinates using Nominatim (OpenStreetMap)
  static async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      if (!address || address.trim() === '') {
        console.log('❌ Empty address provided');
        return null;
      }

      const params = new URLSearchParams({
        format: 'json',
        q: address,
        addressdetails: '1',
        limit: '1'
      });

      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
      console.log('🌐 Making geocoding request to:', url);

      const response = await fetch(url, {
        headers: {
          // Nominatim requires an identifying header; Referer will be set by the browser
          'Accept-Language': 'en'
        }
      });

      if (!response.ok) {
        console.warn('❌ Failed to geocode address:', response.status, response.statusText);
        return null;
      }

      const results: Array<{ lat: string; lon: string } & Record<string, any>> = await response.json();
      console.log('📊 Geocoding API response:', results.length, 'results');
      
      if (!Array.isArray(results) || results.length === 0) {
        console.log('❌ No results from geocoding API');
        return null;
      }

      const top = results[0];
      const lat = parseFloat(top.lat);
      const lng = parseFloat(top.lon);
      console.log('🎯 Parsed coordinates:', { lat, lng });
      
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        console.log('✅ Valid coordinates found');
        return { lat, lng };
      }
      console.log('❌ Invalid coordinates');
      return null;
    } catch (error) {
      console.error('❌ Error geocoding address:', error);
      return null;
    }
  }

  // Build an address from a FarmerInfo and geocode it to { lat, lng }
  static async geocodeFarmerAddress(farmer: FarmerInfo): Promise<{ lat: number; lng: number } | null> {
    if (!farmer) return null;

    // Build a comprehensive address string including zip code and country
    const parts = [
      farmer.address,
      farmer.city,
      farmer.state,
      farmer.zipCode,
      farmer.country
    ].filter(Boolean) as string[];

    const address = parts.join(', ');
    return this.getCoordinatesFromAddress(address);
  }

  // Build an address from a FarmerLocation and geocode it to { lat, lng }
  static async geocodeFarmerLocationAddress(farmer: FarmerLocation): Promise<{ lat: number; lng: number } | null> {
    if (!farmer) return null;

    // Build a comprehensive address string for FarmerLocation including zip code and country
    const parts = [
      farmer.address,
      farmer.city,
      farmer.state,
      farmer.zipCode,
      farmer.country
    ].filter(Boolean) as string[];

    const address = parts.join(', ');
    console.log('🏠 Geocoding address for', farmer.name, ':', address);
    
    const result = await this.getCoordinatesFromAddress(address);
    console.log('🗺️ Geocoding result for', farmer.name, ':', result);
    
    return result;
  }
}
