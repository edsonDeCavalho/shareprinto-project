'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateOrderSchema, type CreateOrderValues } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, AlertCircle, UploadCloud, X, File as FileIcon, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderService, type CreateOrderRequest } from '@/services/orderService';
import { useUser } from '@/contexts/UserContext';
import { STLPreviewService } from '@/services/stl-preview-service';
import { STLFilesList } from './stl-files-list';
import { FarmerService, type FarmerLocation } from '@/services/farmerService';

export function CreateOrderForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [showSearchAnimation, setShowSearchAnimation] = React.useState(false);
  const [createdOrderData, setCreatedOrderData] = React.useState<any>(null);
  const [availableFarmers, setAvailableFarmers] = React.useState<FarmerLocation[]>([]);
  const [loadingFarmers, setLoadingFarmers] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useUser();

  const form = useForm<CreateOrderValues>({
    resolver: zodResolver(CreateOrderSchema),
    defaultValues: {
      description: 'Test order description',
      instructions: 'Please print with high quality',
      materialType: 'PLA',
      typeOfPrinting: 'FDM',
      multiplePrints: false,
      numberOfPrints: 1,
      typeOfDelivery: 'in_person',
      stlFiles: [],
      locationData: {
        latitude: 48.8566, // Paris default
        longitude: 2.3522,
        city: 'Paris',
      },
    },
  });

  const { watch, setValue, trigger } = form;
  const watchedFiles = watch('stlFiles');
  const watchedMultiplePrints = watch('multiplePrints');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const currentFiles = form.getValues('stlFiles') || [];
      const newFiles = Array.from(e.dataTransfer.files);
      
      // Skip generating previews for STL files
      
      setValue('stlFiles', [...currentFiles, ...newFiles]);
      trigger('stlFiles');
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const currentFiles = form.getValues('stlFiles') || [];
      const newFiles = Array.from(e.target.files);
      
      // Skip generating previews for STL files
      
      setValue('stlFiles', [...currentFiles, ...newFiles]);
      trigger('stlFiles');
    }
  }

  const removeFile = (index: number) => {
    const currentFiles = [...(form.getValues('stlFiles') || [])];
    currentFiles.splice(index, 1);
    setValue('stlFiles', currentFiles);
    trigger('stlFiles');
  }

  // Removed animation flow and map redirection after order creation

  const onSubmit = async (values: CreateOrderValues) => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to create an order.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    console.log('Form values:', values);
    console.log('User:', user);
    
    try {
      // Generate random cost and estimated time
      const randomCost = Math.floor(Math.random() * (100 - 20 + 1)) + 20; // Random cost between €20-€100
      const randomEstimatedTime = Math.floor(Math.random() * (480 - 60 + 1)) + 60; // Random time between 60-480 minutes (1-8 hours)
      
      console.log('Generated random values:', { cost: randomCost, estimatedTime: randomEstimatedTime });
      
      // Prepare order data
      const orderData: CreateOrderRequest = {
        userCreatorID: user?.id || user?.userId || 'temp-user-id',
        locationData: values.locationData,
        multiplePrints: values.multiplePrints,
        numberOfPrints: values.numberOfPrints,
        listOfFilesToPrint: values.stlFiles.map(file => ({
          fileName: file.name,
          size: file.size,
        })),
        materialType: values.materialType,
        typeOfPrinting: values.typeOfPrinting,
        description: values.description,
        instructions: values.instructions,
        estimatedTime: randomEstimatedTime, // Use generated random time
        typeOfDelivery: values.typeOfDelivery,
        cost: randomCost, // Use generated random cost
      };
      
      // Create order using the service and capture available farmers from the dispatcher
      const created = await OrderService.createOrder(orderData, values.stlFiles || []);
      setCreatedOrderData({ ...orderData, availableFarmers: (created as any)?.availableFarmers || [] });

      // Always redirect to sequential offers page - no more parallel dispatch
      const city = orderData.locationData?.city || 'Paris';
      const orderId = (created as any)?.orderID || `ORD-${Date.now()}`;
      const queryParams = new URLSearchParams({
        city: city,
        orderId: orderId,
        description: encodeURIComponent(orderData.description || ''),
        materialType: orderData.materialType || '',
        typeOfPrinting: orderData.typeOfPrinting || '',
        estimatedTime: (orderData.estimatedTime || 120).toString(),
        cost: (orderData.cost || 50).toString(),
        numberOfPrints: (orderData.numberOfPrints || 1).toString(),
        instructions: encodeURIComponent(orderData.instructions || ''),
        creatorName: encodeURIComponent(user?.firstName || 'Creator')
      });
      
      console.log(`🎯 Redirecting to sequential offers for order ${orderId} in ${city}`);
      router.push(`/sequential-offers?${queryParams.toString()}`);
      
      toast({
        title: "Order Created!",
        description: "Your order has been successfully created and is now available for farmers to accept.",
      });
      
    } catch (err) {
      setError('Failed to create order. Please try again.');
      console.error('Error creating order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Print Order</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cost and estimated time will be automatically generated when you submit the order.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what you want to print..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any special requirements or instructions for the farmer..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">3D Model Files</h3>
                
                <FormField
                  control={form.control}
                  name="stlFiles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>STL Files</FormLabel>
                      <FormControl>
                        <div 
                          className={cn(
                            'relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80 transition-colors',
                            dragActive && 'border-primary bg-primary/10'
                          )}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">.STL files (Max 50MB each)</p>
                          </div>
                          <Input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".stl"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          {dragActive && <div className="absolute inset-0" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                        </div>
                      </FormControl>
                      <FormMessage />
                      {watchedFiles && watchedFiles.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <Label>Selected Files:</Label>
                          <STLFilesList 
                            files={Array.from(watchedFiles).map((file: File, index) => ({
                              fileName: file.name,
                              size: file.size,
                            }))}
                            compact={true}
                            showPreviews={false}
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              {/* Print Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Print Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="materialType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PLA">PLA</SelectItem>
                            <SelectItem value="ABS">ABS</SelectItem>
                            <SelectItem value="PETG">PETG</SelectItem>
                            <SelectItem value="TPU">TPU</SelectItem>
                            <SelectItem value="Resin">Resin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="typeOfPrinting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Printing Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select printing type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FDM">FDM (Fused Deposition Modeling)</SelectItem>
                            <SelectItem value="SLA">SLA (Stereolithography)</SelectItem>
                            <SelectItem value="SLS">SLS (Selective Laser Sintering)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="multiplePrints"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Multiple Prints</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Do you need multiple copies of this print?
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchedMultiplePrints && (
                  <FormField
                    control={form.control}
                    name="numberOfPrints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Prints</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Delivery */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Delivery</h3>
                
                <FormField
                  control={form.control}
                  name="typeOfDelivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mail">Mail Delivery</SelectItem>
                          <SelectItem value="in_person">In-Person Pickup</SelectItem>
                          <SelectItem value="farmer_delivery">Farmer Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                
                <FormField
                  control={form.control}
                  name="locationData.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Enter your city"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !isAuthenticated}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Creating Order...' : !isAuthenticated ? 'Please Log In' : 'Create Order'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {!isAuthenticated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to create an order. Please sign in to continue.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Farmer Search Animation */}
      {/* Animation overlay removed per request */}

      {/* Quick text list of available farmers in the city */}
      {(loadingFarmers || availableFarmers.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {loadingFarmers
                ? 'Loading available farmers…'
                : `Available farmers in ${createdOrderData?.locationData?.city || 'your city'}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!loadingFarmers && availableFarmers.length === 0 && (
              <p className="text-sm text-muted-foreground">No available farmers found right now.</p>
            )}
            {!loadingFarmers && availableFarmers.length > 0 && (
              <ul className="list-disc pl-6 space-y-1">
                {availableFarmers.map((f) => (
                  <li key={(f as any).id || (f as any).userId} className="text-sm">
                    {(f as any).name || (f as any).fullName || 'Farmer'}
                    {f.city ? ` – ${f.city}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
