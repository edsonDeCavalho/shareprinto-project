'use client';

import { CreateOrderForm } from '@/components/create-order-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateOrderPage() {
  return (
    <div className="flex-grow bg-grid p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/creator/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-headline">Create New Order</h1>
            <p className="text-muted-foreground">Fill out the form below to create a new print order.</p>
          </div>
        </div>
        
        <CreateOrderForm />
      </div>
    </div>
  );
}
