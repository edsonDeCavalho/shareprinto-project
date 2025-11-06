// Order service for API calls to the backend
import { STLPreviewService } from './stl-preview-service';

export interface CreateOrderRequest {
  userCreatorID?: string;
  locationData?: {
    latitude?: number;
    longitude?: number;
    city?: string;
  };
  multiplePrints?: boolean;
  numberOfPrints?: number;
  listOfFilesToPrint?: Array<{
    fileName?: string;
    size?: number;
    fileId?: string;
    previewImage?: string;
  }>;
  materialType?: string;
  typeOfPrinting?: string;
  description?: string;
  instructions?: string;
  estimatedTime?: number;
  typeOfDelivery?: 'mail' | 'in_person' | 'farmer_delivery';
  cost?: number;
  recuperationCode?: number; // 4-digit code
}

export interface Order {
  orderID: string;
  createdAt: Date;
  userCreatorID?: string;
  locationData?: {
    latitude?: number;
    longitude?: number;
    city?: string;
  };
  multiplePrints?: boolean;
  numberOfPrints?: number;
  listOfFilesToPrint?: Array<{
    fileName?: string;
    size?: number;
    fileId?: string;
    previewImage?: string;
  }>;
  status?: 'finished' | 'in_progress' | 'accepted' | 'paused' | 'paused_due_to_problem_printing';
  progressPercentage?: number;
  materialType?: string;
  typeOfPrinting?: string;
  description?: string;
  instructions?: string;
  chatID?: string;
  estimatedTime?: number;
  finishedTime?: Date;
  typeOfDelivery?: 'mail' | 'in_person' | 'farmer_delivery';
  cost?: number;
  recuperationCode?: number; // 4-digit code
  assignedFarmerID?: string;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

const API_BASE_URL = 'http://localhost:3004/api/order-management';

// Mock order data for test accounts - initial data
const initialMockOrders: Order[] = [
  {
    orderID: 'TEST-ROBOT-ARM-001',
    createdAt: new Date('2024-12-15T10:00:00Z'),
    userCreatorID: 'john-creator-001',
    locationData: {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris'
    },
    multiplePrints: false,
    numberOfPrints: 1,
    listOfFilesToPrint: [
      {
        fileName: 'robot_arm.stl',
        size: 2048576,
        fileId: 'robot_arm_stl_2048576_1734278400000',
        previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRGNDZFNSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Um9ib3QgQXJtPC90ZXh0Pjwvc3ZnPg=='
      }
    ],
    status: 'accepted',
    progressPercentage: 0,
    materialType: 'PLA',
    typeOfPrinting: 'FDM',
    description: 'Prototype Robot Arm',
    instructions: 'High precision required for robotics project',
    estimatedTime: 180,
    typeOfDelivery: 'in_person',
    cost: 45.00,
    recuperationCode: 1234
  },
  {
    orderID: 'TEST-MINIATURES-002',
    createdAt: new Date('2024-12-14T14:30:00Z'),
    userCreatorID: 'john-creator-001',
    locationData: {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris'
    },
    multiplePrints: true,
    numberOfPrints: 3,
    listOfFilesToPrint: [
      {
        fileName: 'miniature_figures.stl',
        size: 1048576,
        fileId: 'miniature_figures_stl_1048576_1734192000000',
        previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzEwQjk4MSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TWluaWF0dXJlczwvdGV4dD48L3N2Zz4='
      }
    ],
    status: 'in_progress',
    progressPercentage: 65,
    materialType: 'Resin',
    typeOfPrinting: 'SLA',
    description: 'Gaming Miniatures Set',
    instructions: 'High detail miniatures for tabletop gaming',
    estimatedTime: 240,
    typeOfDelivery: 'mail',
    cost: 75.00,
    recuperationCode: 5678,
    assignedFarmerID: 'tames-farmer-001',
    acceptedAt: new Date('2024-12-14T15:00:00Z'),
    startedAt: new Date('2024-12-14T16:00:00Z')
  },
  {
    orderID: 'TEST-PHONE-STAND-003',
    createdAt: new Date('2024-12-10T09:15:00Z'),
    userCreatorID: 'john-creator-001',
    locationData: {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris'
    },
    multiplePrints: false,
    numberOfPrints: 1,
    listOfFilesToPrint: [
      {
        fileName: 'phone_stand.stl',
        size: 512000,
        fileId: 'phone_stand_stl_512000_1733827200000',
        previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0Y1OUUwQiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UGhvbmUgU3RhbmQ8L3RleHQ+PC9zdmc+'
      }
    ],
    status: 'finished',
    progressPercentage: 100,
    materialType: 'PLA',
    typeOfPrinting: 'FDM',
    description: 'Phone Stand',
    instructions: 'Simple phone stand for desk',
    estimatedTime: 90,
    typeOfDelivery: 'in_person',
    cost: 25.00,
    recuperationCode: 9012,
    assignedFarmerID: 'tames-farmer-001',
    acceptedAt: new Date('2024-12-10T10:00:00Z'),
    startedAt: new Date('2024-12-10T11:00:00Z'),
    completedAt: new Date('2024-12-10T12:30:00Z')
  },
  {
    orderID: 'TEST-KEYCHAIN-004',
    createdAt: new Date('2024-12-16T11:00:00Z'),
    userCreatorID: 'john-creator-001',
    locationData: {
      latitude: 48.8566,
      longitude: 2.3522,
      city: 'Paris'
    },
    multiplePrints: false,
    numberOfPrints: 1,
    listOfFilesToPrint: [
      {
        fileName: 'keychain.stl',
        size: 256000,
        fileId: 'keychain_stl_256000_1734350400000',
        previewImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0VGNEE0NCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+S2V5Y2hhaW48L3RleHQ+PC9zdmc+'
      }
    ],
    status: 'accepted',
    progressPercentage: 0,
    materialType: 'PLA',
    typeOfPrinting: 'FDM',
    description: 'Custom Keychain',
    instructions: 'Personalized keychain with name',
    estimatedTime: 60,
    typeOfDelivery: 'mail',
    cost: 15.00,
    recuperationCode: 3456
  }
];

// Helper functions for mock data persistence
function getMockOrdersFromStorage(): Order[] {
  if (typeof window === 'undefined') return initialMockOrders;
  
  try {
    const stored = localStorage.getItem('mock_orders');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        acceptedAt: order.acceptedAt ? new Date(order.acceptedAt) : undefined,
        startedAt: order.startedAt ? new Date(order.startedAt) : undefined,
        completedAt: order.completedAt ? new Date(order.completedAt) : undefined,
        cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : undefined,
        finishedTime: order.finishedTime ? new Date(order.finishedTime) : undefined,
      }));
    }
  } catch (error) {
    console.error('Error loading mock orders from storage:', error);
  }
  
  return initialMockOrders;
}

function saveMockOrdersToStorage(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('mock_orders', JSON.stringify(orders));
    console.log('✅ Mock orders saved to localStorage:', orders.length, 'orders');
  } catch (error) {
    console.error('Error saving mock orders to storage:', error);
  }
}

function getMockOrders(): Order[] {
  return getMockOrdersFromStorage();
}

function updateMockOrders(orders: Order[]): void {
  saveMockOrdersToStorage(orders);
}

// Function to reset mock data to initial state
function resetMockOrders(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('mock_orders');
    console.log('✅ Mock orders reset to initial state');
  } catch (error) {
    console.error('Error resetting mock orders:', error);
  }
}

// Function to get mock orders info for debugging
function getMockOrdersInfo(): { count: number; orders: string[] } {
  const orders = getMockOrders();
  return {
    count: orders.length,
    orders: orders.map(order => `${order.orderID} (${order.status})`)
  };
}

// Helper function to check if we should use mock data
function shouldUseMockData(): boolean {
  // Check if we're in a test environment or if API is not available
  return typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  );
}

export class OrderService {
  static async createOrder(orderData: CreateOrderRequest, files?: File[]): Promise<Order> {
    try {
      // Convert files to the format expected by the backend (if provided)
      const filesToPrint = files?.map(file => ({
        fileName: file.name,
        size: file.size,
        previewImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Placeholder image
      })) || [];
      
      // Prepare the complete order data with pending status (no assigned farmer)
      const completeOrderData = {
        ...orderData,
        listOfFilesToPrint: filesToPrint,
        status: 'pending', // Ensure order starts as pending
        progressPercentage: 0,
        // Remove assignedFarmerID to ensure it goes to pending acceptance list
      };
      
      console.log('Creating order with data:', completeOrderData);
      
      // Send order to dispatcher service, which will forward to orders service
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeOrderData),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create order: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Order created successfully:', result);

      // Attach available farmers (if provided by dispatcher)
      const payload = result?.data || result;
      if (result?.availableFarmers) {
        (payload as any).availableFarmers = result.availableFarmers;
      }
      return payload;
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw error;
    }
  }
  
  static async getOrdersByCreator(creatorId: string): Promise<Order[]> {
    // Always use mock data since orders service is not available
    console.log('Using mock orders for creator:', creatorId);
    return getMockOrders().filter(order => order.userCreatorID === creatorId);
  }

  static async getAllOrders(): Promise<Order[]> {
    // Always use mock data since orders service is not available
    console.log('Using mock orders for test environment');
    return getMockOrders();
  }
  
  static async getOrder(orderId: string): Promise<Order> {
    // Always use mock data since orders service is not available
    const mockOrder = getMockOrders().find(order => order.orderID === orderId);
    if (mockOrder) {
      console.log('Using mock order:', orderId);
      return mockOrder;
    }
    throw new Error(`Order not found: ${orderId}`);
  }
  
  static async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    // Always use mock data since orders service is not available
    const mockOrders = getMockOrders();
    const orderIndex = mockOrders.findIndex(order => order.orderID === orderId);
    if (orderIndex !== -1) {
      // Preserve all existing data and merge with updates
      const updatedOrder = { 
        ...mockOrders[orderIndex], 
        ...updates,
        // Ensure dates are properly formatted
        ...(updates.acceptedAt && { acceptedAt: new Date(updates.acceptedAt) }),
        ...(updates.startedAt && { startedAt: new Date(updates.startedAt) }),
        ...(updates.completedAt && { completedAt: new Date(updates.completedAt) }),
        ...(updates.cancelledAt && { cancelledAt: new Date(updates.cancelledAt) })
      };
      mockOrders[orderIndex] = updatedOrder;
      updateMockOrders(mockOrders);
      console.log('✅ Updated mock order with complete data:', orderId, updatedOrder);
      return updatedOrder;
    }
    // If order not found, create a new one for testing
    const newOrder: Order = {
      orderID: orderId,
      createdAt: new Date(),
      status: 'accepted',
      ...updates
    } as Order;
    mockOrders.push(newOrder);
    updateMockOrders(mockOrders);
    console.log('Created new mock order:', orderId);
    return newOrder;
  }
  
  static async deleteOrder(orderId: string): Promise<void> {
    // Always use mock data since orders service is not available
    const mockOrders = getMockOrders();
    const orderIndex = mockOrders.findIndex(order => order.orderID === orderId);
    if (orderIndex !== -1) {
      mockOrders.splice(orderIndex, 1);
      updateMockOrders(mockOrders);
      console.log('Deleted mock order:', orderId);
      return;
    }
    throw new Error(`Order not found: ${orderId}`);
  }

  // Debug function to check mock orders state
  static debugMockOrders(): void {
    const orders = getMockOrders();
    console.log('🔍 Mock Orders Debug Info:', {
      totalOrders: orders.length,
      orders: orders.map(order => ({
        orderID: order.orderID,
        status: order.status,
        assignedFarmerID: order.assignedFarmerID,
        description: order.description
      }))
    });
  }

  // Function to reset mock orders to initial state
  static resetMockOrders(): void {
    resetMockOrders();
  }
}
