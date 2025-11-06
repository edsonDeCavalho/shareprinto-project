
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Map } from "@/components/map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, Star, Info, Printer, X } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FarmerService, type FarmerLocation } from '@/services/farmerService';
import { Suspense } from 'react';

type Farmer = FarmerLocation & { reviews?: number };

function MapSearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mapCenter, setMapCenter] = React.useState({ lat: 48.8566, lng: 2.3522 });
    const [mapZoom, setMapZoom] = React.useState(10);
    const [selectedFarmerId, setSelectedFarmerId] = React.useState<string | number | null>(null);
    const [infoFarmer, setInfoFarmer] = React.useState<Farmer | null>(null);
    const [farmers, setFarmers] = React.useState<Farmer[]>([]);
    const city = searchParams.get('city') || 'Paris';

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            const results = await FarmerService.getFarmersByCity(city);
            if (!mounted) return;
            // Add mock reviews and distance if missing
            const enriched = results.map(f => ({
                ...f,
                reviews: Math.floor(10 + Math.random() * 50),
                distance: f.distance || Math.round((Math.random() * 5 + 0.5) * 10) / 10,
            }));
            setFarmers(enriched);
            if (enriched.length > 0 && enriched[0].lat && enriched[0].lng) {
                setMapCenter({ lat: enriched[0].lat!, lng: enriched[0].lng! });
            }
        })();
        return () => { mounted = false; };
    }, [city]);

    const handleFarmerClick = (farmer: Farmer) => {
        setMapCenter({ lat: farmer.lat, lng: farmer.lng });
        setMapZoom(14);
        setSelectedFarmerId(farmer.id);
    };
    
    const handleInfoClick = (farmer: Farmer) => {
        setInfoFarmer(farmer);
    };

    const handleChooseFarmer = (farmer: Farmer) => {
        // In a real app, this would involve checking auth and creating an order.
        // For now, we'll redirect to a creator signup page.
        router.push(`/creator-signup?farmerId=${farmer.id}`);
    };

    return (
        <>
            <div className="flex-grow flex flex-col">
                <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold font-headline">Find a Printer</h1>
                            <p className="text-muted-foreground">Search for available 3D printers near you.</p>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Enter a city or zip code..." className="pl-10" />
                        </div>
                    </div>

                    <div className="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 h-[70vh] lg:h-auto">
                           <Map farmers={farmers} center={mapCenter} zoom={mapZoom} selectedFarmerId={selectedFarmerId} />
                        </div>
                        <div className="lg:col-span-2 flex flex-col h-[70vh] lg:h-auto">
                            <Card className="flex-grow flex flex-col overflow-hidden">
                                <CardHeader>
                                    <CardTitle>Available Printers</CardTitle>
                                    <CardDescription>{farmers.length} printers found</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow overflow-auto p-0">
                                    <ScrollArea className="h-full pr-4">
                                        <div className="space-y-1 p-6 pt-0">
                                            {farmers.map((farmer) => (
                                                <div 
                                                    key={farmer.id} 
                                                    className={`p-3 rounded-lg border ${selectedFarmerId === farmer.id ? 'bg-secondary border-primary' : 'border-transparent hover:bg-secondary'}`}
                                                >
                                                    <div 
                                                        className="flex items-start gap-4 cursor-pointer"
                                                        onClick={() => handleFarmerClick(farmer)}
                                                    >
                                                        <div className="p-3 bg-primary/10 rounded-full mt-1">
                                                          <MapPin className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <p className="font-semibold">{farmer.name}</p>
                                                            {farmer.address && (
                                                              <p className="text-xs text-muted-foreground">{farmer.address}</p>
                                                            )}
                                                            <div className="flex items-center gap-2 text-sm mt-1">
                                                                <div className="flex items-center">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} className={`w-4 h-4 ${i < Math.round(farmer.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                                    ))}
                                                                </div>
                                                                <span className="font-bold text-foreground">{farmer.rating.toFixed(1)}</span>
                                                                <span className="text-muted-foreground">({farmer.reviews} reviews)</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">{farmer.distance} away in {farmer.city}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 justify-end mt-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleInfoClick(farmer)}>
                                                            <Info className="mr-2 h-4 w-4" />
                                                            Info
                                                        </Button>
                                                        <Button size="sm" onClick={() => handleChooseFarmer(farmer)}>
                                                            <Printer className="mr-2 h-4 w-4" />
                                                            Choose Farmer
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            {infoFarmer && (
                <Dialog open={!!infoFarmer} onOpenChange={(isOpen) => !isOpen && setInfoFarmer(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader className="items-center text-center">
                            <Avatar className="w-20 h-20 mb-2">
                               <AvatarFallback>{infoFarmer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <DialogTitle className="text-2xl">{infoFarmer.name}</DialogTitle>
                            <DialogDescription>
                                {infoFarmer.city} &bull; {infoFarmer.distance} away
                            </DialogDescription>
                             <div className="flex items-center gap-2 text-sm pt-1">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < Math.round(infoFarmer.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <span className="font-bold text-foreground">{infoFarmer.rating.toFixed(1)}</span>
                                <span className="text-muted-foreground">({infoFarmer.reviews} reviews)</span>
                            </div>
                        </DialogHeader>

                        <div className="py-4">
                            <h4 className="font-semibold mb-1 text-center">Location</h4>
                            <p className="text-sm text-center text-muted-foreground mb-4">{infoFarmer.address || `${infoFarmer.city}`}</p>
                            <h4 className="font-semibold mb-3 text-center">Available Printers</h4>
                            {infoFarmer.printers && infoFarmer.printers.length > 0 ? (
                              <div className="space-y-2">
                                {infoFarmer.printers.map((printer, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 rounded-md bg-secondary">
                                      <div className="flex items-center gap-3">
                                          <Printer className="h-5 w-5 text-primary"/>
                                          <p className="font-medium">{printer.name}</p>
                                      </div>
                                      <Badge variant="outline">{printer.type}</Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-center text-muted-foreground">No printer info provided.</p>
                            )}
                        </div>

                        <DialogFooter className="sm:justify-center">
                            <Button onClick={() => {
                                handleChooseFarmer(infoFarmer)
                                setInfoFarmer(null)
                            }}>
                                <Printer className="mr-2 h-4 w-4" /> Choose Farmer and Continue
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

export default function MapSearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MapSearchContent />
        </Suspense>
    );
}
