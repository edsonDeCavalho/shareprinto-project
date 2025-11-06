'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
  avatar?: string;
  score: number;
  online: boolean;
  activated: boolean;
  available: boolean;
  printers?: any[];
  latSeenAt: string;
  // Location fields
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  refreshUser: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing user data in localStorage on app load
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const logout = async () => {
    try {
      // Get user data before clearing it
      const currentUser = user;
      
      if (currentUser?.id) {
        // Emit socket logout first
        try {
          if (typeof window !== 'undefined' && (window as any).emitSocketLogout) {
            (window as any).emitSocketLogout();
            console.log('✅ Socket logout emitted');
          }
        } catch (error) {
          console.error('❌ Failed to emit socket logout:', error);
        }

        // Call dispatcher service to update user status to offline
        const dispatcherUrl = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';
        
        try {
          await fetch(`${dispatcherUrl}/api/logout/manual-logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              userId: currentUser.id, // Use MongoDB _id instead of custom userId
              sessionId: `session_${currentUser.id}_${Date.now()}`
            }),
            keepalive: true // Ensure request completes even if page unloads
          });
          
          console.log('✅ User status updated to offline in database');
        } catch (error) {
          console.error('❌ Failed to update user status to offline:', error);
          // Continue with logout even if backend call fails
        }

        // If user is a farmer, also set their availability to false (busy)
        if (currentUser.userType === 'farmer') {
          try {
            await fetch(`${dispatcherUrl}/api/user-status/farmer-availability`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: currentUser.id, // Use MongoDB _id
                available: false // Set to busy/unavailable on logout
              }),
              keepalive: true // Ensure request completes even if page unloads
            });
            
            console.log('✅ Farmer availability set to false (busy) on logout');
          } catch (error) {
            console.error('❌ Failed to update farmer availability on logout:', error);
            // Continue with logout even if availability update fails
          }
        }
      }
    } catch (error) {
      console.error('❌ Error during logout:', error);
    } finally {
      // Always clear local data
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      sessionStorage.clear();
    }
  };

  const refreshUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, refreshUser, updateUser, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
