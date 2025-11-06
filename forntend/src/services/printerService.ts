// Printer service for managing farmer printers

export interface FarmerPrinter {
  id: string;
  farmerId: string;
  brand: string;
  model: string;
  buildVolume: string;
  status: 'online' | 'offline' | 'maintenance' | 'printing';
  currentJob?: string;
  progressPercentage?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePrinterRequest {
  farmerId: string;
  brand: string;
  model: string;
  buildVolume: string;
  notes?: string;
}

const API_BASE_URL = '/api/auth';

// Mock printer data for test accounts
const mockPrinters: Record<string, FarmerPrinter[]> = {
  'tames-farmer-001': [
    {
      id: 'printer-001',
      farmerId: 'tames-farmer-001',
      brand: 'Creality',
      model: 'Ender 3 V3 SE',
      buildVolume: '220x220x250mm',
      status: 'online',
      notes: 'High-quality FDM printer for large prints',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
    },
    {
      id: 'printer-002',
      farmerId: 'tames-farmer-001',
      brand: 'Anycubic',
      model: 'Photon Mono X',
      buildVolume: '192x120x245mm',
      status: 'online',
      notes: 'Resin printer for detailed miniatures',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date(),
    },
    {
      id: 'printer-003',
      farmerId: 'tames-farmer-001',
      brand: 'Bambu Lab',
      model: 'X1 Carbon',
      buildVolume: '256x256x256mm',
      status: 'printing',
      currentJob: 'Order #12345',
      progressPercentage: 65,
      notes: 'Premium multi-material printer',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date(),
    }
  ],
  'sarah-farmer-002': [
    {
      id: 'printer-004',
      farmerId: 'sarah-farmer-002',
      brand: 'Elegoo',
      model: 'Mars 3 Pro',
      buildVolume: '143x89x175mm',
      status: 'online',
      notes: 'Professional resin printing',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date(),
    },
    {
      id: 'printer-005',
      farmerId: 'sarah-farmer-002',
      brand: 'Prusa',
      model: 'i3 MK3S+',
      buildVolume: '250x210x210mm',
      status: 'maintenance',
      notes: 'Reliable FDM workhorse',
      createdAt: new Date('2023-12-05'),
      updatedAt: new Date(),
    }
  ]
};

// Helper function to check if a user is a test account
function isTestAccount(phone: string): boolean {
  const testPhones = ['+1234567890', '+1234567892']; // Tames and Sarah's test phones
  return testPhones.includes(phone);
}

// Helper function to get test account ID from phone
function getTestAccountId(phone: string): string | null {
  const phoneToIdMap: Record<string, string> = {
    '+1234567890': 'tames-farmer-001',
    '+1234567892': 'sarah-farmer-002'
  };
  return phoneToIdMap[phone] || null;
}

export class PrinterService {
  static async getFarmerPrinters(phone: string): Promise<FarmerPrinter[]> {
    // Check if this is a test account
    if (isTestAccount(phone)) {
      const testAccountId = getTestAccountId(phone);
      if (testAccountId && mockPrinters[testAccountId]) {
        console.log(`Using mock printers for test account: ${testAccountId}`);
        return mockPrinters[testAccountId];
      }
      // Return empty array for test accounts without mock data
      return [];
    }

    // Original API call for real users
    const response = await fetch(`${API_BASE_URL}/user/${phone}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch user data');
    }
    
    // Convert database printer format to frontend format
    const dbPrinters = result.user.printers || [];
    return dbPrinters.map((dbPrinter: any) => ({
      id: dbPrinter.printerId,
      farmerId: phone,
      brand: dbPrinter.printerBrand,
      model: dbPrinter.printerModel,
      buildVolume: dbPrinter.buildVolume,
      status: dbPrinter.online ? 'online' : 'offline',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }
  
  static async createPrinter(printerData: CreatePrinterRequest): Promise<FarmerPrinter> {
    // For test accounts, add to mock data
    if (isTestAccount(printerData.farmerId)) {
      const newPrinter: FarmerPrinter = {
        id: `printer-${Date.now()}`,
        farmerId: printerData.farmerId,
        brand: printerData.brand,
        model: printerData.model,
        buildVolume: printerData.buildVolume,
        status: 'online',
        notes: printerData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const testAccountId = getTestAccountId(printerData.farmerId);
      if (testAccountId) {
        if (!mockPrinters[testAccountId]) {
          mockPrinters[testAccountId] = [];
        }
        mockPrinters[testAccountId].push(newPrinter);
      }
      
      return newPrinter;
    }

    // Original API call for real users
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(printerData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create printer: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  static async updatePrinter(printerId: string, updates: Partial<FarmerPrinter>): Promise<FarmerPrinter> {
    // For test accounts, update mock data
    for (const accountId in mockPrinters) {
      const printerIndex = mockPrinters[accountId].findIndex(p => p.id === printerId);
      if (printerIndex !== -1) {
        mockPrinters[accountId][printerIndex] = {
          ...mockPrinters[accountId][printerIndex],
          ...updates,
          updatedAt: new Date()
        };
        return mockPrinters[accountId][printerIndex];
      }
    }

    // Original API call for real users
    const response = await fetch(`${API_BASE_URL}/${printerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update printer: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  static async deletePrinter(printerId: string): Promise<void> {
    // For test accounts, remove from mock data
    for (const accountId in mockPrinters) {
      const printerIndex = mockPrinters[accountId].findIndex(p => p.id === printerId);
      if (printerIndex !== -1) {
        mockPrinters[accountId].splice(printerIndex, 1);
        return;
      }
    }

    // Original API call for real users
    const response = await fetch(`${API_BASE_URL}/${printerId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete printer: ${response.statusText}`);
    }
  }
  
  static async updatePrinterStatus(printerId: string, status: FarmerPrinter['status'], currentJob?: string, progressPercentage?: number): Promise<FarmerPrinter> {
    return this.updatePrinter(printerId, {
      status,
      currentJob,
      progressPercentage,
    });
  }
}
