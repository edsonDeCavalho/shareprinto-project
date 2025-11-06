'use client';

import React, { useEffect, useState } from 'react';
import useSocket, { SocketUser, UserStatusEvent } from '../hooks/useSocket';

interface UserStatusManagerProps {
  userId: string;
  username: string;
  email?: string;
  onUserStatusChange?: (event: UserStatusEvent) => void;
  showOnlineUsers?: boolean;
  showStatusEvents?: boolean;
}

export const UserStatusManager: React.FC<UserStatusManagerProps> = ({
  userId,
  username,
  email,
  onUserStatusChange,
  showOnlineUsers = true,
  showStatusEvents = false
}) => {
  const {
    isConnected,
    connect,
    disconnect,
    emitUserActivity,
    emitUserLogout,
    onlineUsers,
    userStatusEvents,
    connectionError
  } = useSocket({
    userId,
    username,
    email,
    autoConnect: true,
    heartbeatInterval: 30000
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle user status changes
  useEffect(() => {
    if (onUserStatusChange) {
      userStatusEvents.forEach(event => {
        onUserStatusChange(event);
      });
    }
  }, [userStatusEvents, onUserStatusChange]);

  // Manual logout function
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Emit logout event via Socket.IO
      emitUserLogout(userId);
      
      // Also send HTTP request to backend
      const serverUrl = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';
      await fetch(`${serverUrl}/api/logout/manual-logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }) // userId should be MongoDB _id
      });
      
      // Disconnect from Socket.IO
      disconnect();
      
      // Clear user data from storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        sessionStorage.clear();
      }
      
      // Redirect to login page or trigger logout callback
      window.location.href = '/signin';
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Still disconnect and redirect even if request fails
      disconnect();
      window.location.href = '/signin';
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get connection status color
  const getConnectionStatusColor = () => {
    if (connectionError) return 'text-red-500';
    if (isConnected) return 'text-green-500';
    return 'text-yellow-500';
  };

  return (
    <div className="user-status-manager">
      {/* Connection Status */}
      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Connection Status</h3>
            <p className={`text-sm ${getConnectionStatusColor()}`}>
              {connectionError ? `❌ ${connectionError}` : 
               isConnected ? '🟢 Connected' : '🟡 Connecting...'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Online Users List */}
      {showOnlineUsers && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Online Users ({onlineUsers.length})</h3>
          <div className="bg-white border rounded-lg max-h-64 overflow-y-auto">
            {onlineUsers.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No users online</p>
            ) : (
              <div className="divide-y">
                {onlineUsers.map((user) => (
                  <div key={user.userId} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      {user.email && (
                        <p className="text-sm text-gray-500">{user.email}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        Last activity: {formatTimestamp(user.lastActivity)}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Events Log */}
      {showStatusEvents && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Recent Status Events</h3>
          <div className="bg-white border rounded-lg max-h-64 overflow-y-auto">
            {userStatusEvents.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No events yet</p>
            ) : (
              <div className="divide-y">
                {userStatusEvents.slice(-10).reverse().map((event, index) => (
                  <div key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.type === 'user_online' ? 'bg-green-100 text-green-800' :
                        event.type === 'user_offline' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {event.type.replace('user_', '').toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      <strong>{event.username}</strong> ({event.userId})
                    </p>
                    {event.metadata?.reason && (
                      <p className="text-xs text-gray-500">
                        Reason: {event.metadata.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Debug Info</h4>
          <div className="text-xs space-y-1">
            <p>User ID: {userId}</p>
            <p>Username: {username}</p>
            <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
            <p>Online Users: {onlineUsers.length}</p>
            <p>Status Events: {userStatusEvents.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatusManager;
