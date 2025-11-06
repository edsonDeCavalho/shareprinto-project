'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, KeyRound } from "lucide-react"
import Link from 'next/link'
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useUser } from "@/contexts/UserContext"

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [digitalCode, setDigitalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!digitalCode) {
      setError('Please enter your 6-digit digital code');
      return;
    }
    
    if (digitalCode.length !== 6) {
      setError('Digital code must be exactly 6 digits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          digitalCode: digitalCode,
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Signin error response:', errorText);
        throw new Error(`Sign in failed: ${response.status} ${response.statusText}`);
      }

      // Try to parse JSON response
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error('Invalid response from server. Please try again.');
      }

      if (result.success) {
        toast({
          title: 'Sign In Successful!',
          description: `Welcome back, ${result.user.firstName}!`,
        });
        
        // Use the UserContext to login
        login(result.user, result.token);
        
        // Redirect based on user type
        if (result.user.userType === 'farmer') {
          window.location.href = '/farmer/dashboard';
        } else {
          window.location.href = '/creator/dashboard';
        }
      } else {
        // Handle specific error messages from backend
        const errorMessage = result.message || 'Sign in failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error('Signin error:', err);
      const errorMessage = err.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Sign In Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNumberClick = (number: string) => {
    if (digitalCode.length < 6) {
      setDigitalCode(prev => prev + number);
    }
  };

  const handleDelete = () => {
    setDigitalCode(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setDigitalCode('');
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-grid p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Sign In</CardTitle>
          <CardDescription>Sign in with your email and digital code</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  className="pl-10" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Digital Code</Label>
              
              {/* PIN Display */}
              <div className="flex justify-center space-x-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all duration-200",
                      digitalCode[index]
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background"
                    )}
                  >
                    {digitalCode[index] ? "•" : ""}
                  </div>
                ))}
              </div>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                  <Button
                    key={number}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-12 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleNumberClick(number.toString())}
                    disabled={loading || digitalCode.length >= 6}
                  >
                    {number}
                  </Button>
                ))}
                
                {/* Bottom row with 0, delete, and clear */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-12 text-lg font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={handleClear}
                  disabled={loading}
                >
                  C
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-12 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleNumberClick('0')}
                  disabled={loading || digitalCode.length >= 6}
                >
                  0
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-12 text-lg font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={handleDelete}
                  disabled={loading || digitalCode.length === 0}
                >
                  ←
                </Button>
              </div>
              
              {/* Help text */}
              <p className="text-xs text-muted-foreground text-center mt-2">
                Enter your 6-digit digital code using the keypad below
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTitle className="text-red-800">Sign In Error</AlertTitle>
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || !email || digitalCode.length !== 6}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

            <Separator className="my-6" />
            
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Don't have an account?</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href="/farmer-signup">
                    Become a Farmer
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href="/creator-signup">
                    Become a Creator
                    </Link>
                </Button>
              </div>
            </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
