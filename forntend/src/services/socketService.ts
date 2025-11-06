import { io, Socket } from 'socket.io-client';

export interface UserStatusEvent {
  type: 'user_online' | 'user_offline' | 'user_activity';
  userId: string;
  username: string;
  email?: string;
  timestamp: string;
  sessionId?: string;
  metadata?: any;
}

export interface SocketUser {
  userId: string;
  username: string;
  email?: string;
  connectedAt: string;
  lastActivity: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupBeforeUnload();
  }

  /**
   * Connect to Socket.IO server
   */
  connect(userInfo: { userId: string; username: string; email?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';
        
        // Try with WebSocket first, fallback to polling only if needed
        // For debugging: you can temporarily use ['polling'] only if WebSocket issues persist
        this.socket = io(serverUrl, {
          transports: ['polling', 'websocket'],
          timeout: 10000,
          forceNew: true,
          upgrade: true,
          rememberUpgrade: false,
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          // Fallback to polling only if WebSocket fails
          fallback: true
        });

        // Connection successful
        this.socket.on('connect', () => {
          console.log('🔌 Connected to Socket.IO server');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Identify user
          this.socket?.emit('user_identify', userInfo);
          resolve();
        });

        // Connection failed
        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket.IO connection error:', error);
          console.error('❌ Error details:', {
            message: error.message,
            description: error.description,
            context: error.context,
            type: error.type
          });
          this.isConnected = false;
          
          // Don't reject immediately - try to continue with polling transport
          console.log('🔄 Socket.IO connection failed, but continuing with fallback...');
          setTimeout(() => {
            if (!this.isConnected) {
              reject(error);
            }
          }, 2000);
        });

        // Disconnected
        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Disconnected from Socket.IO server:', reason);
          this.isConnected = false;
          this.handleDisconnect(reason);
        });

        // User identified confirmation
        this.socket.on('user_identified', (data) => {
          console.log('✅ User identified on Socket.IO:', data);
        });

        // User status updates
        this.socket.on('user_status_update', (event: UserStatusEvent) => {
          this.handleUserStatusUpdate(event);
        });

        // Setup other event listeners
        this.setupEventListeners();

      } catch (error) {
        console.error('❌ Failed to connect to Socket.IO:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 Disconnected from Socket.IO server');
    }
  }

  /**
   * Check if connected
   */
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Emit user activity (heartbeat)
   */
  emitUserActivity(userId: string): void {
    if (this.isSocketConnected()) {
      this.socket?.emit('user_activity', { userId });
    }
  }

  /**
   * Emit manual logout
   */
  emitUserLogout(userId: string): void {
    if (this.isSocketConnected()) {
      this.socket?.emit('user_logout', { userId });
    }
  }

  /**
   * Join a room
   */
  joinRoom(room: string): void {
    if (this.isSocketConnected()) {
      this.socket?.emit('join_room', { room });
    }
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string): void {
    if (this.isSocketConnected()) {
      this.socket?.emit('leave_room', { room });
    }
  }

  /**
   * Connect as admin dashboard
   */
  connectAsAdmin(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const serverUrl = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';
        
        this.socket = io(serverUrl, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: true
        });

        // Connection successful
        this.socket.on('connect', () => {
          console.log('🔌 Admin dashboard connected to Socket.IO server');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Connect as admin
          this.socket?.emit('admin_connect');
          resolve();
        });

        // Connection failed
        this.socket.on('connect_error', (error) => {
          console.error('❌ Admin Socket.IO connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Disconnected
        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Admin dashboard disconnected from Socket.IO server:', reason);
          this.isConnected = false;
          this.handleDisconnect(reason);
        });

        // Admin stats
        this.socket.on('admin_stats', (data) => {
          console.log('📊 Received admin stats:', data);
          this.emit('admin_stats', data);
        });

        // User status updates
        this.socket.on('user_status_update', (event: UserStatusEvent) => {
          this.handleUserStatusUpdate(event);
        });

        // Setup other event listeners
        this.setupEventListeners();

      } catch (error) {
        console.error('❌ Failed to connect admin to Socket.IO:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect admin dashboard
   */
  disconnectAdmin(): void {
    if (this.socket) {
      this.socket.emit('admin_disconnect');
      this.disconnect();
    }
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);

    // Also add to socket if connected
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: Function): void {
    if (callback) {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      this.eventListeners.delete(event);
    }

    // Also remove from socket if connected
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.removeAllListeners(event);
      }
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Re-add all stored event listeners
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  /**
   * Handle user status updates
   */
  private handleUserStatusUpdate(event: UserStatusEvent): void {
    console.log('📡 Received user status update:', event);
    
    // Emit custom events for different status types
    this.emit('user_status_update', event);
    
    switch (event.type) {
      case 'user_online':
        this.emit('user_online', event);
        break;
      case 'user_offline':
        this.emit('user_offline', event);
        break;
      case 'user_activity':
        this.emit('user_activity', event);
        break;
    }
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(reason: string): void {
    this.emit('disconnect', reason);
    
    // Attempt to reconnect if not a manual disconnect
    if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.socket?.connect();
        }
      }, delay);
    }
  }

  /**
   * Setup beforeunload event to handle browser close
   */
  private setupBeforeUnload(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.handleBrowserClose();
      });

      // Also handle pagehide for mobile browsers
      window.addEventListener('pagehide', () => {
        this.handleBrowserClose();
      });
    }
  }

  /**
   * Handle browser close
   */
  private handleBrowserClose(): void {
    const userId = this.getCurrentUserId();
    if (userId) {
      // Send logout request to backend
      this.sendLogoutRequest(userId, 'browser_close');
    }
  }

  /**
   * Send logout request to backend
   */
  private async sendLogoutRequest(userId: string, reason: string): Promise<void> {
    try {
      const serverUrl = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';
      
      // Use sendBeacon for reliable delivery during page unload
      if (navigator.sendBeacon) {
        const data = JSON.stringify({ userId, reason });
        navigator.sendBeacon(`${serverUrl}/api/logout/browser-close`, data);
      } else {
        // Fallback to fetch with keepalive
        await fetch(`${serverUrl}/api/logout/browser-close`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, reason }),
          keepalive: true
        });
      }

      // If user is a farmer, also set their availability to false (busy)
      const userType = this.getCurrentUserType();
      if (userType === 'farmer') {
        const availabilityData = JSON.stringify({
          userId: userId,
          available: false // Set to busy/unavailable on browser close
        });

        // Use fetch with keepalive instead of sendBeacon for proper JSON handling
        await fetch(`${serverUrl}/api/user-status/farmer-availability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: availabilityData,
          keepalive: true
        });
      }
    } catch (error) {
      console.error('❌ Failed to send logout request:', error);
    }
  }

  /**
   * Get current user ID from localStorage or context
   */
  private getCurrentUserId(): string | null {
    if (typeof window !== 'undefined') {
      // First try to get from stored user object (MongoDB _id)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          return userData.id; // Use MongoDB _id
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }
      // Fallback to direct localStorage userId
      return localStorage.getItem('userId') || sessionStorage.getItem('userId');
    }
    return null;
  }

  /**
   * Get current user type from localStorage
   */
  private getCurrentUserType(): string | null {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          return userData.userType;
        } catch (error) {
          console.error('Error parsing stored user data for userType:', error);
        }
      }
    }
    return null;
  }

  /**
   * Emit custom event
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat(userId: string, interval: number = 30000): void {
    setInterval(() => {
      if (this.isSocketConnected()) {
        this.emitUserActivity(userId);
      }
    }, interval);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat(): void {
    // Clear all intervals (this is a simplified approach)
    // In a real implementation, you'd want to store the interval ID
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
