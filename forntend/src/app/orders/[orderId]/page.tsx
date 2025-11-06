
'use client';

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock, Layers3, FileText, Download, ChevronLeft, ArrowRight, Play, Pause, Square, MessageSquare, User, Loader2, DollarSign } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React, { useState, useEffect, use } from 'react';
import { cn } from '@/lib/utils';
import { Chat, type Message } from '@/components/chat';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { OrderService, type Order } from '@/services/orderService';
import { STLFilesList } from '@/components/stl-files-list';
import { STLDebugInfo } from '@/components/stl-debug-info';


const initialMessages: Message[] = [
    { id: '1', text: "Hello! Just accepted your order. I'll get started on it shortly. The estimated time is about 8 hours.", sender: 'farmer', timestamp: '10:30 AM' },
    { id: '2', text: "That's great, thank you! Please let me know if you have any questions about the model.", sender: 'creator', timestamp: '10:32 AM' },
    { id: '3', imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y4ZmFmYyIvPjx0ZXh0IHg9IjMwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QcmludCBQcm9ncmVzczwvdGV4dD48L3N2Zz4=', text: "Here's a photo of the first layer, everything looks good so far!", sender: 'farmer', timestamp: '11:15 AM' },
];

// Mock data for a single order. In a real app, you'd fetch this based on the orderId.
const orderData = {
    orderId: "ORD-7C4B1A",
    description: "A detailed miniature of a dragon, with its wings outstretched, ready to take flight from a rocky perch. The model requires high precision to capture the fine details of the scales, horns, and the texture of the rocks.",
    filamentType: "PLA",
    estimatedTime: "8 hours",
    type: "Miniature",
    previewImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y4ZmFmYyIvPjx0ZXh0IHg9IjMwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EcmFnb24gTW9kZWw8L3RleHQ+PC9zdmc+",
    files: [
        { name: "dragon_model_v3.stl", size: "15.2 MB" },
        { name: "rocky_base.stl", size: "5.8 MB" },
        { name: "assembly_instructions.pdf", size: "1.1 MB" },
    ],
    creator: {
        name: "J. Artisian",
        rating: 4.9,
        reviews: 124,
    },
    farmer: {
        name: "Alex Doe",
        rating: 5.0,
        reviews: 32,
    }
};

type OrderStatus = 'pending_acceptance' | 'in_progress' | 'completed' | 'declined' | 'paused';
const statusMap: Record<OrderStatus, string> = {
    pending_acceptance: "Pending Acceptance",
    in_progress: "In Progress",
    completed: "Completed",
    declined: "Declined",
    paused: "Paused",
}


export default function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { user, isAuthenticated } = useUser();
    const { toast } = useToast();
    const pathname = usePathname();
    const router = useRouter();
    
    // Unwrap params for Next.js 15 compatibility
    const { orderId } = use(params);
    
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [previousPage, setPreviousPage] = useState<string>('');
    
    // Determine user role and appropriate dashboard
    const getUserRole = () => {
        if (user?.userType === 'creator') return 'creator';
        if (user?.userType === 'farmer') return 'farmer';
        // Fallback based on pathname if userType is not available
        return pathname.startsWith('/creator') ? 'creator' : 'farmer';
    };
    
    const userRole = getUserRole();
    const isCreatorView = userRole === 'creator';
    const isFarmerView = userRole === 'farmer';
    
    // Get the appropriate dashboard URL
    const getDashboardUrl = () => {
        if (userRole === 'creator') return '/creator/dashboard';
        if (userRole === 'farmer') return '/farmer/dashboard';
        return '/'; // Fallback
    };
    
    const dashboardUrl = getDashboardUrl();
    
    // Check if the current user is the assigned farmer for this order
    const isAssignedFarmer = order?.assignedFarmerID === (user?.id || user?.userId);
    
    // Store the previous page when component mounts
    useEffect(() => {
        // Store the current pathname as the previous page
        const currentPath = window.location.pathname;
        const referrer = document.referrer;
        
        // If we have a referrer and it's from our domain, use it
        if (referrer && referrer.includes(window.location.origin)) {
            const referrerPath = new URL(referrer).pathname;
            if (referrerPath !== currentPath) {
                setPreviousPage(referrerPath);
            }
        }
    }, []);
    
    // Fetch order data
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const orderData = await OrderService.getOrder(orderId);
                setOrder(orderData);
            } catch (error) {
                console.error('Error fetching order:', error);
                toast({
                    title: "Error",
                    description: "Failed to load order details.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && orderId) {
            fetchOrder();
        }
    }, [orderId, isAuthenticated, toast]);

    // Update order status
    const updateOrderStatus = async (newStatus: string) => {
        if (!order) return;
        
        try {
            setUpdating(true);
            await OrderService.updateOrder(order.orderID, { status: newStatus });
            
            // Update local state
            setOrder(prev => prev ? { ...prev, status: newStatus } : null);
            
            toast({
                title: "Status Updated",
                description: `Order status changed to ${newStatus}`,
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            toast({
                title: "Error",
                description: "Failed to update order status.",
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    // Update progress percentage
    const updateProgress = async (progress: number) => {
        if (!order) return;
        
        try {
            setUpdating(true);
            await OrderService.updateOrder(order.orderID, { progressPercentage: progress });
            
            // Update local state
            setOrder(prev => prev ? { ...prev, progressPercentage: progress } : null);
            
            toast({
                title: "Progress Updated",
                description: `Progress updated to ${progress}%`,
            });
        } catch (error) {
            console.error('Error updating progress:', error);
            toast({
                title: "Error",
                description: "Failed to update progress.",
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleSendMessage = (data: { text?: string; imageUrl?: string }) => {
        const newMessage: Message = {
            id: (messages.length + 1).toString(),
            sender: isCreatorView ? 'creator' : 'farmer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...data
        };
        setMessages(prev => [...prev, newMessage]);
    };
    
    // Handle going back to the appropriate dashboard or previous page
    const handleGoBack = () => {
        // If we have a previous page and it's a valid dashboard or orders page, go there
        if (previousPage && (
            previousPage.includes('/dashboard') || 
            previousPage.includes('/orders') ||
            previousPage.includes('/creator') ||
            previousPage.includes('/farmer')
        )) {
            router.push(previousPage);
        } else {
            // Otherwise, go to the appropriate dashboard based on user role
            router.push(dashboardUrl);
        }
    };
    
    // Get the back button text
    const getBackButtonText = () => {
        if (previousPage && (
            previousPage.includes('/dashboard') || 
            previousPage.includes('/orders') ||
            previousPage.includes('/creator') ||
            previousPage.includes('/farmer')
        )) {
            if (previousPage.includes('/creator/dashboard')) return 'Back to Creator Dashboard';
            if (previousPage.includes('/farmer/dashboard')) return 'Back to Farmer Dashboard';
            if (previousPage.includes('/orders')) return 'Back to Orders';
            return 'Go Back';
        }
        return `Back to ${userRole === 'creator' ? 'Creator' : 'Farmer'} Dashboard`;
    };


    if (loading) {
        return (
            <div className="flex-grow bg-grid p-4 sm:p-6 lg:p-8">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading order details...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex-grow bg-grid p-4 sm:p-6 lg:p-8">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Order Not Found</h1>
                        <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
                        <Button onClick={handleGoBack} className="mt-4">
                            {getBackButtonText()}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow bg-grid p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-5xl space-y-8">
                <div>
                    <Button variant="ghost" onClick={handleGoBack} className="mb-4">
                        <ChevronLeft /> {getBackButtonText()}
                    </Button>
                    <h1 className="text-3xl font-bold font-headline">Order Details</h1>
                    <p className="text-muted-foreground">Review the order specifics and files for order #{order.orderID}.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                             <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-2xl">{order.description || 'Order Details'}</CardTitle>
                                    <Badge variant="secondary" className={cn({
                                        'bg-yellow-100 text-yellow-800': order.status === 'accepted',
                                        'bg-green-100 text-green-800': order.status === 'finished',
                                        'bg-blue-100 text-blue-800': order.status === 'in_progress',
                                        'bg-orange-100 text-orange-800': order.status === 'paused',
                                        'bg-red-100 text-red-800': order.status === 'paused_due_to_problem_printing',
                                    })}>{order.status || 'Unknown'}</Badge>
                                </div>
                             </CardHeader>
                             <CardContent>
                                <div className="mb-6">
                                    <div className="w-full aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                                        <div className="text-center text-muted-foreground">
                                            <FileText className="h-16 w-16 mx-auto mb-4" />
                                            <p>3D model preview disabled</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Layers3 size={16}/>
                                            <span>{order.materialType || 'Not specified'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={16}/>
                                            <span>{order.estimatedTime ? `${order.estimatedTime} min` : 'Not specified'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign size={16}/>
                                            <span>{order.cost ? `€${order.cost.toFixed(2)}` : 'Not specified'}</span>
                                        </div>
                                    </div>
                                    
                                    {order.progressPercentage !== undefined && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Progress</span>
                                                <span>{order.progressPercentage}%</span>
                                            </div>
                                            <Progress value={order.progressPercentage} className="h-2" />
                                        </div>
                                    )}
                                    
                                    {order.instructions && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Instructions</h3>
                                            <p className="text-muted-foreground">{order.instructions}</p>
                                        </div>
                                    )}
                                    
                                    {order.description && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Description</h3>
                                            <p className="text-muted-foreground">{order.description}</p>
                                        </div>
                                    )}
                                </div>
                             </CardContent>
                        </Card>
                        
                        {/* Order Management Controls - Only show for assigned farmers */}
                        {isFarmerView && isAssignedFarmer && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Play className="h-5 w-5" />
                                        Order Management
                                    </CardTitle>
                                    <CardDescription>
                                        Update the status and progress of this order.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Status Update */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">Order Status</Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant={order.status === 'in_progress' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updateOrderStatus('in_progress')}
                                                disabled={updating}
                                            >
                                                <Play className="h-4 w-4 mr-1" />
                                                Start Printing
                                            </Button>
                                            <Button
                                                variant={order.status === 'paused' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updateOrderStatus('paused')}
                                                disabled={updating}
                                            >
                                                <Pause className="h-4 w-4 mr-1" />
                                                Pause
                                            </Button>
                                            <Button
                                                variant={order.status === 'finished' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updateOrderStatus('finished')}
                                                disabled={updating}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Mark Complete
                                            </Button>
                                            <Button
                                                variant={order.status === 'paused_due_to_problem_printing' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updateOrderStatus('paused_due_to_problem_printing')}
                                                disabled={updating}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Problem
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Progress Update */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <Label className="text-sm font-medium">Progress Percentage</Label>
                                            <span className="text-sm text-muted-foreground">
                                                {order.progressPercentage || 0}%
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <Slider
                                                value={[order.progressPercentage || 0]}
                                                onValueChange={(value) => updateProgress(value[0])}
                                                max={100}
                                                step={5}
                                                disabled={updating}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>0%</span>
                                                <span>50%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {updating && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Updating order...
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare /> 
                                    Chat with {isCreatorView ? 'Farmer' : 'Creator'}
                                </CardTitle>
                                <CardDescription>Ask questions or provide updates about the print job.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Chat 
                                    messages={messages} 
                                    onSendMessage={handleSendMessage} 
                                    creatorName="Creator"
                                    farmerName="Farmer"
                                    currentUser={isCreatorView ? 'creator' : 'farmer'}
                                />
                            </CardContent>
                        </Card>

                        <STLFilesList 
                            files={order.listOfFilesToPrint || []}
                            showPreviews={true}
                            compact={false}
                        />
                        
                        {/* Debug Information - Only show in development */}
                        {process.env.NODE_ENV === 'development' && (
                            <STLDebugInfo 
                                files={order.listOfFilesToPrint || []}
                                className="mt-4"
                            />
                        )}
                    </div>

                     <div className="lg:col-span-1 space-y-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>Order Information</CardTitle>
                             </CardHeader>
                            <CardContent className="space-y-4">
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Order ID</span>
                                        <span className="font-mono">{order.orderID}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Created</span>
                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {order.acceptedAt && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Accepted</span>
                                            <span>{new Date(order.acceptedAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {order.recuperationCode && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Recovery Code</span>
                                            <span className="font-mono">{order.recuperationCode}</span>
                                        </div>
                                    )}
                                 </div>
                                 
                                 {order.assignedFarmerID && (
                                     <div className="pt-4 border-t">
                                         <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                                                 F
                                             </div>
                                             <div>
                                                 <p className="font-semibold text-sm">Assigned Farmer</p>
                                                 <p className="text-xs text-muted-foreground">ID: {order.assignedFarmerID}</p>
                                             </div>
                                         </div>
                                     </div>
                                 )}
                            </CardContent>
                        </Card>
                     </div>
                </div>
            </div>
        </div>
    );
}
