
'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, KeyRound, Eye, EyeOff, Phone } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const TOTAL_STEPS = 4;

// --- Step Components ---

const Step1_PhoneNumber = ({ onSubmit }: { onSubmit: (data: { phoneNumber: string, countryCode: string }) => void }) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const selectedCountry = countries.find(c => c.code === countryCode);
  const [error, setError] = useState<string | null>(null);

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
          {selectedCountry && <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{selectedCountry.prefix}</span>}
          <Input 
            id="phone" 
            type="tel" 
            placeholder="123 456 7890" 
            style={{ paddingLeft: selectedCountry ? `${selectedCountry.prefix.length + 4}ch` : '2.5rem' }}
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            disabled={!countryCode}
            />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <Button onClick={sendOtp} className="w-full" disabled={!phone || !countryCode || loading}>
        {loading ? 'Sending...' : 'Send Verification Code'}
      </Button>
    </div>
  );
};

const Step2_VerifyPhone = ({ onSubmit }: { onSubmit: (data: {}) => void }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const verifyOtp = async () => {
        const phoneNumber = localStorage.getItem('phoneNumber');
        if (!phoneNumber) {
            setError('Phone number not found. Please go back and try again.');
            return;
        }

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
                    code: code,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                onSubmit({});
            } else {
                throw new Error(result.message || 'Invalid verification code');
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">Enter the 6-digit code we sent to your phone.</p>
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
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
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

const Step3_Name = ({ onSubmit }: { onSubmit: (data: { firstName: string, lastName: string, email: string, digitalCode: string }) => void }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [digitalCode, setDigitalCode] = useState('');
  const [digitalCodeError, setDigitalCodeError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim() === '') {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validateDigitalCode = (code: string) => {
    if (code && code.trim() !== '') {
      if (!/^\d{6}$/.test(code)) {
        return 'Digital code must be exactly 6 digits';
      }
    }
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handleDigitalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only allow digits, max 6
    setDigitalCode(value);
    setDigitalCodeError(validateDigitalCode(value));
  };

  const handleSubmit = () => {
    const emailError = validateEmail(email);
    const digitalCodeError = validateDigitalCode(digitalCode);
    
    if (emailError) {
      setEmailError(emailError);
      return;
    }
    if (digitalCodeError) {
      setDigitalCodeError(digitalCodeError);
      return;
    }
    onSubmit({ firstName, lastName, email, digitalCode });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="firstName" placeholder="Alex" className="pl-10" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="lastName" placeholder="Doe" className="pl-10" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
          </div>
      </div>
      
      <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <Input 
                  id="email" 
                  type="email"
                  placeholder="alex@example.com" 
                  className="pl-10" 
                  value={email} 
                  onChange={handleEmailChange}
                  required
              />
          </div>
          {emailError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {emailError}
            </div>
          )}
      </div>
      
      <div className="space-y-2">
          <Label htmlFor="digitalCode">Digital Code</Label>
          <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                  id="digitalCode" 
                  placeholder="123456" 
                  className="pl-10 tracking-widest text-center" 
                  value={digitalCode} 
                  onChange={handleDigitalCodeChange}
                  maxLength={6}
                  required
              />
          </div>
          {digitalCodeError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {digitalCodeError}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
              This code will be used to sign in with your email. Must be exactly 6 digits.
          </p>
      </div>
      
      <Button onClick={handleSubmit} className="w-full" disabled={!firstName || !lastName || !email || !digitalCode || !!emailError || !!digitalCodeError}>
        Continue
      </Button>
    </div>
  );
};

const Step4_ProfileImage = ({ onSubmit }: { onSubmit: (data: { avatar?: string }) => void }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Please upload an image smaller than 5MB.');
        return;
      }

      setUploadingAvatar(true);

      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target?.result) {
            const base64Image = event.target.result as string;
            setAvatarUrl(base64Image);
            setUploadingAvatar(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (error: any) {
        alert('Failed to upload image. Please try again.');
        setUploadingAvatar(false);
      }
    }
  };

  const handleSubmit = () => {
    onSubmit({ avatar: avatarUrl || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-32 h-32 relative">
          <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No image selected</p>
              </div>
            )}
          </div>
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
            className="absolute bottom-0 right-0 rounded-full h-10 w-10 bg-white shadow-lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </Button>
        </div>
        <div>
          <h3 className="text-lg font-medium">Profile Picture (Optional)</h3>
          <p className="text-sm text-muted-foreground">
            Add a profile picture to personalize your account. You can skip this step.
          </p>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => onSubmit({})} 
          className="flex-1"
        >
          Skip
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="flex-1"
          disabled={!avatarUrl}
        >
          {uploadingAvatar ? 'Uploading...' : 'Add Picture'}
        </Button>
      </div>
    </div>
  );
};


export default function CreatorSignupPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<{
        phoneNumber?: string;
        countryCode?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        digitalCode?: string;
        avatar?: string;
    }>({});
    const router = useRouter();
    const { toast } = useToast();
    const { login } = useUser();

    const handleNextStep = (data: any) => {
        setFormData(prev => ({...prev, ...data}));
        if (step < TOTAL_STEPS) {
            setStep(prev => prev + 1);
        } else {
            // Final step logic - complete registration
            completeRegistration();
        }
    };

    const completeRegistration = async () => {
        try {
            const userData = {
                phone: formData.phoneNumber,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                userType: 'creator',
                username: `${formData.firstName?.toLowerCase() || 'user'}_${formData.lastName?.toLowerCase() || 'creator'}_${Date.now()}`,
                digitalCode: formData.digitalCode || null,
                avatar: formData.avatar || null,
            };

            // Update user type
            const userTypeResponse = await fetch('/api/auth/update-user-type', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: formData.phoneNumber,
                    userType: 'creator',
                }),
            });

            if (!userTypeResponse.ok) {
                throw new Error('Failed to update user type');
            }

            // Complete registration
            const response = await fetch('/api/auth/complete-registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Update email
                const emailResponse = await fetch('/api/auth/update-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: formData.phoneNumber,
                        email: formData.email,
                    }),
                });

                if (!emailResponse.ok) {
                    console.warn('Failed to set email, but account was created successfully');
                }

                // Update digital code
                if (formData.digitalCode && formData.digitalCode.trim() !== '') {
                    const digitalCodeResponse = await fetch('/api/auth/update-digital-code', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            phone: formData.phoneNumber,
                            digitalCode: formData.digitalCode,
                        }),
                    });

                    if (!digitalCodeResponse.ok) {
                        console.warn('Failed to set digital code, but account was created successfully');
                    }
                }

                toast({
                    title: 'Account Created!',
                    description: 'Welcome! Your account has been successfully created.',
                });

                // Login the user with the returned data
                if (result.user && result.token) {
                    login(result.user, result.token);
                }

                // Redirect to creator dashboard
                setTimeout(() => {
                    router.push('/creator/dashboard');
                }, 2000);
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        } catch (error: any) {
            toast({
                title: 'Registration Failed',
                description: error.message || 'Please try again.',
                variant: 'destructive',
            });
        }
    };
    
    const progress = (step / TOTAL_STEPS) * 100;
    
    const titles = ["Create Your Creator Account", "Verify Your Phone", "What's Your Name?", "Profile Picture"];
    const descriptions = ["Let's start with your phone number.", "Enter the code we sent to your phone.", "Just a few more details to get you started.", "Add a profile picture (optional)."];
    const icons = [Phone, KeyRound, User, User];

    return (
        <div className="flex-grow flex items-center justify-center bg-grid p-4">
            <Card className="w-full max-w-md mx-auto shadow-lg">
                <CardHeader className="text-center">
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
                        {step === 2 && <Step2_VerifyPhone onSubmit={handleNextStep} />}
                        {step === 3 && <Step3_Name onSubmit={handleNextStep} />}
                        {step === 4 && <Step4_ProfileImage onSubmit={handleNextStep} />}
                    </div>
                    
                    <div className="mt-4 text-center text-sm">
                        <p className="text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/creator-signin" className="font-medium text-primary hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

