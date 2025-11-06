import type { EstimatePrintParametersOutput } from '@/ai/flows/estimate-print-parameters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Scale, Clock, Info } from 'lucide-react';

export function ResultsCard(props: EstimatePrintParametersOutput) {
  const { estimatedMaterialUsage, estimatedPrintingTime, estimatedCost, notes } = props;

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle>Estimation Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Scale className="h-6 w-6 text-primary" />
                <div>
                    <p className="text-sm text-muted-foreground">Material</p>
                    <p className="font-semibold">{estimatedMaterialUsage}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-semibold">{estimatedPrintingTime}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="font-semibold">{estimatedCost}</p>
                </div>
            </div>
        </div>
        {notes && (
          <>
            <Separator />
            <div className="flex items-start gap-3 text-sm">
                <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                    <p className="font-semibold mb-1">Additional Notes</p>
                    <p className="text-muted-foreground">{notes}</p>
                </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
