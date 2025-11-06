import { useEffect, useState, useCallback } from 'react';
import socketService, { UserStatusEvent, SocketUser } from '../services/socketService';

export interface AdminStats {
  totalConnections: number;
  connectedUsers: SocketUser[];
  timestamp: Date;
}

export interface UseAdminSocketReturn {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  onlineUsers: SocketUser[];
  userStatusEvents: UserStatusEvent[];
  adminStats: AdminStats | null;
  connectionError: string | null;
}

export const useAdminSocket = (): UseAdminSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([]);
  const [userStatusEvents, setUserStatusEvents] = useState<UserStatusEvent[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Connect as admin
  const connect = useCallback(async () => {
    if (socketService.isSocketConnected()) {
      return;
    }

    setConnectionError(null);

    try {
      await socketService.connectAsAdmin();
      setIsConnected(true);
    } catch (error) {
      console.error('❌ Failed to connect admin to Socket.IO:', error);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnected(false);
    }
  }, []);

  // Disconnect admin
  const disconnect = useCallback(() => {
    socketService.disconnectAdmin();
    setIsConnected(false);
    setOnlineUsers([]);
    setUserStatusEvents([]);
    setAdminStats(null);
  }, []);

  // Handle user status updates
  const handleUserStatusUpdate = useCallback((event: UserStatusEvent) => {
    setUserStatusEvents(prev => [...prev.slice(-99), event]); // Keep last 100 events
    
    // Update online users list
    setOnlineUsers(prev => {
      const updated = [...prev];
      
      switch (event.type) {
        case 'user_online':
          // Add or update user
          const existingIndex = updated.findIndex(user => user.userId === event.userId);
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              userId: event.userId,
              username: event.username,
              email: event.email,
              connectedAt: event.metadata?.connectedAt || new Date().toISOString(),
              lastActivity: new Date().toISOString()
            };
          } else {
            updated.push({
              userId: event.userId,
              username: event.username,
              email: event.email,
              connectedAt: event.metadata?.connectedAt || new Date().toISOString(),
              lastActivity: new Date().toISOString()
            });
          }
          break;
          
        case 'user_offline':
          // Remove user
          return updated.filter(user => user.userId !== event.userId);
          
        case 'user_activity':
          // Update last activity
          const userIndex = updated.findIndex(user => user.userId === event.userId);
          if (userIndex >= 0) {
            updated[userIndex] = {
              ...updated[userIndex],
              lastActivity: new Date().toISOString()
            };
          }
          break;
      }
      
      return updated;
    });
  }, []);

  // Handle admin stats
  const handleAdminStats = useCallback((stats: AdminStats) => {
    setAdminStats(stats);
    setOnlineUsers(stats.connectedUsers || []);
  }, []);

  // Handle connection status changes
  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
    if (!connected) {
      setConnectionError('Connection lost');
    } else {
      setConnectionError(null);
    }
  }, []);

  // Handle disconnect
  const handleDisconnect = useCallback((reason: string) => {
    setIsConnected(false);
    setConnectionError(`Disconnected: ${reason}`);
  }, []);

  // Setup event listeners
  useEffect(() => {
    // User status updates
    socketService.on('user_status_update', handleUserStatusUpdate);
    socketService.on('user_online', handleUserStatusUpdate);
    socketService.on('user_offline', handleUserStatusUpdate);
    socketService.on('user_activity', handleUserStatusUpdate);
    
    // Admin specific events
    socketService.on('admin_stats', handleAdminStats);
    
    // Connection events
    socketService.on('connect', () => handleConnectionChange(true));
    socketService.on('disconnect', handleDisconnect);

    return () => {
      socketService.off('user_status_update', handleUserStatusUpdate);
      socketService.off('user_online', handleUserStatusUpdate);
      socketService.off('user_offline', handleUserStatusUpdate);
      socketService.off('user_activity', handleUserStatusUpdate);
      socketService.off('admin_stats', handleAdminStats);
      socketService.off('connect', () => handleConnectionChange(true));
      socketService.off('disconnect', handleDisconnect);
    };
  }, [handleUserStatusUpdate, handleAdminStats, handleConnectionChange, handleDisconnect]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    onlineUsers,
    userStatusEvents,
    adminStats,
    connectionError
  };
};

export default useAdminSocket;
