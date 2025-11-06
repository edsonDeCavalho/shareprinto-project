
'use server';
// This file is kept for type definitions but the server-side logic is currently bypassed.

import type { EstimatePrintParametersOutput } from '@/ai/flows/estimate-print-parameters';

export type EstimationResult = {
  fileName: string;
  output?: EstimatePrintParametersOutput;
  error?: string;
};

// The getEstimation function has been removed to bypass server-side processing for now.
// The form now uses a client-side simulation.
