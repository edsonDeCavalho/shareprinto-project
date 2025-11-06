'use server';

/**
 * @fileOverview An AI agent for estimating 3D printing parameters from an STL file.
 *
 * - estimatePrintParameters - A function that handles the estimation process.
 * - EstimatePrintParametersInput - The input type for the estimatePrintParameters function.
 * - EstimatePrintParametersOutput - The return type for the estimatePrintParameters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimatePrintParametersInputSchema = z.object({
  stlDataUri: z
    .string()
    .describe(
      'The STL file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Changed description
    ),
  material: z.string().describe('The printing material (e.g., PLA, ABS, PETG).'),
  printerType: z.string().describe('The type of 3D printer (e.g., FDM, SLA).'),
});
export type EstimatePrintParametersInput = z.infer<typeof EstimatePrintParametersInputSchema>;

const EstimatePrintParametersOutputSchema = z.object({
  estimatedMaterialUsage: z.string().describe('Estimated material usage in grams.'),
  estimatedPrintingTime: z.string().describe('Estimated printing time in hours.'),
  estimatedCost: z.string().describe('Estimated cost of printing in USD.'),
  notes: z.string().optional().describe('Additional notes or considerations.'),
});
export type EstimatePrintParametersOutput = z.infer<typeof EstimatePrintParametersOutputSchema>;

export async function estimatePrintParameters(
  input: EstimatePrintParametersInput
): Promise<EstimatePrintParametersOutput> {
  return estimatePrintParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimatePrintParametersPrompt',
  input: {schema: EstimatePrintParametersInputSchema},
  output: {schema: EstimatePrintParametersOutputSchema},
  prompt: `You are an expert 3D printing parameter estimator.

You will analyze the provided STL file, printing material, and printer type to estimate the material usage, printing time, and cost.

Provide estimates for:
- Material Usage (grams)
- Printing Time (hours)
- Cost (USD)

Consider these factors:
- STL file complexity
- Material properties
- Printer capabilities

STL File: {{media url=stlDataUri}}
Material: {{{material}}}
Printer Type: {{{printerType}}}

Output your response in JSON format.
`, // Added STL file reference
});

const estimatePrintParametersFlow = ai.defineFlow(
  {
    name: 'estimatePrintParametersFlow',
    inputSchema: EstimatePrintParametersInputSchema,
    outputSchema: EstimatePrintParametersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
