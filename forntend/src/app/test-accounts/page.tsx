'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';

const testAccounts = [
  {
    id: 'tames-farmer-001',
    userId: 'tames-farmer-001',
    firstName: 'Tames',
    lastName: 'Farmer',
    email: 'tames.farmer@test.com',
    phone: '+1234567890',
    userType: 'farmer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tames',
    score: 4.8,
    online: true,
    activated: true,
    available: true,
    latSeenAt: new Date().toISOString(),
    address: '123 Print Street',
    city: 'Paris',
    state: 'Île-de-France',
    zipCode: '75001',
    country: 'France',
    description: 'Professional 3D printing farmer with 5+ years experience'
  },
  {
    id: 'john-creator-001',
    userId: 'john-creator-001',
    firstName: 'John',
    lastName: 'Creator',
    email: 'john.creator@test.com',
    phone: '+1234567891',
    userType: 'creator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    score: 4.9,
    online: true,
    activated: true,
    available: true,
    latSeenAt: new Date().toISOString(),
    address: '456 Create Avenue',
    city: 'Paris',
    state: 'Île-de-France',
    zipCode: '75002',
    country: 'France',
    description: 'Innovative creator with multiple successful projects'
  },
  {
    id: 'sarah-farmer-002',
    userId: 'sarah-farmer-002',
    firstName: 'Sarah',
    lastName: 'Farmer',
    email: 'sarah.farmer@test.com',
    phone: '+1234567892',
    userType: 'farmer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    score: 4.9,
    online: true,
    activated: true,
    available: true,
    latSeenAt: new Date().toISOString(),
    address: '15 Rue du Faubourg Saint-Honoré',
    city: 'Paris',
    state: 'Île-de-France',
    zipCode: '75008',
    country: 'France',
    description: 'Specialized in high-quality resin printing - Now in Paris for testing!'
  }
];

export default function TestAccountsPage() {
  const { user, login, logout, isAuthenticated } = useUser();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const loginAsTestAccount = (accountId: string) => {
    const account = testAccounts.find(acc => acc.id === accountId);
    if (account) {
      // Create a fake token for testing
      const fakeToken = `test-token-${accountId}-${Date.now()}`;
      
      // Login with the test account
      login(account, fakeToken);
      
      // WebSocket functionality removed
      
      setSelectedAccount(accountId);
      
      console.log(`Logged in as ${account.firstName} ${account.lastName} (${account.userType})`);
    }
  };

  const logoutFromTestAccount = () => {
    logout();
    setSelectedAccount(null);
    console.log('Logged out from test account');
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Accounts</CardTitle>
          <CardDescription>
            Quick login for testing the offer notification system. Use these accounts to test different user roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated && user && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">
                    Currently logged in as: {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-green-700 text-sm">
                    User Type: {user.userType} | ID: {user.id}
                  </p>
                </div>
                <Button onClick={logoutFromTestAccount} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {testAccounts.map((account) => (
              <Card key={account.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={account.avatar} 
                        alt={`${account.firstName} ${account.lastName}`}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">
                          {account.firstName} {account.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{account.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={account.userType === 'farmer' ? 'default' : 'secondary'}>
                            {account.userType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ⭐ {account.score}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            📍 {account.city}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => loginAsTestAccount(account.id)}
                        disabled={isAuthenticated && user?.id === account.id}
                        className="w-full"
                      >
                        {isAuthenticated && user?.id === account.id ? 'Current User' : 'Login'}
                      </Button>
                      <div className="text-xs text-muted-foreground text-center">
                        ID: {account.id}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. <strong>Login as Tames Farmer</strong> - Use this account to test receiving offers</p>
              <p>2. <strong>Open debug panel</strong> - Look for the debug button in the bottom-right corner</p>
              <p>3. <strong>Copy the Farmer ID</strong> - Use the copy button in the debug panel</p>
              <p>4. <strong>Test functionality</strong> - WebSocket test pages have been removed</p>
              <p>5. <strong>Send test offer</strong> - Paste the farmer ID and send an offer</p>
              <p>6. <strong>Watch for popup</strong> - The offer should appear immediately in Tames Farmer's browser</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• These are test accounts for development purposes only</p>
            <p>• No real authentication is performed</p>
            <p>• WebSocket connections are established automatically for farmers</p>
            <p>• Use different browsers/tabs to test offer sending and receiving</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


