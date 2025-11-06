'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home } from 'lucide-react';

export default function CreatorNotFoundPage() {
  const router = useRouter();

  useEffect(() => {
    // Log the invalid route for debugging
    console.warn('Invalid creator route accessed, redirecting to dashboard');
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              The page you're looking for doesn't exist in the creator section.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => router.push('/creator/dashboard')}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Creator Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
