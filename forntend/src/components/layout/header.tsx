
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Box, Menu, X, LogOut, User, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser } from '@/contexts/UserContext';
import { useNotification } from '@/contexts/NotificationContext';
// import { NotificationBell } from '@/components/notifications/notification-bell';


// Mock data - in a real app this would come from an API
const initialNewOrders = [
    { orderId: "ORD-7C4B1A" },
    { orderId: "ORD-9F2D5C" },
    { orderId: "ORD-3A8E9B" },
];


const getNavItems = (isAuthenticated: boolean, userType?: string) => {
  const baseItems = [
    { href: '/about', label: 'About' },
  ];

  if (isAuthenticated) {
    if (userType === 'creator') {
      // Creators only see: My Orders, Settings, À propos
      return [
        ...baseItems,
        { href: '/creator/dashboard', label: 'My Orders' },
        { href: '/settings', label: 'Settings' },
      ];
    } else {
      // Farmers see all menu items
      const dashboardHref = '/farmer/dashboard';
      return [
        ...baseItems,
        { href: dashboardHref, label: 'My Dashboard' },
        { href: '/finance', label: 'My Finances' },
        /*
        { href: '/orders', label: 'My Orders' },
        { href: '/finance', label: 'My Finances' },
        { href: '/profile', label: 'Profile' },
        */
        { href: '/settings', label: 'Settings' },
        
      ];
    }
  }

  return baseItems;
};

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [isGoButtonLoading, setIsGoButtonLoading] = useState(false);
  const { user, isAuthenticated, logout, updateUser } = useUser();

  useEffect(() => {
    // In a real app, you would fetch this data from your backend.
    // For now, we'll use the mock data.
    setNewOrdersCount(initialNewOrders.length);
  }, []);

  const handleGoButtonClick = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    setIsGoButtonLoading(true);
    
    try {
      const dispatcherUrl = process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';
      
      // Toggle availability - if currently available, make unavailable, and vice versa
      const newAvailability = !user.available;
      
      const response = await fetch(`${dispatcherUrl}/api/user-status/farmer-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id, // Use MongoDB _id
          available: newAvailability
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update user context with new availability status
        updateUser({ available: newAvailability });
        
        // Play notification sound when availability changes
        try {
          const { playAvailabilityNotificationSound } = await import('@/lib/sound');
          await playAvailabilityNotificationSound();
        } catch (e) {
          console.warn('Could not play availability notification sound:', e);
        }
        
        console.log(`✅ Farmer availability updated to ${newAvailability ? 'available' : 'unavailable'}`);
      } else {
        console.error('❌ Failed to update farmer availability:', result.error);
        alert(`Failed to update availability: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error updating farmer availability:', error);
      alert('Failed to update availability. Please try again.');
    } finally {
      setIsGoButtonLoading(false);
    }
  };


 const NavLinks = ({ className }: { className?: string }) => {
  const navItems = getNavItems(isAuthenticated, user?.userType);
  const { hasUnreadOffers } = useNotification();
  
  return (
    <nav className={cn('flex items-center gap-6 lg:gap-8', className)}>
      {navItems.map((item: { href: string; label: string }) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            'transition-colors hover:text-primary flex items-center gap-2 px-3 py-2',
            pathname === item.href ? 'text-primary font-semibold' : 'text-muted-foreground',
            'text-sm lg:text-base'
          )}
        >
          {item.label}
          {item.href === '/orders' && newOrdersCount > 0 && (
            <Badge className="h-5">{newOrdersCount}</Badge>
          )}
          {item.href === '/farmer/dashboard' && hasUnreadOffers && (
            <Badge className="h-5 bg-orange-500 hover:bg-orange-600">!</Badge>
          )}
        </Link>
      ))}
    </nav>
  );
 };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Box className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl font-headline">SharePrinto</span>
        </Link>
        <div className="hidden md:flex flex-1 items-center justify-start">
          <NavLinks />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isAuthenticated ? (
            <>
              {/* <NotificationBell /> */}
              {user?.userType === 'farmer' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`h-8 w-8 rounded-full text-white border-2 ${
                    user.available 
                      ? 'bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600' 
                      : 'bg-gray-500 hover:bg-gray-600 border-gray-500 hover:border-gray-600'
                  }`}
                  onClick={handleGoButtonClick}
                  disabled={isGoButtonLoading}
                  title={user.available ? 'Currently Available - Click to go offline' : 'Currently Unavailable - Click to go online'}
                >
                  {isGoButtonLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    user.available ? "✓" : "Go"
                  )}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 h-auto">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.firstName} />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  await logout();
                  // Redirect to signin page after logout
                  window.location.href = '/signin';
                }} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
                              </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/farmer-signup">Become a Farmer</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/creator-signup">Become a Creator</Link>
              </Button>
              <Button asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            </>
          )}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-6 border-b">
                    <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <Box className="h-6 w-6 text-primary" />
                      <span className="font-bold">SharePrinto</span>
                    </Link>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <X className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                  </div>
                  <nav className="flex flex-col items-start gap-6 mt-6">
                    {getNavItems(isAuthenticated, user?.userType).map((item: { href: string; label: string }) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'text-lg transition-colors hover:text-primary flex items-center gap-2',
                          pathname === item.href ? 'text-primary font-semibold' : 'text-foreground'
                        )}
                      >
                        {item.label}
                         {item.href === '/orders' && newOrdersCount > 0 && (
                            <Badge variant="secondary">{newOrdersCount}</Badge>
                        )}
                      </Link>
                    ))}
                    {isAuthenticated && (
                      <>
                        {user?.userType === 'farmer' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                            onClick={handleGoButtonClick}
                            disabled={isGoButtonLoading}
                          >
                            {isGoButtonLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Go"
                            )}
                          </Button>
                        )}
                        <button
                          onClick={async () => {
                            await logout();
                            setIsMobileMenuOpen(false);
                            // Redirect to signin page after logout
                            window.location.href = '/signin';
                          }}
                          className="text-lg transition-colors hover:text-destructive flex items-center gap-2 text-left w-full"
                        >
                          <LogOut className="h-5 w-5" />
                          Log out
                        </button>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
