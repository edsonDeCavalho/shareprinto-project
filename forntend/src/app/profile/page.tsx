
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, CreditCard, Edit, Printer, User, Wifi, WifiOff, Trash2, Camera, UploadCloud, X, CalendarIcon, UserCircle, PlusCircle, FileText, Shield, Cookie } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { getAvailableBrands, getModelsForBrand, getModelDetails } from '@/lib/printer-data';


const ProfileHeader = () => {
    const { toast } = useToast();
    const { user, refreshUser } = useUser();
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "https://placehold.co/128x128");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    variant: 'destructive',
                    title: 'File too large',
                    description: 'Please upload an image smaller than 5MB.',
                });
                return;
            }

            setUploadingAvatar(true);

            try {
                // Convert file to base64
            const reader = new FileReader();
                reader.onload = async (event) => {
                if (event.target?.result) {
                        const base64Image = event.target.result as string;
                        
                        // Update avatar in backend
                        const response = await fetch('/api/auth/update-avatar', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                phone: user?.phone,
                                avatar: base64Image,
                            }),
                        });

                        if (response.ok) {
                            setAvatarUrl(base64Image);
                            
                            // Update user data in localStorage and refresh context
                            const updatedUser = {
                                ...user,
                                avatar: base64Image,
                            };
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                            refreshUser();

                    toast({
                        title: 'Profile Picture Updated',
                        description: 'Your new picture has been saved.',
                    });
                        } else {
                            throw new Error('Failed to update avatar');
                        }
                }
            };
            reader.readAsDataURL(file);
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Upload Failed',
                    description: error.message || 'Failed to upload profile picture. Please try again.',
                });
            } finally {
                setUploadingAvatar(false);
            }
        }
    };

    return (
        <div className="w-full">
            <div className="px-4 sm:px-6 md:px-8 pb-8">
                <div className="flex items-center space-x-5 pt-8">
                    <div className="relative group">
                         <Avatar className="h-32 w-32 border-4 border-background">
                            <AvatarImage src={avatarUrl} alt="User" />
                            <AvatarFallback>
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <Button
                            size="icon"
                            variant="outline"
                            className="absolute bottom-2 right-2 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 bg-background/70 transition-opacity"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                        >
                            {uploadingAvatar ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                            ) : (
                            <Edit size={20} />
                            )}
                            <span className="sr-only">Edit profile picture</span>
                        </Button>
                    </div>
                    <div className="pb-4">
                        <h1 className="text-2xl font-bold font-headline">
                            {user?.firstName} {user?.lastName}
                        </h1>
                        <p className="text-muted-foreground">
                            {user?.userType === 'farmer' ? 'Farmer' : 'Creator'} • Joined {user?.latSeenAt ? new Date(user.latSeenAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                        </p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
            </div>
        </div>
    )
};

const MyInfoTab = () => {
    const { toast } = useToast();
    const { user, refreshUser } = useUser();
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        country: user?.country || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        zipCode: user?.zipCode || '',
    });
    const [loading, setLoading] = useState(false);

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                country: user.country || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                zipCode: user.zipCode || '',
            });
        }
    }, [user]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: value
            };
            
            // Clear city when country changes
            if (field === 'country') {
                newData.city = '';
            }
            
            return newData;
        });
    };

    const handleSaveChanges = async () => {
        if (!user?.phone) {
            toast({
                title: 'Error',
                description: 'User phone number not found.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            // Update name
            if (formData.firstName !== user.firstName || formData.lastName !== user.lastName) {
                const nameResponse = await fetch('/api/auth/update-name', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: user.phone,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                    }),
                });

                if (!nameResponse.ok) {
                    throw new Error('Failed to update name');
                }
            }

            // Update email
            if (formData.email !== user.email) {
                const emailResponse = await fetch('/api/auth/update-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: user.phone,
                        email: formData.email,
                    }),
                });

                if (!emailResponse.ok) {
                    throw new Error('Failed to update email');
                }
            }

            // Update location information
            const locationResponse = await fetch('/api/auth/update-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: user.phone,
                    address: formData.address,
                    country: formData.country,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                }),
            });

            if (!locationResponse.ok) {
                throw new Error('Failed to update location');
            }

            // Update the user data in localStorage and refresh the context
            const updatedUser = {
                ...user,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                address: formData.address,
                country: formData.country,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
            };
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            refreshUser();

        toast({
            title: 'Information Updated',
                description: 'Your personal information has been saved successfully.',
            });

        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error.message || 'Failed to update information. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><User size={20}/> Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                            id="firstName" 
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                            id="lastName" 
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                            id="phone" 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="country">Country</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="France">France</SelectItem>
                                <SelectItem value="Germany">Germany</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="address">Address</Label>
                        <Input 
                            id="address" 
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="city">City</Label>
                        <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your city" />
                            </SelectTrigger>
                            <SelectContent>
                                {formData.country === 'France' && (
                                    <>
                                        <SelectItem value="Paris">Paris</SelectItem>
                                        <SelectItem value="Lyon">Lyon</SelectItem>
                                        <SelectItem value="Marseille">Marseille</SelectItem>
                                        <SelectItem value="Nice">Nice</SelectItem>
                                        <SelectItem value="Nantes">Nantes</SelectItem>
                                        <SelectItem value="Strasbourg">Strasbourg</SelectItem>
                                        <SelectItem value="Toulouse">Toulouse</SelectItem>
                                        <SelectItem value="Bordeaux">Bordeaux</SelectItem>
                                        <SelectItem value="Lille">Lille</SelectItem>
                                        <SelectItem value="Rennes">Rennes</SelectItem>
                                    </>
                                )}
                                {formData.country === 'Germany' && (
                                    <>
                                        <SelectItem value="Berlin">Berlin</SelectItem>
                                        <SelectItem value="Munich">Munich</SelectItem>
                                        <SelectItem value="Hamburg">Hamburg</SelectItem>
                                        <SelectItem value="Cologne">Cologne</SelectItem>
                                        <SelectItem value="Frankfurt">Frankfurt</SelectItem>
                                        <SelectItem value="Stuttgart">Stuttgart</SelectItem>
                                        <SelectItem value="Düsseldorf">Düsseldorf</SelectItem>
                                        <SelectItem value="Dortmund">Dortmund</SelectItem>
                                        <SelectItem value="Essen">Essen</SelectItem>
                                        <SelectItem value="Leipzig">Leipzig</SelectItem>
                                    </>
                                )}
                                {!formData.country && (
                                    <SelectItem value="placeholder" disabled>Please select a country first</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="state">State/Province</Label>
                        <Input 
                            id="state" 
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                        <Input 
                            id="zipCode" 
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="userType">User Type</Label>
                        <Input id="userType" value={user?.userType || ''} disabled />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="score">Score</Label>
                        <Input id="score" value={user?.score?.toString() || '0'} disabled />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="status">Online Status</Label>
                        <Input id="status" value={user?.online ? 'Online' : 'Offline'} disabled />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="available">Availability</Label>
                        <Input id="available" value={user?.available ? 'Available' : 'Unavailable'} disabled />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="activated">Account Status</Label>
                        <Input id="activated" value={user?.activated ? 'Activated' : 'Pending'} disabled />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="lastSeen">Last Seen</Label>
                        <Input id="lastSeen" value={user?.latSeenAt ? new Date(user.latSeenAt).toLocaleString() : 'Never'} disabled />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="userId">User ID</Label>
                        <Input id="userId" value={user?.userId || ''} disabled />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSaveChanges} disabled={loading}>
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Edit size={16} className="mr-2"/>
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const initialPrinters = [
    { id: 1, name: 'Prusa MK4', type: 'FDM Printer', status: 'Online', image: 'https://placehold.co/600x400', photos: ['https://placehold.co/600x400', 'https://placehold.co/600x400', 'https://placehold.co/600x400'], dimensions: { w: '250', d: '210', h: '220' } },
    { id: 2, name: 'Formlabs Form 3+', type: 'SLA Printer', status: 'Online', image: 'https://placehold.co/600x400', photos: ['https://placehold.co/600x400', 'https://placehold.co/600x400', 'https://placehold.co/600x400'], dimensions: { w: '145', d: '145', h: '185' } },
    { id: 3, name: 'Creality Ender 3', type: 'FDM Printer', status: 'Offline', image: 'https://placehold.co/600x400', photos: ['https://placehold.co/600x400', 'https://placehold.co/600x400', 'https://placehold.co/600x400'], dimensions: { w: '220', d: '220', h: '250' } },
];
type PrinterType = typeof initialPrinters[0];
type NewPrinterType = Omit<PrinterType, 'id'>;


const MyPrintersTab = () => {
    const { toast } = useToast();
    const { user, refreshUser } = useUser();
    const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEditClick = (printer: any) => {
        setSelectedPrinter(printer);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (printerId: string) => {
        if (!user?.phone) {
            toast({
                title: 'Error',
                description: 'User phone number not found.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/delete-printer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: user.phone,
                    printerId: printerId,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Update user data in localStorage and refresh context
                const updatedUser = {
                    ...user,
                    printers: result.user.printers,
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                refreshUser();

                toast({ 
                    title: 'Printer Deleted', 
                    description: 'The printer has been removed from your profile.'
                });
            } else {
                throw new Error(result.message || 'Failed to delete printer');
            }
        } catch (error: any) {
            toast({
                title: 'Delete Failed',
                description: error.message || 'Failed to delete printer. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChanges = async (updatedPrinter: any) => {
        if (!user?.phone) {
            toast({
                title: 'Error',
                description: 'User phone number not found.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/update-printer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: user.phone,
                    printerId: updatedPrinter.printerId,
                    printer: {
                        printerBrand: updatedPrinter.printerBrand,
                        printerModel: updatedPrinter.printerModel,
                        buildVolume: updatedPrinter.buildVolume,
                        multiColor: updatedPrinter.multiColor,
                    },
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Update user data in localStorage and refresh context
                const updatedUser = {
                    ...user,
                    printers: result.user.printers,
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                refreshUser();

        setIsEditModalOpen(false);
                toast({ 
                    title: 'Success!', 
                    description: 'Your printer has been updated.'
                });
            } else {
                throw new Error(result.message || 'Failed to update printer');
            }
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error.message || 'Failed to update printer. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddPrinter = async (newPrinterData: any) => {
        if (!user?.phone) {
            toast({
                title: 'Error',
                description: 'User phone number not found.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/add-printer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: user.phone,
                    printer: {
                        printerBrand: newPrinterData.printerBrand,
                        printerModel: newPrinterData.printerModel,
                        buildVolume: newPrinterData.buildVolume,
                        multiColor: newPrinterData.multiColor,
                        online: newPrinterData.online,
                    },
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Update user data in localStorage and refresh context
                const updatedUser = {
                    ...user,
                    printers: result.user.printers,
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                refreshUser();

        setIsAddModalOpen(false);
                toast({ 
                    title: 'Printer Added!', 
                    description: `${newPrinterData.printerBrand} ${newPrinterData.printerModel} has been added to your profile.`
                });
            } else {
                throw new Error(result.message || 'Failed to add printer');
            }
        } catch (error: any) {
            toast({
                title: 'Add Failed',
                description: error.message || 'Failed to add printer. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleOnline = async (printerId: string, online: boolean) => {
        if (!user?.phone) {
            toast({
                title: 'Error',
                description: 'User phone number not found.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const response = await fetch('/api/auth/toggle-printer-online', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: user.phone,
                    printerId: printerId,
                    online: online,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Update user data in localStorage and refresh context
                const updatedUser = {
                    ...user,
                    printers: result.user.printers,
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                refreshUser();

                toast({ 
                    title: 'Status Updated!', 
                    description: `Printer ${online ? 'set online' : 'set offline'} successfully.`
                });
            } else {
                throw new Error(result.message || 'Failed to update printer status');
            }
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error.message || 'Failed to update printer status. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Printer size={20}/> My Printers</CardTitle>
                </CardHeader>
                <CardContent>
                    {user?.userType === 'farmer' && user?.printers && user.printers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {user.printers.map((printer: any, index: number) => (
                                <Card key={index} className="hover:shadow-lg transition-shadow">
                                    <div className="h-48 bg-secondary rounded-t-lg flex items-center justify-center relative">
                                        <Printer className="h-12 w-12 text-muted-foreground" />
                                        <div className="absolute top-2 right-2">
                                            <Badge variant={printer.online ? "default" : "secondary"}>
                                                {printer.online ? "Online" : "Offline"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold">{printer.printerBrand} {printer.printerModel}</h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(printer);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Build Volume: {printer.buildVolume}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {printer.multiColor ? 'Multi-color' : 'Single-color'}
                                        </p>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                            <span className="text-sm text-muted-foreground">Status:</span>
                                            <Switch
                                                checked={printer.online || false}
                                                onCheckedChange={(checked) => handleToggleOnline(printer.printerId, checked)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : user?.userType === 'farmer' ? (
                        <div className="text-center py-8">
                            <Printer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No printers added yet.</p>
                            <p className="text-sm text-muted-foreground">Add your first printer to start accepting orders.</p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Printer management is only available for farmers.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            {user?.userType === 'farmer' && (
            <div className="flex justify-end">
                    <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Loading...
                            </>
                        ) : (
                            <>
                    <PlusCircle className="mr-2"/> Add New Printer
                            </>
                        )}
                </Button>
            </div>
            )}
            {selectedPrinter && (
                 <EditPrinterDialog 
                    isOpen={isEditModalOpen} 
                    onOpenChange={setIsEditModalOpen} 
                    printer={selectedPrinter}
                    onSave={handleSaveChanges}
                    onDelete={(printerId: string) => handleDelete(printerId)}
                />
            )}
            <AddPrinterDialog 
                isOpen={isAddModalOpen} 
                onOpenChange={setIsAddModalOpen} 
                onSave={handleAddPrinter}
            />
        </div>
    );
};

const AddPrinterDialog = ({ isOpen, onOpenChange, onSave } : {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    onSave: (printer: any) => void,
}) => {
    const [newPrinter, setNewPrinter] = useState({
        printerBrand: '',
        printerModel: '',
        buildVolume: '',
        multiColor: false,
        online: true // Default to online when adding a new printer
    });
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [availableModels, setAvailableModels] = useState<any[]>([]);

     useEffect(() => {
        if (!isOpen) {
             setNewPrinter({
                printerBrand: '',
                printerModel: '',
                buildVolume: '',
                multiColor: false,
                online: true
            });
            setSelectedBrand('');
            setSelectedModel('');
            setAvailableModels([]);
        }
    }, [isOpen]);

    const handleBrandChange = (brand: string) => {
        setSelectedBrand(brand);
        setSelectedModel('');
        setNewPrinter({
            ...newPrinter,
            printerBrand: brand,
            printerModel: '',
            buildVolume: '',
            multiColor: false
        });
        setAvailableModels(getModelsForBrand(brand));
    };

    const handleModelChange = (modelName: string) => {
        setSelectedModel(modelName);
        const modelDetails = getModelDetails(selectedBrand, modelName);
        if (modelDetails) {
            setNewPrinter({
                ...newPrinter,
                printerModel: modelName,
                buildVolume: modelDetails.build_volume,
                multiColor: modelDetails.multi_color
            });
        }
    };

    const handleSave = () => {
        // Basic validation
        if (!newPrinter.printerBrand || !newPrinter.printerModel || !newPrinter.buildVolume) {
            alert("Please fill in all required fields.");
            return;
        }
        onSave(newPrinter);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add a New Printer</DialogTitle>
                    <DialogDescription>
                        Enter your printer's information below.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPrinterBrand">Printer Brand</Label>
                        <Select value={selectedBrand} onValueChange={handleBrandChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a printer brand" />
                            </SelectTrigger>
                            <SelectContent>
                                {getAvailableBrands().map((brand) => (
                                    <SelectItem key={brand} value={brand}>
                                        {brand}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="newPrinterModel">Printer Model</Label>
                        <Select value={selectedModel} onValueChange={handleModelChange} disabled={!selectedBrand}>
                            <SelectTrigger>
                                <SelectValue placeholder={selectedBrand ? "Select a model" : "Select a brand first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableModels.map((model) => (
                                    <SelectItem key={model.model} value={model.model}>
                                        <div className="flex flex-col">
                                            <span>{model.model}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {model.build_volume} • {model.multi_color ? 'Multi-color' : 'Single-color'}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="newBuildVolume">Build Volume</Label>
                        <Input 
                            id="newBuildVolume" 
                            placeholder="e.g., 250x210x220mm" 
                            value={newPrinter.buildVolume} 
                            onChange={e => setNewPrinter({...newPrinter, buildVolume: e.target.value})} 
                            readOnly={!!selectedModel}
                        />
                    </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="new-multiColor-switch" className="flex flex-col space-y-1">
                            <span>Multi-Color Support</span>
                            <span className={cn("text-xs font-normal", newPrinter.multiColor ? 'text-green-600' : 'text-muted-foreground')}>
                                {newPrinter.multiColor ? 'Yes' : 'No'}
                            </span>
                            </Label>
                            <Switch
                            id="new-multiColor-switch"
                            checked={newPrinter.multiColor}
                            onCheckedChange={checked => setNewPrinter({...newPrinter, multiColor: checked})}
                        />
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t">
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Add Printer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const EditPrinterDialog = ({ isOpen, onOpenChange, printer, onSave, onDelete } : {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    printer: any,
    onSave: (printer: any) => void,
    onDelete: (printerId: string) => void,
}) => {
    const [editedPrinter, setEditedPrinter] = useState(printer);
    const [selectedBrand, setSelectedBrand] = useState(printer.printerBrand || '');
    const [selectedModel, setSelectedModel] = useState(printer.printerModel || '');
    const [availableModels, setAvailableModels] = useState<any[]>([]);

    useEffect(() => {
        setEditedPrinter(printer);
        setSelectedBrand(printer.printerBrand || '');
        setSelectedModel(printer.printerModel || '');
        if (printer.printerBrand) {
            setAvailableModels(getModelsForBrand(printer.printerBrand));
        }
    }, [printer]);

    const handleBrandChange = (brand: string) => {
        setSelectedBrand(brand);
        setSelectedModel('');
        setEditedPrinter({
            ...editedPrinter,
            printerBrand: brand,
            printerModel: '',
            buildVolume: '',
            multiColor: false
        });
        setAvailableModels(getModelsForBrand(brand));
    };

    const handleModelChange = (modelName: string) => {
        setSelectedModel(modelName);
        const modelDetails = getModelDetails(selectedBrand, modelName);
        if (modelDetails) {
            setEditedPrinter({
                ...editedPrinter,
                printerModel: modelName,
                buildVolume: modelDetails.build_volume,
                multiColor: modelDetails.multi_color
            });
        }
    };

    const handleSave = () => {
        onSave(editedPrinter);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Printer: {printer.printerBrand} {printer.printerModel}</DialogTitle>
                    <DialogDescription>
                        Update your printer's information below.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="printerBrand">Printer Brand</Label>
                        <Select value={selectedBrand} onValueChange={handleBrandChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a printer brand" />
                            </SelectTrigger>
                            <SelectContent>
                                {getAvailableBrands().map((brand) => (
                                    <SelectItem key={brand} value={brand}>
                                        {brand}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="printerModel">Printer Model</Label>
                        <Select value={selectedModel} onValueChange={handleModelChange} disabled={!selectedBrand}>
                            <SelectTrigger>
                                <SelectValue placeholder={selectedBrand ? "Select a model" : "Select a brand first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableModels.map((model) => (
                                    <SelectItem key={model.model} value={model.model}>
                                        <div className="flex flex-col">
                                            <span>{model.model}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {model.build_volume} • {model.multi_color ? 'Multi-color' : 'Single-color'}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="buildVolume">Build Volume</Label>
                        <Input 
                            id="buildVolume" 
                            value={editedPrinter.buildVolume || ''} 
                            onChange={e => setEditedPrinter({...editedPrinter, buildVolume: e.target.value})} 
                            placeholder="e.g., 250x210x220mm"
                            readOnly={!!selectedModel}
                        />
                    </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="multiColor-switch" className="flex flex-col space-y-1">
                            <span>Multi-Color Support</span>
                            <span className={cn("text-xs font-normal", editedPrinter.multiColor ? 'text-green-600' : 'text-muted-foreground')}>
                                {editedPrinter.multiColor ? 'Yes' : 'No'}
                            </span>
                            </Label>
                            <Switch
                            id="multiColor-switch"
                            checked={editedPrinter.multiColor || false}
                            onCheckedChange={checked => setEditedPrinter({...editedPrinter, multiColor: checked})}
                        />
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t sm:justify-between gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive"><Trash2 /> Delete Printer</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this printer from your profile.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(printer.printerId)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <div className="flex gap-2">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const AddPaymentMethodDialog = ({ onAdd }: { onAdd: (method: any) => void }) => {
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'paypal' | null>(null);
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            type: 'Visa',
            last4: '4321', // Mock data
            expiry: '10/2028',
            primary: false
        });
        toast({ title: 'Success!', description: 'New credit card has been added.'});
        setIsOpen(false);
        setSelectedMethod(null);
    };

    const handleConnectPayPal = () => {
        onAdd({
            type: 'PayPal',
            email: 'alex.doe@example.com', // Mock data
            primary: false
        });
        toast({ title: 'Success!', description: 'Your PayPal account has been connected.'});
        setIsOpen(false);
        setSelectedMethod(null);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>+ Add Payment Method</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a new payment method</DialogTitle>
                    <DialogDescription>
                        Choose how you'd like to pay for your print jobs.
                    </DialogDescription>
                </DialogHeader>

                {!selectedMethod ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setSelectedMethod('card')}>
                            <CreditCard className="h-8 w-8"/>
                            <span>Credit Card</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setSelectedMethod('paypal')}>
                             <svg role="img" viewBox="0 0 24 24" className="h-8 w-8"><path fill="currentColor" d="M7.422 21.726h2.934l.43-2.682.164-1.025.022-.133c.044-.267.11-.645.2-1.134a8.17 8.17 0 0 1 .598-1.873c.288-.598.644-1.107 1.066-1.528.422-.422.9-.756 1.433-.967.533-.233 1.1-.344 1.71-.344 1.288 0 2.256.39 2.903 1.17.644.757.966 1.802.966 3.136 0 .4-.056.778-.167 1.133-.11.356-.29.634-.533.834-.244.2-.54.3-.888.3-.38 0-.68-.11-.898-.332a.93.93 0 0 1-.378-.855c0-.4.122-.756.366-1.066.245-.31.58-.467.99-.467.42 0 .765.133.99.4.244.267.366.6.366 1.022 0 .51-.178.966-.534 1.366-.355.4-.81.6-1.365.6-.612 0-1.157-.2-1.634-.6-.477-.4-.822-.988-1.033-1.765l-.488 3.02h-2.81l.89-5.592c.11-.733.222-1.31.333-1.732.11-.422.167-.734.167-.934 0-.4-.11-.733-.333-.999-.222-.267-.533-.4-.933-.4-.533 0-1.01.21-1.433.632-.422.422-.633 1.033-.633 1.832 0 .31.022.69.066 1.134.045.444.123.988.234 1.633l.489 2.954zM6.16 2.274h6.08c1.455 0 2.64.444 3.555 1.333.91 1.11 1.365 2.5 1.365 4.167 0 1.3-.267 2.455-.8 3.466-.533 1.01-1.333 1.777-2.4 2.3-1.066.522-2.31.788-3.732.788h-1.2l-.49 3.044H5.16l2.556-15.82h-.8L6.16 2.273zm3.222 7.733h.588c.88 0 1.6-.2 2.166-.6.566-.4 1-1.01 1.266-1.832.267-.822.4-1.71.4-2.667 0-.955-.133-1.7-.4-2.232a2.03 2.03 0 0 0-1.01-.845c-.467-.177-1.023-.266-1.668-.266H8.2l-1.123 6.955.056.388h2.022v-.3z"/></svg>
                            <span>PayPal</span>
                        </Button>
                    </div>
                ) : selectedMethod === 'card' ? (
                     <form onSubmit={handleAddCard} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="cardNumber" placeholder="0000 0000 0000 0000" className="pl-10" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                 <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="expiryDate" placeholder="MM / YY" className="pl-10" required />
                                 </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="cvc">CVC</Label>
                                <Input id="cvc" placeholder="123" required />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="cardName">Name on Card</Label>
                             <div className="relative">
                                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="cardName" placeholder="Alex Doe" className="pl-10" required />
                             </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setSelectedMethod(null)}>Back</Button>
                            <Button type="submit">Add Card</Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="py-4 text-center space-y-4">
                        <p>You will be redirected to PayPal to connect your account.</p>
                        <DialogFooter>
                             <Button type="button" variant="ghost" onClick={() => setSelectedMethod(null)}>Back</Button>
                            <Button onClick={handleConnectPayPal}>Continue to PayPal</Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

const PaymentMethodsTab = () => {
    const { toast } = useToast();
    const [paymentMethods, setPaymentMethods] = useState([
        { type: 'Visa', last4: '1234', expiry: '12/2025', primary: true },
        { type: 'PayPal', last4: '5678', expiry: '08/2026', primary: false },
    ]);

    const addPaymentMethod = (method: any) => {
        // @ts-ignore
        setPaymentMethods(prev => [...prev, method]);
    };
    
    return (
    <div className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard size={20}/> Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {paymentMethods.map((method, index) => (
                    <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                             <Image 
                                src={method.type === 'PayPal' ? '/iconsImages/Paypal2.png' : '/iconsImages/Visa.webp'} 
                                alt={method.type} 
                                width={48} 
                                height={32} 
                                className="object-contain"
                            />
                            <div>
                                <p className="font-medium">{method.type} ending in {method.last4}</p>
                                <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                            </div>
                        </div>
                         {method.primary ? (
                             <div className="flex items-center gap-2 text-green-600 text-sm">
                                <CheckCircle size={16} /> Primary
                            </div>
                         ) : (
                            <Button variant="outline" size="sm">Set as primary</Button>
                         )}
                    </div>
                ))}
            </CardContent>
        </Card>
        <div className="flex justify-end">
            <AddPaymentMethodDialog onAdd={addPaymentMethod} />
        </div>
    </div>
    )
};

const LegalTab = () => {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText size={20}/> Legal Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4">
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div>
                                        <h3 className="font-semibold">General Conditions of Use</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Terms and conditions governing the use of SharePrinto platform
                                        </p>
                                    </div>
                                </div>
                                <Link href="/general-conditions">
                                    <Button variant="outline" size="sm">
                                        View Document
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-8 w-8 text-primary" />
                                    <div>
                                        <h3 className="font-semibold">Privacy Policy</h3>
                                        <p className="text-sm text-muted-foreground">
                                            How we collect, use, and protect your personal information
                                        </p>
                                    </div>
                                </div>
                                <Link href="/privacy-policy">
                                    <Button variant="outline" size="sm">
                                        View Document
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Cookie className="h-8 w-8 text-primary" />
                                    <div>
                                        <h3 className="font-semibold">Cookie Policy</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Information about cookies and how we use them
                                        </p>
                                    </div>
                                </div>
                                <Link href="/cookie-policy">
                                    <Button variant="outline" size="sm">
                                        View Document
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default function ProfilePage() {
  const { user } = useUser();
  const isFarmer = user?.userType === 'farmer';
  
  return (
    <div className="flex-grow bg-grid">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
            <ProfileHeader />
            <Separator />
            <div className="p-4 sm:p-6 md:p-8">
                <Tabs defaultValue={isFarmer ? "printers" : "info"}>
                    <TabsList className={`grid w-full ${isFarmer ? 'grid-cols-4' : 'grid-cols-3'}`}>
                        <TabsTrigger value="info">My Info</TabsTrigger>
                        {isFarmer && <TabsTrigger value="printers">My Printers</TabsTrigger>}
                        <TabsTrigger value="payment">Payment</TabsTrigger>
                        <TabsTrigger value="legal">Legal</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="mt-6">
                        <MyInfoTab />
                    </TabsContent>
                    {isFarmer && (
                        <TabsContent value="printers" className="mt-6">
                            <MyPrintersTab />
                        </TabsContent>
                    )}
                    <TabsContent value="payment" className="mt-6">
                        <PaymentMethodsTab />
                    </TabsContent>
                    <TabsContent value="legal" className="mt-6">
                        <LegalTab />
                    </TabsContent>
                </Tabs>
            </div>
        </Card>
      </div>
    </div>
  );
}
