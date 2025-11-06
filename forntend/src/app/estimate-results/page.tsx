
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultsCard } from '@/components/results-card';
import type { EstimationResult } from '@/app/actions/estimate';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, File as FileIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function EstimateResultsPage() {
  const [results, setResults] = useState<EstimationResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedResult = sessionStorage.getItem('estimationResult');
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult);
        setResults(parsedResult);
      } catch (e) {
        console.error("Failed to parse estimation result from sessionStorage", e);
        // Handle error, maybe redirect back
        router.push('/');
      }
    } else {
      // If there are no results, redirect back to the upload page
      router.push('/');
    }
    setLoading(false);
  }, [router]);
  
  const handleFindPrinter = () => {
    router.push('/map-search');
  }

  if (loading) {
    return (
        <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-grid">
            <div className="w-full max-w-2xl mx-auto space-y-4">
                 <Skeleton className="h-10 w-1/2 mx-auto" />
                 <Skeleton className="h-6 w-3/4 mx-auto" />
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Skeleton className="h-24 w-full" />
                         <Skeleton className="h-16 w-full" />
                    </CardContent>
                 </Card>
                 <Skeleton className="h-12 w-full" />
            </div>
        </div>
    )
  }

  const hasErrors = results?.some(r => r.error);
  const successfulEstimates = results?.filter(r => r.output) || [];

  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-grid">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Estimation Complete</CardTitle>
            <CardDescription>
                {hasErrors 
                    ? "Some of your files could not be estimated. See details below."
                    : "Here is the estimated cost and time for your print job."
                }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
                {results?.map((result, index) => (
                    <div key={index}>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><FileIcon size={16}/> {result.fileName}</h3>
                        {result.output ? (
                            <ResultsCard {...result.output} />
                        ) : (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Estimation Failed</AlertTitle>
                                <AlertDescription>
                                    {result.error || "An unknown error occurred for this file."}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                ))}
            </div>

            {successfulEstimates.length > 0 && (
                 <Button className="w-full" size="lg" onClick={handleFindPrinter}>
                    Find a Printer <ArrowRight className="ml-2" />
                </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
