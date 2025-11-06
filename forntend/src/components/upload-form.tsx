
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadSchema, type UploadValues } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, AlertCircle, UploadCloud, X, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { EstimationResult } from '@/app/actions/estimate';

export function UploadForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();


  const form = useForm<UploadValues>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      stlFiles: [],
      material: '',
      printerType: '',
    },
  });

  const { watch, setValue, trigger } = form;
  const watchedFiles = watch('stlFiles');

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const currentFiles = form.getValues('stlFiles') || [];
      const newFiles = Array.from(e.dataTransfer.files);
      // @ts-ignore
      setValue('stlFiles', [...currentFiles, ...newFiles]);
      trigger('stlFiles');
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const currentFiles = form.getValues('stlFiles') || [];
      const newFiles = Array.from(e.target.files);
      // @ts-ignore
      setValue('stlFiles', [...currentFiles, ...newFiles]);
      trigger('stlFiles');
    }
  }

  const removeFile = (index: number) => {
    const currentFiles = [...(form.getValues('stlFiles') || [])];
    currentFiles.splice(index, 1);
    // @ts-ignore
    setValue('stlFiles', currentFiles);
    trigger('stlFiles');
  }

  const onSubmit = async (values: UploadValues) => {
    setIsSubmitting(true);
    setError(null);
    
    // Simulate API call and successful response
    setTimeout(() => {
      // @ts-ignore
      const mockResults: EstimationResult[] = values.stlFiles.map((file: File) => ({
        fileName: file.name,
        output: {
          estimatedMaterialUsage: `${(Math.random() * 100 + 20).toFixed(2)}g`,
          estimatedPrintingTime: `${(Math.random() * 10 + 2).toFixed(1)} hours`,
          estimatedCost: `$${(Math.random() * 30 + 5).toFixed(2)}`,
          notes: 'This is a simulated estimate. The actual cost and time may vary based on the selected printer and farmer.',
        },
      }));
      
      sessionStorage.setItem('estimationResult', JSON.stringify(mockResults));
      router.push('/estimate-results');
      
    }, 1500); // Simulate network delay
  };
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" onDragEnter={handleDrag}>
          <FormField
            control={form.control}
            name="stlFiles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>STL Files</FormLabel>
                <FormControl>
                  <div 
                    className={cn(
                      'relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80 transition-colors',
                      dragActive && 'border-primary bg-primary/10'
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">.STL files (Max 50MB each)</p>
                    </div>
                    <Input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".stl"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                     {dragActive && <div className="absolute inset-0" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                  </div>
                </FormControl>
                <FormMessage />
                {watchedFiles && watchedFiles.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <Label>Selected Files:</Label>
                    <ul className="space-y-1">
                      {/* @ts-ignore */}
                      {Array.from(watchedFiles).map((file: File, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md text-sm">
                           <div className="flex items-center gap-2">
                            <FileIcon className="h-4 w-4" />
                            <span className="font-mono">{file.name}</span>
                           </div>
                           <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                            <X className="h-4 w-4"/>
                           </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PLA">PLA</SelectItem>
                      <SelectItem value="ABS">ABS</SelectItem>
                      <SelectItem value="PETG">PETG</SelectItem>
                      <SelectItem value="Resin">Resin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="printerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Printer Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a printer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FDM">FDM (Fused Deposition Modeling)</SelectItem>
                      <SelectItem value="SLA">SLA (Stereolithography)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting || !watchedFiles || watchedFiles.length === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Estimating...' : 'Get Estimate'}
          </Button>
        </form>
      </Form>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

    </div>
  );
}
