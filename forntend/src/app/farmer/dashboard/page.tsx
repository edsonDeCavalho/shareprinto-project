'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Clock, User, ArrowRight, DollarSign, TrendingUp, Wifi, WifiOff, Loader2, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { OrderService, type Order } from '@/services/orderService';
// WebSocket hooks removed
import { PrinterService, type FarmerPrinter } from '@/services/printerService';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useNotification } from '@/contexts/NotificationContext';
// WebSocket hooks removed
import { getModelDetails } from '@/lib/printer-data';
import { playOrderAcceptedSound, enableAudio } from '@/lib/sound';

// Helper function to get status display name
const getStatusDisplayName = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'Accepted';
    case 'in_progress':
      return 'In Progress';
    case 'finished':
      return 'Completed';
    case 'paused':
      return 'Paused';
    case 'paused_due_to_problem_printing':
      return 'Paused - Problem';
    default:
      return status;
  }
};

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'accepted':
            return 'bg-green-100 text-green-800';
        case 'in_progress':
            return 'bg-purple-100 text-purple-800';
        case 'finished':
            return 'bg-green-100 text-green-800';
        case 'paused':
            return 'bg-orange-100 text-orange-800';
        case 'paused_due_to_problem_printing':
            return 'bg-red-100 text-red-800';
        default:
            return 'secondary';
    }
}

const FarmerOrderCard = ({ order }: { order: Order }) => {
    console.log('🎯 Rendering FarmerOrderCard with order:', order);
    
    const orderId = order.orderID || order.orderId || 'unknown';
    const previewImage = order.listOfFilesToPrint?.[0]?.previewImage || 'https://placehold.co/300x200';
    const creatorName = order.userCreatorID || 'Unknown Creator';
    const estimatedTime = order.estimatedTime ? `${order.estimatedTime} min` : 'N/A';
    const cost = order.cost ? `€${order.cost.toFixed(2)}` : 'N/A';
    
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <Link href={`/orders/${orderId}`} className="grid grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Image src={previewImage} data-ai-hint="3d printed object" alt={order.description || 'Order'} width={300} height={200} className="w-full h-full object-cover" />
                </div>
                <div className="md:col-span-2 flex flex-col p-6">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{order.description || 'No description'}</CardTitle>
                        <Badge variant="secondary">{order.orderID}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <User size={14} />
                        <span>{creatorName}</span>
                    </div>

                    <div className="flex-grow my-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Status</span>
                            <Badge className={getStatusBadgeVariant(order.status || 'accepted')}>
                                {getStatusDisplayName(order.status || 'accepted')}
                            </Badge>
                        </div>
                        {order.progressPercentage && order.progressPercentage > 0 && (
                            <>
                                <Progress value={order.progressPercentage} className="h-2" />
                                <p className="text-xs text-muted-foreground text-right">{order.progressPercentage}% complete</p>
                            </>
                        )}
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Estimated Time</span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {estimatedTime}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Amount</span>
                            <span className="flex items-center gap-1 font-semibold">
                                <DollarSign size={14} />
                                {cost}
                            </span>
                        </div>
                        {order.recuperationCode && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Recuperation Code</span>
                                <span className="font-mono bg-secondary px-2 py-1 rounded text-xs">
                                    {order.recuperationCode}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end">
                        <Button variant="ghost" asChild className="pointer-events-none">
                           <div>
                                View Details <ArrowRight className="ml-2" />
                           </div>
                        </Button>
                    </div>
                </div>
            </Link>
        </Card>
    )
};

const AvailableOrderCard = ({ order, onAccept, onDecline, isLoading }: { 
    order: Order; 
    onAccept: (orderId: string) => void; 
    onDecline: (orderId: string) => void;
    isLoading: boolean;
}) => {
    const orderId = order.orderID || order.orderId || 'unknown';
    const previewImage = order.listOfFilesToPrint?.[0]?.previewImage || 'https://placehold.co/300x200';
    const creatorName = order.userCreatorID || 'Unknown Creator';
    const estimatedTime = order.estimatedTime ? `${order.estimatedTime} min` : 'N/A';
    const cost = order.cost ? `€${order.cost.toFixed(2)}` : 'N/A';
    
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Image src={previewImage} data-ai-hint="3d printed object" alt={order.description || 'Order'} width={300} height={200} className="w-full h-full object-cover" />
                </div>
                <div className="md:col-span-2 flex flex-col p-6">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{order.description || 'No description'}</CardTitle>
                        <Badge variant="secondary">{orderId}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <User size={14} />
                        <span>{creatorName}</span>
                    </div>

                    <div className="flex-grow my-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Status</span>
                            <Badge className={getStatusBadgeVariant(order.status || 'accepted')}>
                                {getStatusDisplayName(order.status || 'accepted')}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Estimated Time</span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {estimatedTime}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Amount</span>
                            <span className="flex items-center gap-1 font-semibold">
                                <DollarSign size={14} />
                                {cost}
                            </span>
                        </div>
                        {order.recuperationCode && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Recuperation Code</span>
                                <span className="font-mono bg-secondary px-2 py-1 rounded text-xs">
                                    {order.recuperationCode}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <Button variant="ghost" asChild>
                            <Link href={`/orders/${orderId}`}>
                                View Details <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                        
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onDecline(orderId)}
                                disabled={isLoading}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Decline
                            </Button>
                            <Button 
                                size="sm"
                                onClick={() => onAccept(orderId)}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
};

const PrinterCard = ({ printer }: { printer: FarmerPrinter }) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online':
                return <Wifi className="h-4 w-4 text-green-600" />;
            case 'printing':
                return <Printer className="h-4 w-4 text-blue-600" />;
            case 'maintenance':
                return <WifiOff className="h-4 w-4 text-orange-600" />;
            default:
                return <WifiOff className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'online':
                return 'default';
            case 'printing':
                return 'default';
            case 'maintenance':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const getStatusDisplayName = (status: string) => {
        switch (status) {
            case 'online':
                return 'Online';
            case 'offline':
                return 'Offline';
            case 'printing':
                return 'Printing';
            case 'maintenance':
                return 'Maintenance';
            default:
                return status;
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold">{printer.brand} {printer.model}</h3>
                    <p className="text-sm text-muted-foreground">{printer.buildVolume}</p>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusIcon(printer.status)}
                    <Badge variant={getStatusBadgeVariant(printer.status)}>
                        {getStatusDisplayName(printer.status)}
                    </Badge>
                </div>
            </div>
            
            {printer.currentJob && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Current Job: {printer.currentJob}</span>
                        <span>{printer.progressPercentage || 0}%</span>
                    </div>
                    <Progress value={printer.progressPercentage || 0} className="h-2" />
                </div>
            )}
            
            {printer.notes && (
                <div className="mt-2">
                    <p className="text-xs text-muted-foreground">{printer.notes}</p>
                </div>
            )}
        </Card>
    );
};

export default function FarmerDashboardPage() {
    const { user, isAuthenticated } = useUser();
    const { toast } = useToast();
    const { currentOffer, isOfferVisible, showOfferPopup } = useNotification();
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState<string | null>(null);
    const [printers, setPrinters] = useState<FarmerPrinter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(false);


    // Functions to replace useRealtimeOrders functionality
    const getOrdersByStatus = (status: string) => {
        return orders.filter(order => order.status === status);
    };

    const acceptOrder = async (orderId: string) => {
        try {
            setActionLoading(orderId);
            await OrderService.updateOrder(orderId, {
                status: 'accepted',
                assignedFarmerID: user?.id || user?.userId,
                acceptedAt: new Date()
            });
            
            // Update local state
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.orderID === orderId 
                        ? { ...order, status: 'accepted', assignedFarmerID: user?.id || user?.userId }
                        : order
                )
            );
            
            toast({
                title: "Order Accepted",
                description: "You have successfully accepted the order.",
            });
        } catch (error) {
            console.error('Error accepting order:', error);
            toast({
                title: "Error",
                description: "Failed to accept order. Please try again.",
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    // Check sound setting from localStorage
    useEffect(() => {
        const savedSoundSetting = localStorage.getItem('soundEnabled');
        if (savedSoundSetting !== null) {
            setAudioEnabled(JSON.parse(savedSoundSetting));
        } else {
            // Default to true if no setting is saved
            setAudioEnabled(true);
            localStorage.setItem('soundEnabled', 'true');
        }
    }, []);

    // The GlobalSocketManager and NotificationContext handle offer notifications
    // No need for manual polling since dispatcher service uses WebSocket/Socket.IO
    useEffect(() => {
        if (!user?.id && !user?.userId) return;

        const farmerId = user.id || user.userId;
        console.log('🎯 Farmer dashboard ready to receive offers for farmer:', farmerId);
        console.log('🎯 User object details:', { id: user.id, userId: user.userId, email: user.email, userType: user.userType });
        console.log('🔌 Offers will be received via WebSocket/Socket.IO from dispatcher service');

        // The GlobalSocketManager component handles WebSocket connections
        // The NotificationContext will show popups when offers are received
        
    }, [user]);

        // Fetch printers only (orders are handled locally)
    useEffect(() => {
        const fetchPrinters = async () => {
            try {
                setLoading(true);
                
                // Fetch farmer printers from database
                const userPhone = user?.phone;
                if (userPhone) {
                    try {
                        const farmerPrinters = await PrinterService.getFarmerPrinters(userPhone);
                        setPrinters(farmerPrinters);
                    } catch (err) {
                        console.error('Error fetching printers:', err);
                        // Fallback to empty array if no printers found
                        setPrinters([]);
                    }
                } else {
                    setPrinters([]);
                }
                
                setError(null);
            } catch (err) {
                console.error('Error fetching printers:', err);
                setError('Failed to load printer data. Please try again.');
                toast({
                    title: "Error",
                    description: "Failed to load printer data. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user) {
            fetchPrinters();
        } else {
            setLoading(false);
        }
    }, [user, isAuthenticated, toast]);

    // Categorize orders for farmers using the hook's filtering
    const incomingOrders = getOrdersByStatus('new');
    const activeOrders = getOrdersByStatus('in-progress');
    const completedOrders = getOrdersByStatus('history');

    // Debug logging
    console.log('🔍 Farmer Dashboard Order Filtering:', {
        totalOrders: orders.length,
        incomingOrders: incomingOrders.length,
        activeOrders: activeOrders.length,
        completedOrders: completedOrders.length,
        userID: user?.id || user?.userId,
        userType: user?.userType
    });

    // Log active orders details
    activeOrders.forEach(order => {
        console.log(`🔍 Active Order: ${order.orderID}`, {
            status: order.status,
            assignedFarmerID: order.assignedFarmerID,
            userID: user?.id || user?.userId,
            isAssigned: order.assignedFarmerID === (user?.id || user?.userId),
            description: order.description,
            cost: order.cost,
            estimatedTime: order.estimatedTime,
            listOfFilesToPrint: order.listOfFilesToPrint?.length || 0
        });
    });

    // Calculate stats
    const totalEarnings = completedOrders.reduce((sum, order) => {
        return sum + (order.cost || 0);
    }, 0);

    const activeOrdersCount = activeOrders.length;

    // Handle order acceptance
    const handleAcceptOrder = async (orderId: string) => {
        try {
            setActionLoading(orderId);
            
            // First, get the complete order details before accepting
            const orderDetails = await OrderService.getOrder(orderId);
            console.log('📋 Complete order details before acceptance:', orderDetails);
            
            // Use the acceptOrder function
            const updatedOrder = await acceptOrder(orderId);
            console.log('✅ Order accepted successfully:', updatedOrder);

            // Play success sound if audio is enabled
            const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
            if (soundEnabled) {
                try {
                    await playOrderAcceptedSound();
                } catch (error) {
                    console.error('Error playing sound:', error);
                }
            }

            // Show success message with order details
            toast({
                title: "Order Accepted! 🎉",
                description: `You've accepted "${orderDetails.description || 'Order'}" for €${orderDetails.cost || 0}. Check your Active Orders tab.`,
            });
        } catch (err) {
            console.error('Error accepting order:', err);
            toast({
                title: "Error",
                description: "Failed to accept order. Please try again.",
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    // Handle enabling audio
    const handleEnableAudio = () => {
        enableAudio();
        setAudioEnabled(true);
        localStorage.setItem('soundEnabled', 'true');
        toast({
            title: "Audio Enabled",
            description: "Sound notifications are now enabled!",
        });
    };


    // Handle order decline
    const handleDeclineOrder = async (orderId: string) => {
        try {
            setActionLoading(orderId);
            
            // For now, we'll just show a toast notification
            // In a real app, you might want to mark it as declined or send a notification
            toast({
                title: "Order Declined",
                description: "Order has been declined.",
            });
        } catch (err) {
            console.error('Error declining order:', err);
            toast({
                title: "Error",
                description: "Failed to decline order. Please try again.",
                variant: "destructive",
            });
        } finally {
            setActionLoading(null);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex-grow bg-grid p-4 sm:p-6 lg:p-8">
                <div className="container mx-auto max-w-6xl">
                    <Card className="text-center p-12">
                        <CardContent>
                            <p className="text-muted-foreground">Please log in to view your farmer dashboard.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow bg-grid p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-6xl space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Farmer Dashboard</h1>
                        <p className="text-muted-foreground">Manage your printers and incoming orders.</p>
                    </div>
                    <div className="flex gap-2">
                        {!audioEnabled && (
                            <Button 
                                variant="outline" 
                                size="lg"
                                onClick={handleEnableAudio}
                            >
                                🔊 Enable Sound
                            </Button>
                        )}
                        <Button asChild size="lg">
                            <Link href="/profile">
                                <Printer className="mr-2" /> Manage Printers
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                                    <p className="text-2xl font-bold">€{totalEarnings.toFixed(2)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                                    <p className="text-2xl font-bold">{activeOrdersCount}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Printers Online</p>
                                    <p className="text-2xl font-bold">{printers.filter(p => p.status === 'online').length}</p>
                                </div>
                                <Printer className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>


                {/* Printers Status */}
                <div>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">My Printers</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {printers.map(printer => (
                            <PrinterCard key={printer.id} printer={printer} />
                        ))}
                    </div>
                </div>
                
                {loading || ordersLoading ? (
                    <Card className="text-center p-12">
                        <CardContent>
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading orders...</span>
                            </div>
                        </CardContent>
                    </Card>
                ) : error || ordersError ? (
                    <Card className="text-center p-12">
                        <CardContent>
                            <p className="text-muted-foreground">{error}</p>
                            <Button 
                                variant="link" 
                                onClick={() => window.location.reload()}
                                className="mt-2"
                            >
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                <Tabs defaultValue="incoming">
                        <TabsList className="grid w-full grid-cols-3 max-w-md">
                        <TabsTrigger value="incoming">
                                Available Orders <Badge className="ml-2">{incomingOrders.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="active">
                                My Active Orders <Badge className="ml-2">{activeOrders.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="completed">
                                Completed <Badge className="ml-2">{completedOrders.length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                        
                                            <TabsContent value="incoming" className="mt-6 space-y-4">
                        {incomingOrders.length > 0 ? (
                                incomingOrders.map((order, index) => {
                                    const orderId = order.orderID || order.orderId || `incoming-${index}-${Math.random().toString(36).substring(2, 8)}`;
                                    return (
                                        <AvailableOrderCard 
                                            key={orderId} 
                                            order={order as any} 
                                            onAccept={handleAcceptOrder}
                                            onDecline={handleDeclineOrder}
                                            isLoading={actionLoading === orderId}
                                        />
                                    );
                                })
                            ) : (
                                <Card className="text-center p-12">
                                    <CardContent>
                                        <p className="text-muted-foreground">No available orders at the moment.</p>
                                        <p className="text-sm text-muted-foreground mt-2">Check back later for new orders from creators.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                        
                        <TabsContent value="active" className="mt-6 space-y-4">
                            {activeOrders.length > 0 ? (
                                activeOrders.map((order, index) => {
                                    const orderId = order.orderID || order.orderId || `active-${index}-${Math.random().toString(36).substring(2, 8)}`;
                                    return <FarmerOrderCard key={orderId} order={order as any} />;
                                })
                        ) : (
                            <Card className="text-center p-12">
                                <CardContent>
                                        <p className="text-muted-foreground">You have no active orders.</p>
                                        <p className="text-sm text-muted-foreground mt-2">Accept orders from the Available Orders tab to get started.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                        
                    <TabsContent value="completed" className="mt-6 space-y-4">
                        {completedOrders.length > 0 ? (
                                completedOrders.map((order, index) => {
                                    const orderId = order.orderID || order.orderId || `completed-${index}-${Math.random().toString(36).substring(2, 8)}`;
                                    return <FarmerOrderCard key={orderId} order={order as any} />;
                                })
                        ) : (
                            <Card className="text-center p-12">
                                <CardContent>
                                    <p className="text-muted-foreground">You have no completed orders yet.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
                )}
            </div>
        </div>
    );
}
