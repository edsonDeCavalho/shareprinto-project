'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, CheckCircle, XCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { SequentialOfferService } from '@/services/sequentialOfferService';

interface OfferData {
  orderId: string;
  description: string;
  materialType: string;
  typeOfPrinting: string;
  estimatedTime: number;
  cost: number;
  city: string;
  numberOfPrints: number;
  instructions?: string;
  creatorName?: string;
}

function SequentialOffersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [offerData, setOfferData] = useState<OfferData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    acceptedBy?: string;
    message: string;
    totalFarmersContacted?: number;
    timeElapsed?: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Preparing to send offers...');

  // Extract offer data from URL parameters
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const city = searchParams.get('city');
    const description = searchParams.get('description');
    const materialType = searchParams.get('materialType');
    const typeOfPrinting = searchParams.get('typeOfPrinting');
    const estimatedTime = searchParams.get('estimatedTime');
    const cost = searchParams.get('cost');
    const numberOfPrints = searchParams.get('numberOfPrints');
    const instructions = searchParams.get('instructions');
    const creatorName = searchParams.get('creatorName');

    if (orderId && city) {
      setOfferData({
        orderId,
        city,
        description: description ? decodeURIComponent(description) : 'New printing order',
        materialType: materialType || 'PLA',
        typeOfPrinting: typeOfPrinting || 'FDM',
        estimatedTime: parseInt(estimatedTime || '120'),
        cost: parseInt(cost || '50'),
        numberOfPrints: parseInt(numberOfPrints || '1'),
        instructions: instructions ? decodeURIComponent(instructions) : undefined,
        creatorName: creatorName ? decodeURIComponent(creatorName) : undefined,
      });
    } else {
      // Redirect back if missing required parameters
      router.push('/create-order');
    }
  }, [searchParams, router]);

  // Start sequential offers automatically when data is ready
  useEffect(() => {
    if (offerData && !isProcessing && !result) {
      startSequentialOffers();
    }
  }, [offerData, isProcessing, result]);

  const startSequentialOffers = useCallback(async () => {
    if (!offerData) return;

    setIsProcessing(true);
    setProgress(10);
    setCurrentStep('Finding available farmers...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 5, 90);
          if (newProgress <= 30) {
            setCurrentStep('Finding available farmers...');
          } else if (newProgress <= 60) {
            setCurrentStep('Sending offers to farmers...');
          } else {
            setCurrentStep('Waiting for responses...');
          }
          return newProgress;
        });
      }, 1000);

      // Start the sequential offer process
      const offerResult = await SequentialOfferService.startSequentialOffers(offerData);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(offerResult);
      
      if (offerResult.success) {
        setCurrentStep(`Order accepted by farmer!`);
      } else {
        setCurrentStep('No farmers accepted the offer');
      }
    } catch (error) {
      console.error('Error in sequential offers:', error);
      setResult({
        success: false,
        message: 'Failed to process sequential offers',
        totalFarmersContacted: 0,
        timeElapsed: 0
      });
      setCurrentStep('Error occurred during processing');
    } finally {
      setIsProcessing(false);
    }
  }, [offerData]);

  const handleGoBack = () => {
    router.push('/create-order');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (!offerData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Missing Order Information</h1>
          <p className="text-gray-600 mb-6">Unable to process sequential offers without order details.</p>
          <Button onClick={handleGoBack} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Create Order
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sequential Offer Dispatch</h1>
          <p className="text-gray-600">
            Sending your order to farmers one by one with 20-second response windows
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge variant="secondary">{offerData.orderId}</Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{offerData.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Material:</span>
                    <p className="font-medium">{offerData.materialType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium">{offerData.typeOfPrinting}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Time:</span>
                    <p className="font-medium">{offerData.estimatedTime}h</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cost:</span>
                    <p className="font-medium">${offerData.cost}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">City:</span>
                    <p className="font-medium">{offerData.city}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Prints:</span>
                    <p className="font-medium">{offerData.numberOfPrints}</p>
                  </div>
                </div>

                {offerData.instructions && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Instructions</h4>
                    <p className="text-sm text-gray-600">{offerData.instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {currentStep}
                    </span>
                    <span className="text-sm text-gray-500">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                {/* Status */}
                {isProcessing && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="font-medium text-blue-900">Processing Sequential Offers</p>
                      <p className="text-sm text-blue-700">
                        Each farmer has 20 seconds to respond before we move to the next one
                      </p>
                    </div>
                  </div>
                )}

                {/* Results */}
                {result && (
                  <div className={`p-4 rounded-lg ${
                    result.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h3 className={`font-medium mb-1 ${
                          result.success ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {result.success ? 'Order Accepted!' : 'No Acceptance'}
                        </h3>
                        <p className={`text-sm mb-3 ${
                          result.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {result.message}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Farmers Contacted:</span>
                            <p className="font-medium">{result.totalFarmersContacted || 0}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Time Elapsed:</span>
                            <p className="font-medium">{result.timeElapsed || 0}s</p>
                          </div>
                        </div>

                        {result.acceptedBy && (
                          <div className="mt-3 p-2 bg-white rounded border">
                            <span className="text-sm text-gray-500">Accepted by:</span>
                            <p className="font-medium text-green-800">{result.acceptedBy}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {result && (
                  <div className="flex gap-3 pt-4">
                    {result.success ? (
                      <Button 
                        onClick={handleGoToDashboard}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        View Dashboard
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleGoBack}
                        variant="outline"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    )}
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

export default function SequentialOffersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SequentialOffersContent />
    </Suspense>
  );
}

