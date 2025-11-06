'use client';

import React, { useState, useEffect } from 'react';
import { useAdminSocket } from '../hooks/useAdminSocket';

interface UserStatus {
  userId: string;
  username: string;
  email?: string;
  status: 'online' | 'offline';
  timestamp: Date;
  sessionId?: string;
  metadata?: {
    loginTime?: Date;
    lastActivity?: Date;
    logoutTime?: Date;
    reason?: string;
  };
}

interface UserActivity {
  id: string;
  userId: string;
  username: string;
  action: 'login' | 'logout' | 'browser_close';
  timestamp: Date;
  sessionId?: string;
  metadata?: any;
}

export default function AdminDashboard() {
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState({
    totalOnline: 0,
    totalOffline: 0,
    loginsToday: 0,
    logoutsToday: 0
  });

  const { 
    isConnected, 
    onlineUsers, 
    userStatusEvents, 
    adminStats, 
    connectionError 
  } = useAdminSocket();

  // Initialize dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update stats when admin stats change
  useEffect(() => {
    if (adminStats) {
      setStats(prev => ({
        ...prev,
        totalOnline: adminStats.totalConnections
      }));
    }
  }, [adminStats]);

  // Update activities when user status events change
  useEffect(() => {
    if (userStatusEvents.length > 0) {
      const latestEvent = userStatusEvents[userStatusEvents.length - 1];
      addActivity({
        id: `${latestEvent.type}_${Date.now()}`,
        userId: latestEvent.userId,
        username: latestEvent.username,
        action: latestEvent.type === 'user_online' ? 'login' : 
                latestEvent.type === 'user_offline' ? 'logout' : 'activity',
        timestamp: new Date(latestEvent.timestamp),
        sessionId: latestEvent.sessionId,
        metadata: latestEvent.metadata
      });
    }
  }, [userStatusEvents]);

  const fetchDashboardData = async () => {
    try {
      // Fetch online users
      const onlineResponse = await fetch('http://localhost:3004/api/user-status/online');
      if (onlineResponse.ok) {
        const onlineData = await onlineResponse.json();
        if (onlineData.success) {
          setOnlineUsers(onlineData.data || []);
        }
      }

      // Fetch user statistics
      const statsResponse = await fetch('http://localhost:3004/api/user-status/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      // Fetch all users from auth service
      const usersResponse = await fetch('http://51.178.142.95:3000/auth/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setTotalUsers(usersData.length || 0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };


  const addActivity = (activity: UserActivity) => {
    setUserActivities(prev => [activity, ...prev.slice(0, 99)]); // Keep last 100 activities
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    return status === 'online' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return '🟢';
      case 'logout':
        return '🔴';
      case 'browser_close':
        return '🟡';
      default:
        return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time user status monitoring</p>
          
          {/* Connection Status */}
          <div className="mt-4 flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}
            </span>
            {connectionError && (
              <span className="text-sm text-red-600 ml-2">
                Error: {connectionError}
              </span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Online Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOnline}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🔑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Logins Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.loginsToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🚪</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Logouts Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.logoutsToday}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Online Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Online Users</h2>
              <p className="text-sm text-gray-600">Currently active users</p>
            </div>
            <div className="p-6">
              {onlineUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users currently online</p>
              ) : (
                <div className="space-y-3">
                  {onlineUsers.map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          online
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(new Date(user.connectedAt))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-600">User login/logout events</p>
            </div>
            <div className="p-6">
              {userActivities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {userActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg">{getActionIcon(activity.action)}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {activity.username} {activity.action === 'login' ? 'logged in' : 
                           activity.action === 'logout' ? 'logged out' : 'closed browser'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.action === 'login' ? 'bg-green-100 text-green-800' :
                        activity.action === 'logout' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.action}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
