
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Shield, User, LogOut, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

export default function SettingsPage() {
    const { toast } = useToast();
    const { logout } = useUser();
    const [pushPermission, setPushPermission] = React.useState('default');
    const [soundEnabled, setSoundEnabled] = React.useState(true); // Default to enabled

    React.useEffect(() => {
        if ('Notification' in window) {
            setPushPermission(Notification.permission);
        }
        
        // Load sound setting from localStorage
        const savedSoundSetting = localStorage.getItem('soundEnabled');
        if (savedSoundSetting !== null) {
            setSoundEnabled(JSON.parse(savedSoundSetting));
        } else {
            // Default to true if no setting is saved
            localStorage.setItem('soundEnabled', 'true');
        }
    }, []);

    const handlePushToggle = async (checked: boolean) => {
        if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast({
                variant: 'destructive',
                title: 'Unsupported Browser',
                description: 'Your browser does not support push notifications.',
            });
            return;
        }

        if (checked) {
            if (Notification.permission === 'granted') {
                 toast({
                    title: 'Already Enabled',
                    description: 'Push notifications are already enabled.',
                });
                setPushPermission('granted');
            } else if (Notification.permission === 'denied') {
                toast({
                    variant: 'destructive',
                    title: 'Permission Denied',
                    description: 'Please enable notifications in your browser settings.',
                });
                 setPushPermission('denied');
            } else {
                const permission = await Notification.requestPermission();
                setPushPermission(permission);
                if (permission === 'granted') {
                     toast({
                        title: 'Notifications Enabled!',
                        description: "You'll now receive push notifications.",
                    });
                } else {
                     toast({
                        variant: 'destructive',
                        title: 'Permission Not Granted',
                        description: 'You did not grant permission for notifications.',
                    });
                }
            }
        } else {
             // In a real app, you would unsubscribe the user here.
            toast({
                title: 'Notifications Disabled',
                description: "You will no longer receive push notifications.",
            });
            // This is a simulation, so we just update the UI state.
            // A real "denied" state can only be reset by the user in browser settings.
            // We'll set it to 'default' to allow re-enabling in this demo.
            if (Notification.permission !== 'denied') {
                setPushPermission('default');
            }
        }
    };

    const handleSoundToggle = (checked: boolean) => {
        setSoundEnabled(checked);
        localStorage.setItem('soundEnabled', JSON.stringify(checked));
        
        toast({
            title: checked ? 'Sound Enabled' : 'Sound Disabled',
            description: checked 
                ? 'You will now hear sound notifications.' 
                : 'Sound notifications are now disabled.',
        });
    };


    return (
        <div className="flex-grow bg-grid p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-3xl space-y-8">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">Settings</h1>
                    <p className="text-muted-foreground">Manage your account and preferences.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
                        <CardDescription>Control how you receive notifications.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <Switch id="email-notifications" defaultChecked/>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="sound-notifications" className="flex items-center gap-2">
                                    <Volume2 className="h-4 w-4" />
                                    Sound Notifications
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Play sounds for order acceptance and notifications
                                </p>
                            </div>
                            <Switch 
                                id="sound-notifications" 
                                checked={soundEnabled}
                                onCheckedChange={handleSoundToggle}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="push-notifications">
                                Push Notifications
                                {pushPermission === 'denied' && (
                                    <span className="text-xs text-destructive block font-normal">
                                        Permission has been blocked.
                                    </span>
                                )}
                            </Label>
                            <Switch 
                                id="push-notifications" 
                                onCheckedChange={handlePushToggle}
                                checked={pushPermission === 'granted'}
                                disabled={pushPermission === 'denied'}
                            />
                        </div>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="sms-notifications">SMS Notifications</Label>
                            <Switch id="sms-notifications" defaultChecked/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Shield /> Account Management</CardTitle>
                        <CardDescription>Make changes to your account here. Be careful, these actions are permanent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                           <div>
                                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Pause Account</h3>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">Your profile and printers will be hidden temporarily.</p>
                           </div>
                           <Button variant="outline" className="mt-2 sm:mt-0 border-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/50">Pause Account</Button>
                        </div>
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg border-destructive/50 bg-destructive/10">
                           <div>
                                <h3 className="font-semibold text-destructive">Delete Account</h3>
                                <p className="text-sm text-destructive/80">This will permanently delete your account and data.</p>
                           </div>
                           <Button variant="destructive" className="mt-2 sm:mt-0">Delete Account</Button>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LogOut /> Sign Out</CardTitle>
                         <CardDescription>Sign out from your current session.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto"
                          onClick={async () => {
                            await logout();
                            window.location.href = '/signin';
                          }}
                        >
                          Sign Out From This Device
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
