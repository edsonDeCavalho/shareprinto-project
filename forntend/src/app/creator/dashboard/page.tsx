'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, FileText, Clock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { OrderService, type Order } from '@/services/orderService';
import { FarmerService, type FarmerInfo } from '@/services/farmerService';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { FarmerAcceptancePopup } from '@/components/farmer-acceptance-popup';
import { FarmerLocation } from '@/services/farmerService';

// Helper function to get status display name
const getStatusDisplayName = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'Pending Acceptance';
    case 'in_progress':
      return 'Printing';
    case 'finished':
      return 'Completed';
    case 'paused':
      return 'Paused';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

// Helper function to get status color
const getStatusColor = (status: string) => {
    switch (status) {
    case 'accepted':
      return 'bg-yellow-100 text-yellow-800';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800';
        case 'finished':
            return 'bg-green-100 text-green-800';
        case 'paused':
            return 'bg-orange-100 text-orange-800';
    case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function CreatorDashboardPage() {
    const { user, isAuthenticated } = useUser();
    const { toast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState<FarmerInfo | null>(null);
  const [showFarmerPopup, setShowFarmerPopup] = useState(false);

    // Fetch orders for the current user
        const fetchOrders = async () => {
    if (!user?.id && !user?.userId) {
      console.log('No user ID available for fetching orders');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
      const userId = user.id || user.userId;
      console.log('Fetching orders for user:', userId);
      
      const userOrders = await OrderService.getOrdersByCreator(userId);
      console.log('Fetched orders:', userOrders);
      
                setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
                toast({
                    title: "Error",
        description: "Failed to fetch orders. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

  // Fetch orders on component mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
        fetchOrders();
    }
    }, [user, isAuthenticated, toast]);

    // Categorize orders
    const pendingOrders = orders.filter(order => order.status === 'accepted' && !order.assignedFarmerID);
    const activeOrders = orders.filter(order => order.status === 'in_progress' || (order.status === 'accepted' && order.assignedFarmerID));
    const completedOrders = orders.filter(order => order.status === 'finished');

  // Handle farmer selection
  const handleFarmerSelect = async (farmer: FarmerInfo) => {
    setSelectedFarmer(farmer);
    setShowFarmerPopup(true);
  };

  // Handle farmer acceptance
  const handleFarmerAcceptance = async (orderId: string, farmerId: string) => {
    try {
      await OrderService.updateOrder(orderId, {
        assignedFarmerID: farmerId,
        status: 'accepted',
        acceptedAt: new Date()
      });

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderID === orderId 
            ? { ...order, assignedFarmerID: farmerId, status: 'accepted' }
            : order
        )
      );

      toast({
        title: "Order Assigned",
        description: "The order has been successfully assigned to the farmer.",
      });

      setShowFarmerPopup(false);
      setSelectedFarmer(null);
    } catch (error) {
      console.error('Error assigning order:', error);
      toast({
        title: "Error",
        description: "Failed to assign order. Please try again.",
        variant: "destructive",
      });
    }
  };

    if (!isAuthenticated) {
        return (
      <div className="container mx-auto px-4 py-8">
                    <Card className="text-center p-12">
                        <CardContent>
            <h1 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h1>
            <Link href="/signin">
              <Button>Sign In</Button>
            </Link>
                        </CardContent>
                    </Card>
            </div>
        );
    }

    return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
        <p className="text-gray-600">Manage your 3D printing orders</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Welcome back, <span className="font-semibold">{user?.firstName} {user?.lastName}</span>
            </div>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild size="lg">
                            <Link href="/creator/create-order">
                                <PlusCircle className="mr-2" /> Create New Order
                            </Link>
                        </Button>
          </div>
                    </div>
                </div>
                
                {loading ? (
                    <Card className="text-center p-12">
                        <CardContent>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading your orders...</p>
                        </CardContent>
                    </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {orders.length === 0 ? (
                    <Card className="text-center p-12">
                        <CardContent>
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">Create your first 3D printing order to get started.</p>
                  <Link href="/creator/create-order">
                    <Button>
                      <PlusCircle className="mr-2" /> Create Order
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.orderID} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.orderID}</CardTitle>
                          <CardDescription>
                            Created {new Date(order.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusDisplayName(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {order.description && (
                          <p className="text-sm text-gray-600">{order.description}</p>
                        )}
                        
                        {order.assignedFarmerID && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            <span>Assigned to Farmer: {order.assignedFarmerID}</span>
                          </div>
                        )}

                        {order.progressPercentage !== undefined && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{order.progressPercentage}%</span>
                            </div>
                            <Progress value={order.progressPercentage} className="h-2" />
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Link href={`/orders/${order.orderID}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                          {order.status === 'accepted' && !order.assignedFarmerID && (
                            <Button 
                              size="sm"
                              onClick={() => handleFarmerSelect({ id: 'temp-farmer', name: 'Available Farmer' } as FarmerInfo)}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Assign Farmer
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <Card className="text-center p-12">
                <CardContent>
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No pending orders</h3>
                  <p className="text-gray-600">Orders waiting for farmer acceptance will appear here.</p>
                        </CardContent>
                    </Card>
                ) : (
              <div className="grid gap-4">
                {pendingOrders.map((order) => (
                  <Card key={order.orderID} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.orderID}</CardTitle>
                          <CardDescription>
                            Created {new Date(order.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusDisplayName(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {order.description && (
                          <p className="text-sm text-gray-600">{order.description}</p>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                          <Link href={`/orders/${order.orderID}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                          <Button 
                            size="sm"
                            onClick={() => handleFarmerSelect({ id: 'temp-farmer', name: 'Available Farmer' } as FarmerInfo)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Assign Farmer
                                        </Button>
                        </div>
                      </div>
                                    </CardContent>
                                </Card>
                ))}
              </div>
                            )}
                        </TabsContent>
                        
          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
                                <Card className="text-center p-12">
                                    <CardContent>
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No active orders</h3>
                  <p className="text-gray-600">Orders currently being printed will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeOrders.map((order) => (
                  <Card key={order.orderID} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.orderID}</CardTitle>
                          <CardDescription>
                            Created {new Date(order.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusDisplayName(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {order.description && (
                          <p className="text-sm text-gray-600">{order.description}</p>
                        )}
                        
                        {order.assignedFarmerID && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            <span>Assigned to Farmer: {order.assignedFarmerID}</span>
                          </div>
                        )}

                        {order.progressPercentage !== undefined && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{order.progressPercentage}%</span>
                            </div>
                            <Progress value={order.progressPercentage} className="h-2" />
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Link href={`/orders/${order.orderID}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                                    </CardContent>
                                </Card>
                ))}
              </div>
                            )}
                        </TabsContent>
                        
          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
                                <Card className="text-center p-12">
                                    <CardContent>
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No completed orders</h3>
                  <p className="text-gray-600">Finished orders will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {completedOrders.map((order) => (
                  <Card key={order.orderID} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.orderID}</CardTitle>
                          <CardDescription>
                            Created {new Date(order.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusDisplayName(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {order.description && (
                          <p className="text-sm text-gray-600">{order.description}</p>
                        )}
                        
                        {order.assignedFarmerID && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            <span>Assigned to Farmer: {order.assignedFarmerID}</span>
                          </div>
                        )}

                        {order.completedAt && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Clock className="h-4 w-4" />
                            <span>Completed {new Date(order.completedAt).toLocaleDateString()}</span>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Link href={`/orders/${order.orderID}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                                    </CardContent>
                                </Card>
                ))}
              </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}

        {/* Farmer Acceptance Popup */}
      {showFarmerPopup && selectedFarmer && (
            <FarmerAcceptancePopup
          farmer={selectedFarmer}
          onAccept={(orderId) => handleFarmerAcceptance(orderId, selectedFarmer.id)}
          onClose={() => {
            setShowFarmerPopup(false);
            setSelectedFarmer(null);
          }}
            />
        )}
    </div>
    );
}