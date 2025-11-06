import { useEffect, useState, useCallback, useRef } from 'react';
import socketService, { UserStatusEvent, SocketUser } from '../services/socketService';

export interface UseSocketOptions {
  userId?: string;
  username?: string;
  email?: string;
  autoConnect?: boolean;
  heartbeatInterval?: number;
}

export interface UseSocketReturn {
  isConnected: boolean;
  connect: (userInfo: { userId: string; username: string; email?: string }) => Promise<void>;
  disconnect: () => void;
  emitUserActivity: (userId: string) => void;
  emitUserLogout: (userId: string) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  onlineUsers: SocketUser[];
  userStatusEvents: UserStatusEvent[];
  connectionError: string | null;
}

export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
  const {
    userId,
    username,
    email,
    autoConnect = true,
    heartbeatInterval = 30000
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([]);
  const [userStatusEvents, setUserStatusEvents] = useState<UserStatusEvent[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  // Connect to Socket.IO
  const connect = useCallback(async (userInfo: { userId: string; username: string; email?: string }) => {
    if (isConnectingRef.current || socketService.isSocketConnected()) {
      return;
    }

    isConnectingRef.current = true;
    setConnectionError(null);

    try {
      await socketService.connect(userInfo);
      setIsConnected(true);
      
      // Start heartbeat
      if (heartbeatInterval > 0) {
        socketService.startHeartbeat(userInfo.userId, heartbeatInterval);
      }
    } catch (error) {
      console.error('❌ Failed to connect to Socket.IO:', error);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnected(false);
    } finally {
      isConnectingRef.current = false;
    }
  }, [heartbeatInterval]);

  // Disconnect from Socket.IO
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setOnlineUsers([]);
    setUserStatusEvents([]);
    
    // Stop heartbeat
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  // Emit user activity
  const emitUserActivity = useCallback((userId: string) => {
    socketService.emitUserActivity(userId);
  }, []);

  // Emit user logout
  const emitUserLogout = useCallback((userId: string) => {
    socketService.emitUserLogout(userId);
  }, []);

  // Join room
  const joinRoom = useCallback((room: string) => {
    socketService.joinRoom(room);
  }, []);

  // Leave room
  const leaveRoom = useCallback((room: string) => {
    socketService.leaveRoom(room);
  }, []);

  // Handle user status updates
  const handleUserStatusUpdate = useCallback((event: UserStatusEvent) => {
    setUserStatusEvents(prev => [...prev.slice(-49), event]); // Keep last 50 events
    
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
    
    // Connection events
    socketService.on('connect', () => handleConnectionChange(true));
    socketService.on('disconnect', handleDisconnect);

    return () => {
      socketService.off('user_status_update', handleUserStatusUpdate);
      socketService.off('user_online', handleUserStatusUpdate);
      socketService.off('user_offline', handleUserStatusUpdate);
      socketService.off('user_activity', handleUserStatusUpdate);
      socketService.off('connect', () => handleConnectionChange(true));
      socketService.off('disconnect', handleDisconnect);
    };
  }, [handleUserStatusUpdate, handleConnectionChange, handleDisconnect]);

  // Auto-connect if user info is provided
  useEffect(() => {
    if (autoConnect && userId && username && !isConnected && !isConnectingRef.current) {
      connect({ userId, username, email });
    }
  }, [autoConnect, userId, username, email, isConnected, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    emitUserActivity,
    emitUserLogout,
    joinRoom,
    leaveRoom,
    onlineUsers,
    userStatusEvents,
    connectionError
  };
};

export default useSocket;
