
'use client';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock, Layers3, FileText, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
// WebSocket hooks removed
import { Skeleton } from '@/components/ui/skeleton';
import { STLFilesList } from '@/components/stl-files-list';
import { OrderFilesPreview } from '@/components/order-files-preview';



const NewOrderCard = ({ order, onAcceptOrder, isFarmer }: { order: Order, onAcceptOrder?: (orderId: string) => void, isFarmer?: boolean }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-1">
                <Link href={`/orders/${order.orderId}`}>
                    <OrderFilesPreview 
                        files={order.listOfFilesToPrint || []}
                        className="w-full h-full"
                    />
                </Link>
            </div>
            <div className="md:col-span-2 flex flex-col">
                <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                        <span>{order.type}</span>
                        <Badge variant="secondary">{order.orderId}</Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1"><FileText size={14}/> {order.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                     <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Layers3 size={14}/>
                            <span>{order.filamentType}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14}/>
                            <span>{order.estimatedTime}</span>
                        </div>
                    </div>
                </CardContent>
                <div className="flex justify-end gap-2 p-4 pt-0">
                    {isFarmer && onAcceptOrder ? (
                        <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => onAcceptOrder(order.orderId)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Accept Order
                        </Button>
                    ) : (
                        <Button asChild variant="ghost" size="sm">
                            <Link href={`/orders/${order.orderId}`}>
                                View Details <ArrowRight className="ml-2"/>
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    </Card>
);

const InProgressOrderCard = ({ order, onUpdateProgress }: { order: Order, onUpdateProgress: (order: Order) => void }) => (
     <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-1">
                <OrderFilesPreview 
                    files={order.listOfFilesToPrint || []}
                    className="w-full h-full"
                />
            </div>
            <div className="md:col-span-2 flex flex-col p-4">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="flex justify-between items-start">
                        <span>{order.type}</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">{order.orderId}</Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1"><FileText size={14}/> {order.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow p-0 space-y-4">
                     <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Layers3 size={14}/>
                            <span>{order.filamentType}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14}/>
                            <span>{order.estimatedTime}</span>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor={`progress-${order.orderId}`} className="text-sm">Progress</Label>
                        <Progress value={order.progressPercentage || 0} id={`progress-${order.orderId}`} className="mt-1 h-2"/>
                        <p className="text-xs text-muted-foreground mt-1 text-right">{order.progressPercentage || 0}% complete</p>
                    </div>
                </CardContent>
                 <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" size="sm" onClick={() => onUpdateProgress(order)}>Update Progress</Button>
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/orders/${order.orderId}`}>
                            View Details <ArrowRight className="ml-2"/>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    </Card>
);

const HistoryOrderCard = ({ order }: { order: Order }) => (
    <Card className="overflow-hidden flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 h-48 sm:h-auto">
            <OrderFilesPreview 
                files={order.listOfFilesToPrint || []}
                className="w-full h-full"
            />
        </div>
        <div className="flex-grow p-4">
            <div className="flex justify-between items-start mb-2">
                 <div>
                    <h3 className="font-semibold">{order.type}</h3>
                    <p className="text-sm text-muted-foreground">{order.orderId}</p>
                 </div>
                 <Badge variant={order.status === 'finished' ? 'default' : 'destructive'} className={order.status === 'finished' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {order.status === 'finished' ? 'Completed' : order.status}
                </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{order.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Layers3 size={12}/> {order.filamentType}</div>
                <div className="flex items-center gap-1.5"><Clock size={12}/> {order.estimatedTime}</div>
            </div>
        </div>
    </Card>
);

const UpdateProgressDialog = ({ order, isOpen, onOpenChange, onSave }: { order: Order | null, isOpen: boolean, onOpenChange: (open: boolean) => void, onSave: (orderId: string, newProgress: number) => void }) => {
    const [progress, setProgress] = useState(order?.progressPercentage || 0);
    const { toast } = useToast();

    React.useEffect(() => {
        if (order) {
            setProgress(order.progressPercentage || 0);
        }
    }, [order]);
    
    if (!order) return null;

    const handleSave = () => {
        onSave(order.orderId, progress);
        onOpenChange(false);
        toast({
            title: 'Progress Updated',
            description: `Order ${order.orderId} is now ${progress}% complete.`,
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Progress for {order.orderId}</DialogTitle>
                    <DialogDescription>
                        Use the slider to set the new progress for this print job.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="progress-slider">Progress: </Label>
                        <span className="font-bold text-lg text-primary">{progress}%</span>
                    </div>
                    <Slider
                        id="progress-slider"
                        min={0}
                        max={100}
                        step={1}
                        value={[progress]}
                        onValueChange={(value) => setProgress(value[0])}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save Progress</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function OrdersPage() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const { user } = useUser();
    const isCreator = user?.userType === 'creator';
    
    // Use real-time orders hook
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Functions to replace useRealtimeOrders functionality
    const getOrdersByStatus = (status: string) => {
        return orders.filter(order => order.status === status);
    };

    const updateOrderProgress = async (orderId: string, progress: number) => {
        try {
            await OrderService.updateOrder(orderId, { progressPercentage: progress });
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.orderID === orderId 
                        ? { ...order, progressPercentage: progress }
                        : order
                )
            );
        } catch (error) {
            console.error('Error updating order progress:', error);
        }
    };

    const acceptOrder = async (orderId: string) => {
        try {
            await OrderService.updateOrder(orderId, {
                status: 'accepted',
                assignedFarmerID: user?.id || user?.userId,
                acceptedAt: new Date()
            });
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.orderID === orderId 
                        ? { ...order, status: 'accepted', assignedFarmerID: user?.id || user?.userId }
                        : order
                )
            );
        } catch (error) {
            console.error('Error accepting order:', error);
        }
    };

    // Get orders by status
    const newOrders = getOrdersByStatus('new');
    const inProgressOrders = getOrdersByStatus('in-progress');
    const orderHistory = getOrdersByStatus('history');

    const handleUpdateProgressClick = (order: Order) => {
        setSelectedOrder(order);
        setIsProgressModalOpen(true);
    };

    const handleSaveProgress = async (orderId: string, newProgress: number) => {
        try {
            await updateOrderProgress(orderId, newProgress);
        } catch (err) {
            console.error('Failed to update progress:', err);
        }
    };

    const handleAcceptOrder = async (orderId: string) => {
        try {
            await acceptOrder(orderId);
        } catch (err) {
            console.error('Failed to accept order:', err);
        }
    };

    return (
        <div className="flex-grow bg-grid p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-4xl space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">My Orders</h1>
                        <p className="text-muted-foreground">
                            {isCreator ? 'View and manage your print orders.' : 'Manage incoming print jobs and view your order history.'}
                        </p>
                    </div>
                    {isCreator && (
                        <Button asChild className="flex items-center gap-2">
                            <Link href="/creator/create-order">
                                <Layers3 className="h-4 w-4" />
                                Make a New Order
                            </Link>
                        </Button>
                    )}
                </div>
                
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-3">
                                    <Skeleton className="h-48 w-full" />
                                    <div className="md:col-span-2 p-4 space-y-4">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!loading && !error && (
                    <Tabs defaultValue="new">
                        <TabsList className="grid w-full grid-cols-3 max-w-lg">
                            <TabsTrigger value="new">
                                {isCreator ? 'New Orders' : 'Available Orders'} <Badge className="ml-2">{newOrders.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="in-progress">
                                In Progress <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">{inProgressOrders.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="history">Order History</TabsTrigger>
                        </TabsList>
                    <TabsContent value="new" className="mt-6 space-y-4">
                        {newOrders.map(order => (
                            <NewOrderCard 
                                key={order.orderId} 
                                order={order} 
                                onAcceptOrder={isCreator ? undefined : handleAcceptOrder}
                                isFarmer={!isCreator}
                            />
                        ))}
                        {newOrders.length === 0 && (
                             <Card className="text-center p-12">
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        {isCreator ? 'You have no new orders.' : 'No available orders at the moment.'}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                     <TabsContent value="in-progress" className="mt-6 space-y-4">
                        {inProgressOrders.map(order => <InProgressOrderCard key={order.orderId} order={order} onUpdateProgress={handleUpdateProgressClick} />)}
                        {inProgressOrders.length === 0 && (
                             <Card className="text-center p-12">
                                <CardContent>
                                    <p className="text-muted-foreground">You have no orders in progress.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                    <TabsContent value="history" className="mt-6 space-y-4">
                        {orderHistory.map(order => <HistoryOrderCard key={order.orderId} order={order} />)}
                         {orderHistory.length === 0 && (
                             <Card className="text-center p-12">
                                <CardContent>
                                    <p className="text-muted-foreground">Your order history is empty.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
                )}
            </div>
            <UpdateProgressDialog 
                isOpen={isProgressModalOpen}
                onOpenChange={setIsProgressModalOpen}
                order={selectedOrder}
                onSave={handleSaveProgress}
            />
        </div>
    );
}
