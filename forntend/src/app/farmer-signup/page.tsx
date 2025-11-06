
'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, KeyRound, Mail, Phone, User, Globe, Eye, EyeOff, Printer, Camera, MapPin, Ruler, X, UploadCloud } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries';
import { ScrollArea } from '@/components/ui/scroll-area';

const TOTAL_STEPS = 9;

// --- Step Components ---

const Step1_PhoneNumber = ({ onSubmit }: { onSubmit: (data: { phoneNumber: string; countryCode: string }) => void }) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCountry = countries.find((c) => c.code === countryCode);

  const sendOtp = async () => {
    if (!selectedCountry) return;

    setLoading(true);
    setError(null);

    try {
      const fullPhoneNumber = `${selectedCountry.prefix}${phone}`.replace(/\s+/g, '');
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: fullPhoneNumber,
        }),
      });

      if (!response.ok) {
        // Optionally, parse the response to get error message
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }

      // Store phone number in localStorage for later use
      localStorage.setItem('phoneNumber', fullPhoneNumber);

      // If successful, call onSubmit callback
      onSubmit({ phoneNumber: fullPhoneNumber, countryCode });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select onValueChange={setCountryCode} value={countryCode}>
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-64">
          {countries.map((c) => ( 
            <SelectItem key={c.code} value={c.code}>
              <div className="flex items-center whitespace-nowrap">
                <img 
                  className="mr-2"
                  src={`https://flagsapi.com/${c.code}/flat/24.png`}
                  alt={c.name}
                  style={{ width: '20px', height: 'auto' }}
                />
                <span>{c.name} ({c.prefix})</span>
              </div>
            </SelectItem>
          ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          {selectedCountry && (
            <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground mr-2">
              {selectedCountry.prefix}
            </span>
          )}

          <Input
            id="phone"
            type="tel"
            placeholder="623 456 7890"
            className={cn(selectedCountry ? 'pl-20' : 'pl-10')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!countryCode}
          />
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <Button onClick={sendOtp} className="w-full" disabled={!phone || !countryCode || loading}>
        {loading ? 'Sending...' : 'Send Verification Code'}
      </Button>
    </div>
  );
};

const Step2_VerifyPhone = ({
  onSubmit,
  phoneNumber,
}: {
  onSubmit: (data: {}) => void;
  phoneNumber: string;
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          code,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // OTP verification successful
        onSubmit({
          // You can pass the token if needed for future API calls
          verificationToken: data.token
        }); // Proceed to the next step
      } else {
        // OTP verification failed
        setError(data.message || 'Invalid or expired OTP');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-center text-muted-foreground">
        Enter the 6-digit code we sent to your phone.
      </p>
      <div className="space-y-2">
        <Label htmlFor="code">Verification Code</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="code"
            type="text"
            placeholder="123456"
            className="pl-10 tracking-widest text-center"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <Button onClick={verifyOtp} className="w-full" disabled={code.length < 6 || loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </Button>

      <Button variant="link" size="sm" className="w-full">
        Didn't receive a code? Resend
      </Button>
    </div>
  );
};


const Step3_Name = ({ onSubmit }: { onSubmit: (data: { firstName: string; lastName: string }) => void }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!firstName || !lastName) return;

    setLoading(true);
    setError(null);

    try {
      // Get the phone number from localStorage or pass it as a prop
      const phoneNumber = localStorage.getItem('phoneNumber') || '';
      
              const response = await fetch('/api/auth/update-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          firstName,
          lastName,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store the names locally and proceed to next step
        onSubmit({ firstName, lastName });
        toast({
          title: 'Name Updated!',
          description: 'Your name has been saved successfully.',
        });
      } else {
        throw new Error(result.message || 'Failed to update name');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save your name. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="firstName" 
                  placeholder="Alex" 
                  className="pl-10" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  className="pl-10" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
            </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSubmit} 
        className="w-full" 
        disabled={!firstName || !lastName || loading}
      >
        {loading ? 'Saving...' : 'Next'}
      </Button>
    </div>
  );
};

const Step4_Avatar = ({ onSubmit }: { onSubmit: (data: { avatar: string }) => void }) => {
  const [avatar, setAvatar] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageSelected, setImageSelected] = useState(false);
  const [imageAccepted, setImageAccepted] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert image to base64
      const base64 = await convertToBase64(file);
      setAvatar(base64);
      setPreviewUrl(base64);
      setImageSelected(true);
      setImageAccepted(false); // Reset acceptance when new image is selected
    } catch (err: any) {
      setError('Failed to process image. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to process image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptImage = async () => {
    if (!avatar) return;

    setLoading(true);
    setError(null);

    try {
      // Get phone number from localStorage
      const phoneNumber = localStorage.getItem('phoneNumber') || '';
      
      // Send to backend
              const response = await fetch('/api/auth/update-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          avatar: avatar,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setImageAccepted(true);
        toast({
          title: 'Avatar Updated!',
          description: 'Your profile picture has been saved successfully.',
        });
        // Proceed to next step
        onSubmit({ avatar: avatar });
      } else {
        throw new Error(result.message || 'Failed to update avatar');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save your profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectImage = () => {
    setAvatar('');
    setPreviewUrl('');
    setImageSelected(false);
    setImageAccepted(false);
    setError(null);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <Image 
            src={previewUrl} 
            alt="Profile preview" 
            width={128} 
            height={128} 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-16 h-16 text-muted-foreground"/>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="avatar-upload">Upload a Profile Picture</Label>
        <Input 
          id="avatar-upload" 
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground pt-1">
          {loading ? 'Processing...' : 'Optional. You can do this later.'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {imageSelected && !imageAccepted && (
        <div className="space-y-3 p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm font-medium">Review Your Profile Picture</p>
          <p className="text-xs text-muted-foreground">
            Do you want to use this image as your profile picture?
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleAcceptImage}
              disabled={loading}
              className="flex-1"
              size="sm"
            >
              {loading ? 'Saving...' : 'Accept & Save'}
            </Button>
            <Button 
              onClick={handleRejectImage}
              variant="outline"
              disabled={loading}
              className="flex-1"
              size="sm"
            >
              Choose Different
            </Button>
          </div>
        </div>
      )}

      {!imageSelected && (
        <Button 
          onClick={() => onSubmit({ avatar: '' })} 
          className="w-full"
          disabled={loading}
        >
          Skip for Now
        </Button>
      )}

      {imageAccepted && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">✓ Profile picture saved successfully!</p>
        </div>
      )}
    </div>
  );
};

const Step5_DigitalCode = ({ onSubmit }: { onSubmit: (data: { digitalCode: string }) => void }) => {
  const [digitalCode, setDigitalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!digitalCode || digitalCode.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      // Get the phone number from localStorage
      const phoneNumber = localStorage.getItem('phoneNumber') || '';
      
              const response = await fetch('/api/auth/update-digital-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          digitalCode: digitalCode,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store the digital code locally and proceed to next step
        onSubmit({ digitalCode });
        toast({
          title: 'Digital Code Updated!',
          description: 'Your digital code has been saved successfully.',
        });
      } else {
        throw new Error(result.message || 'Failed to update digital code');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save your digital code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNumberClick = (number: string) => {
    if (digitalCode.length < 6) {
      setDigitalCode(prev => prev + number);
    }
  };

  const handleDelete = () => {
    setDigitalCode(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setDigitalCode('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Create Your 6-Digit Digital Code</h3>
        <p className="text-sm text-muted-foreground">This will be used to access your account</p>
      </div>

      {/* PIN Display */}
      <div className="flex justify-center space-x-3 mb-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className={cn(
              "w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all duration-200",
              digitalCode[index]
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30 bg-background"
            )}
          >
            {digitalCode[index] ? "•" : ""}
          </div>
        ))}
      </div>

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <Button
            key={number}
            variant="outline"
            size="lg"
            className="h-14 text-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => handleNumberClick(number.toString())}
            disabled={loading || digitalCode.length >= 6}
          >
            {number}
          </Button>
        ))}
        
        {/* Bottom row with 0, delete, and clear */}
        <Button
          variant="outline"
          size="lg"
          className="h-14 text-xl font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors"
          onClick={handleClear}
          disabled={loading}
        >
          C
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-14 text-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={() => handleNumberClick('0')}
          disabled={loading || digitalCode.length >= 6}
        >
          0
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-14 text-xl font-semibold hover:bg-destructive hover:text-destructive-foreground transition-colors"
          onClick={handleDelete}
          disabled={loading || digitalCode.length === 0}
        >
          ←
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSubmit} 
        className="w-full" 
        disabled={digitalCode.length !== 6 || loading}
      >
        {loading ? 'Saving...' : 'Next'}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        Enter exactly 6 digits to create your digital code
      </p>
    </div>
  );
};

const Step6_Email = ({ onSubmit }: { onSubmit: (data: { email: string }) => void }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) return;

    setLoading(true);
    setError(null);

    try {
      // Get the phone number from localStorage
      const phoneNumber = localStorage.getItem('phoneNumber') || '';
      
              const response = await fetch('/api/auth/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          email: email,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store the email locally and proceed to next step
        onSubmit({ email });
        toast({
          title: 'Email Updated!',
          description: 'Your email has been saved successfully.',
        });
      } else {
        throw new Error(result.message || 'Failed to update email');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save your email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            id="email" 
            type="email" 
            placeholder="alex.doe@example.com" 
            className="pl-10" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSubmit} 
        className="w-full" 
        disabled={!email.includes('@') || loading}
      >
        {loading ? 'Saving...' : 'Next'}
      </Button>
    </div>
  );
};

const Step7_PrinterBrand = ({ onSubmit }: { onSubmit: (data: { printerBrand: string }) => void }) => {
  const [brand, setBrand] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const brands = [
    "Creality",
    "Prusa Research", 
    "Bambu Lab",
    "Anycubic",
    "Elegoo",
    "FlashForge",
    "Ultimaker",
    "LulzBot",
    "Qidi Tech",
    "Sovol"
  ];

  const handleBrandSelect = async (selectedBrand: string) => {
    setBrand(selectedBrand);
    setLoading(true);
    setError(null);

    try {
      // Get the phone number from localStorage
      const phoneNumber = localStorage.getItem('phoneNumber') || '';
      
              const response = await fetch('/api/auth/update-printer-brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          printerBrand: selectedBrand,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: 'Printer Brand Updated!',
          description: 'Your printer brand has been saved successfully.',
        });
        // Proceed to next step
        onSubmit({ printerBrand: selectedBrand });
      } else {
        throw new Error(result.message || 'Failed to update printer brand');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save your printer brand. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={brand} onValueChange={handleBrandSelect}>
        {brands.map(b => (
            <div key={b} className="flex items-center space-x-2 p-3 rounded-md border has-[:checked]:bg-secondary has-[:checked]:border-primary">
                <RadioGroupItem value={b} id={b} disabled={loading} />
                <Label htmlFor={b} className="flex-1 cursor-pointer">{b}</Label>
            </div>
        ))}
      </RadioGroup>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="text-center p-2">
          <p className="text-sm text-muted-foreground">Saving printer brand...</p>
        </div>
      )}
    </div>
  );
};

const Step8_PrinterModel = ({ onSubmit, selectedBrand }: { onSubmit: (data: { printerModel: string; buildVolume: string; multiColor: boolean }) => void; selectedBrand: string }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [printerData, setPrinterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Helper function to extract printer data from various JSON structures
    const extractPrinterData = (data: any): any[] => {
      if (Array.isArray(data)) {
        return data;
      }
      
      if (data && typeof data === 'object') {
        // Check if it has FDM_printers and resin_printers (like Elegoo, Anycubic, FlashForge)
        if (data.FDM_printers && data.resin_printers) {
          return [...(data.FDM_printers || []), ...(data.resin_printers || [])];
        }
        
        // Check if it has a direct printers array (like Sovol)
        if (Array.isArray(data.printers)) {
          return data.printers;
        }
        
        // Check if it's a direct array of printers (like Bambu Lab)
        const keys = Object.keys(data);
        for (const key of keys) {
          if (Array.isArray(data[key])) {
            return data[key];
          }
        }
      }
      
      return [];
    };

    // Load printer data based on selected brand
    const loadPrinterData = async () => {
      setLoading(true);
      try {
        let rawData: any;
        
        switch (selectedBrand.toLowerCase()) {
          case 'creality':
            rawData = (await import('@/printers/creality_printers.json')).default.creality_printers;
            break;
          case 'bambu lab':
            rawData = (await import('@/printers/bambu_lab_printers.json')).default;
            break;
          case 'anycubic':
            rawData = (await import('@/printers/anycubic_printers.json')).default.anycubic_printers;
            break;
          case 'elegoo':
            rawData = (await import('@/printers/elegoo_printers.json')).default.elegoo_printers;
            break;
          case 'flashforge':
            rawData = (await import('@/printers/flashforge_printers.json')).default.flashforge_printers;
            break;
          case 'ultimaker':
            rawData = (await import('@/printers/ultimaker_printers.json')).default.ultimaker_printers;
            break;
          case 'lulzbot':
            rawData = (await import('@/printers/lulzbot_printers.json')).default.lulzbot_printers;
            break;
          case 'qidi tech':
            rawData = (await import('@/printers/qidi_tech_printers.json')).default.qidi_tech_printers;
            break;
          case 'sovol':
            rawData = (await import('@/printers/sovol_printers.json')).default;
            break;
          default:
            rawData = null;
        }
        
        const data = extractPrinterData(rawData);
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error('Printer data is not an array:', data);
          setPrinterData([]);
        } else {
          setPrinterData(data);
        }
      } catch (error) {
        console.error('Error loading printer data:', error);
        setPrinterData([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedBrand) {
      loadPrinterData();
    }
  }, [selectedBrand]);

  const handleModelSelect = async (model: string) => {
    setSelectedModel(model);
    const printer = printerData.find(p => p.model === model);
    if (printer) {
      setLoading(true);
      setError(null);

      try {
        // Get the phone number from localStorage
        const phoneNumber = localStorage.getItem('phoneNumber') || '';
        
        const response = await fetch('/api/auth/add-printer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phoneNumber,
            printer: {
              brand: selectedBrand,
              model: printer.model,
              buildVolume: printer.build_volume,
              multiColor: printer.multi_color,
              notes: printer.notes
            }
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          toast({
            title: 'Printer Added!',
            description: 'Your printer has been saved successfully.',
          });
          // Proceed to next step
          onSubmit({
            printerModel: printer.model,
            buildVolume: printer.build_volume,
            multiColor: printer.multi_color
          });
        } else {
          throw new Error(result.message || 'Failed to add printer');
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
        toast({
          title: 'Error',
          description: err.message || 'Failed to save your printer. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!selectedBrand) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Please select a printer brand first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Loading printer models...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Select Your {selectedBrand} Printer</h3>
        <p className="text-sm text-muted-foreground">Choose your specific printer model</p>
      </div>

      {Array.isArray(printerData) && printerData.length > 0 ? (
        <RadioGroup value={selectedModel} onValueChange={handleModelSelect}>
          {printerData.map((printer) => (
            <div key={printer.model} className="flex items-center space-x-2 p-4 rounded-md border has-[:checked]:bg-secondary has-[:checked]:border-primary">
              <RadioGroupItem value={printer.model} id={printer.model} disabled={loading} />
              <div className="flex-1">
                <Label htmlFor={printer.model} className="cursor-pointer">
                  <div className="font-medium">{printer.model}</div>
                  <div className="text-sm text-muted-foreground">
                    Build Volume: {printer.build_volume}
                    {printer.multi_color && (
                      <span className="ml-2 text-blue-600">• Multi-color capable</span>
                    )}
                  </div>
                  {printer.notes && (
                    <div className="text-xs text-muted-foreground mt-1">{printer.notes}</div>
                  )}
                </Label>
              </div>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <div className="text-center p-4">
          <p className="text-muted-foreground">No printer models found for {selectedBrand}.</p>
          <p className="text-xs text-muted-foreground mt-2">Please check if the printer data file exists.</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const Step9_PrinterPhotos = ({ onSubmit }: { onSubmit: (data: { photos: string[] }) => void }) => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<string[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Stop camera stream when component unmounts
      if (videoRef.current?.srcObject) {
        // @ts-ignore
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getCameraPermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('Camera not supported.');
      setHasCameraPermission(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setIsCameraActive(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to continue.',
      });
    }
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result && photos.length < 3) {
                setPhotos(prev => [...prev, e.target!.result as string]);
            }
        };
        reader.readAsDataURL(file);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          Array.from(e.target.files).forEach(handleFile);
      }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
       Array.from(e.dataTransfer.files).forEach(handleFile);
    }
  };

  const takePicture = () => {
    if (!isCameraActive) {
      getCameraPermission();
      return;
    }
    if (photos.length >= 3) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhotos([...photos, dataUrl]);
    }
  };

  const removePhoto = (index: number) => {
      setPhotos(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4" onDragEnter={handleDrag}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                 <Label>Take Pictures</Label>
                {hasCameraPermission === false && (
                    <Alert variant="destructive" className="text-xs">
                        <AlertTitle>Camera Disabled</AlertTitle>
                        <AlertDescription>Allow camera access to take pictures.</AlertDescription>
                    </Alert>
                )}
                <div className="relative w-full aspect-video rounded-md bg-secondary overflow-hidden flex items-center justify-center">
                    <video ref={videoRef} className={cn("w-full h-full object-cover", !isCameraActive && "hidden")} autoPlay muted playsInline />
                     {!isCameraActive && <Camera className="h-12 w-12 text-muted-foreground" />}
                    <canvas ref={canvasRef} className="hidden" />
                </div>
                <Button onClick={takePicture} className="w-full" disabled={photos.length >= 3}>
                    <Camera className="mr-2 h-4 w-4" /> {isCameraActive ? 'Take Picture' : 'Start Camera'}
                </Button>
            </div>
            <div className="space-y-2">
                 <Label htmlFor="photo-upload">Upload Pictures</Label>
                 <div 
                    className={cn(
                      'relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80 transition-colors',
                      dragActive && 'border-primary bg-primary/10'
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag & drop
                      </p>
                       <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                    </div>
                    <Input 
                      ref={fileInputRef}
                      id="photo-upload"
                      type="file" 
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                     {dragActive && <div className="absolute inset-0" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                  </div>
            </div>
        </div>
      
      {photos.length > 0 && (
        <div>
            <Label>Your Photos ({photos.length}/3)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
            {photos.map((photo, index) => (
                <div key={index} className="relative group">
                    <Image src={photo} alt={`Printer photo ${index + 1}`} width={100} height={100} className="w-full h-auto rounded-md aspect-square object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removePhoto(index)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            </div>
        </div>
      )}

      <Button onClick={() => onSubmit({ photos })} className="w-full" disabled={photos.length < 3}>
        Next
      </Button>
    </div>
  );
};


const Step10_Location = ({ onSubmit }: { onSubmit: (data: { address: string; country: string }) => void }) => {
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!address || !country) return;

    setLoading(true);
    setError(null);

    try {
      // Get the phone number from localStorage
      const phoneNumber = localStorage.getItem('phoneNumber') || '';
      
              const response = await fetch('/api/auth/update-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          address: address,
          country: country,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store the location locally and proceed to next step
        onSubmit({ address, country });
        toast({
          title: 'Location Updated!',
          description: 'Your location has been saved successfully.',
        });
      } else {
        throw new Error(result.message || 'Failed to update location');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save your location. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            id="address" 
            placeholder="123 Print Street, Maker City" 
            className="pl-10" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select onValueChange={setCountry} value={country} disabled={loading}>
            <SelectTrigger id="country">
                <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
                <ScrollArea className="h-64">
                    {countries.map(c => (
                        <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                    ))}
                </ScrollArea>
            </SelectContent>
        </Select>
      </div>
       <p className="text-xs text-muted-foreground text-center !mt-2">For verification purposes only. We will never share your full address with other users.</p>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSubmit} 
        className="w-full" 
        disabled={!address || !country || loading}
      >
        {loading ? 'Saving...' : 'Finish Sign Up'}
      </Button>
    </div>
  );
};

const FinalStep_Summary = ({ data }: { data: any }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { login } = useUser();

  const completeRegistration = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, update the user type to "farmer"
      const phoneNumber = data.phoneNumber;
      
              const userTypeResponse = await fetch('/api/auth/update-user-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          userType: 'farmer',
        }),
      });

      const userTypeResult = await userTypeResponse.json();

      if (!userTypeResponse.ok || !userTypeResult.success) {
        throw new Error(userTypeResult.message || 'Failed to update user type');
      }

      // Prepare the user data for the backend
      const userData = {
        phone: data.phoneNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        digitalCode: data.digitalCode, // Use digital code instead of password
        username: `${data.firstName?.toLowerCase()}_${data.lastName?.toLowerCase()}_${Date.now()}`,
        type: 'farmer', // Add user type
        // Add other fields as needed
        avatar: data.avatar,
        country: data.country,
        address: data.address,
        // Printer information is already stored in the database
      };

              const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        toast({
          title: 'Registration Complete!',
          description: 'Welcome! Your account has been successfully created.',
        });
        
        // Login the user with the returned data
        if (result.user && result.token) {
          login(result.user, result.token);
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/farmer/dashboard';
        }, 2000);
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong during registration');
      toast({
        title: 'Registration Failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-600">Registration Complete!</h2>
        <p className="text-muted-foreground">Your account has been successfully created.</p>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Welcome, Farmer!</h2>
        <p className="text-muted-foreground">Please review your information and complete registration.</p>
      </div>
      
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle>Registration Summary</CardTitle>
          <CardDescription>Review your information before completing registration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Name:</strong> {data.firstName} {data.lastName}</div>
            <div><strong>Phone:</strong> {data.phoneNumber}</div>
            <div><strong>Email:</strong> {data.email}</div>
            <div><strong>Country:</strong> {data.country}</div>
            <div><strong>Address:</strong> {data.address}</div>
            <div><strong>Printer:</strong> {data.printerBrand} {data.printerModel}</div>
            <div><strong>Build Volume:</strong> {data.buildVolume}</div>
            <div><strong>Multi-color:</strong> {data.multiColor ? 'Yes' : 'No'}</div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={completeRegistration} 
        className="w-full" 
        disabled={loading}
      >
        {loading ? 'Completing Registration...' : 'Complete Registration'}
      </Button>
    </div>
  );
};


// --- Main Page Component ---

export default function FarmerSignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<{ phoneNumber?: string; [key: string]: any }>({});

  const handleNextStep = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (step < TOTAL_STEPS + 1) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };
  
  const progress = (step / (TOTAL_STEPS + 1)) * 100;

  const titles = [
      "Become a Farmer", "Verify Your Phone", "What's Your Name?", "Add a Profile Picture", "Create a Secure Password", "What's Your Email?",
      "Add Your Printer", "Select Your Printer Model", "Where Are You Located?", "Registration Complete!"
  ]
  const descriptions = [
      "Let's start with your phone number.", "We sent a code to your phone.", "Let's get to know you.", "Show us your best smile!", "Make sure it's a strong one.", "We'll send you important updates here.",
      "Select the brand of your 3D printer.", "Choose your specific printer model.", "Your location helps us connect you with creators.", "You're all set!"
  ]
  
  const icons = [Phone, KeyRound, User, User, KeyRound, Mail, Printer, Ruler, MapPin, null];

  return (
    <div className="flex-grow flex items-center justify-center bg-grid p-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
             {step > 1 && step <= TOTAL_STEPS + 1 && (
                 <Button variant="ghost" size="sm" onClick={handlePrevStep} className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground">
                    <ChevronLeft className="h-4 w-4"/> Back
                 </Button>
            )}
            <div className="pt-8 text-center">
                {icons[step-1] && (
                    <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                        {React.createElement(icons[step-1] as React.ElementType, { className: "h-6 w-6" })}
                    </div>
                )}
                <CardTitle className="text-2xl font-headline">{titles[step-1]}</CardTitle>
                <CardDescription>{descriptions[step-1]}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="h-2"/>
            
            <div className="pt-4">
                {step === 1 && <Step1_PhoneNumber onSubmit={handleNextStep} />}
                {step === 2 && formData.phoneNumber && <Step2_VerifyPhone onSubmit={handleNextStep} phoneNumber={formData.phoneNumber} />}
                {step === 3 && <Step3_Name onSubmit={handleNextStep} />}
                {step === 4 && <Step4_Avatar onSubmit={handleNextStep} />}
                {step === 5 && <Step5_DigitalCode onSubmit={handleNextStep} />}
                {step === 6 && <Step6_Email onSubmit={handleNextStep} />}
                {step === 7 && <Step7_PrinterBrand onSubmit={handleNextStep} />}
                {step === 8 && <Step8_PrinterModel onSubmit={handleNextStep} selectedBrand={formData.printerBrand} />}
                {step === 9 && <Step10_Location onSubmit={handleNextStep} />}
                {step === 10 && <FinalStep_Summary data={formData} />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
