'use client';

import { useEffect } from 'react';
import '@/utils/authConnectionTest';

/**
 * Component that loads the auth connection test utility
 * Makes it available globally in the browser console
 */
export function AuthConnectionTestLoader() {
  useEffect(() => {
    // The utility is already loaded via the import above
    // This component just ensures it's available
    if (typeof window !== 'undefined') {
      console.log('🔧 Auth connection test utility is ready!');
      console.log('   Type: testAuthConnection() in the console to test the connection');
      console.log('   Or: testAuthConnection(true) for detailed output');
    }
  }, []);

  return null; // This component doesn't render anything
}

