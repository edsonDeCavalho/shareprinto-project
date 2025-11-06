import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";


export function NearbyFarmersCard() {
    return (
        <Card className="flex-grow">
            <CardHeader>
                <CardTitle>Available Printers</CardTitle>
                <CardDescription>3 printers found nearby</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 hover:bg-secondary rounded-lg cursor-pointer">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold">John's Print Farm</p>
                        <p className="text-sm text-muted-foreground">0.5 miles away</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 hover:bg-secondary rounded-lg cursor-pointer">
                        <div className="p-3 bg-primary/10 rounded-full">
                        <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold">CreatorSpace Hub</p>
                        <p className="text-sm text-muted-foreground">1.2 miles away</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 hover:bg-secondary rounded-lg cursor-pointer">
                        <div className="p-3 bg-primary/10 rounded-full">
                        <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold">3D-Pros</p>
                        <p className="text-sm text-muted-foreground">2.1 miles away</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
