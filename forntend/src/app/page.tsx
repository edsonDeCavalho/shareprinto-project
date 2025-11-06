import { UploadForm } from '@/components/upload-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Box } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-8 bg-grid">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="shadow-2xl backdrop-blur-sm bg-background/80 dark:bg-card/80">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
              <Box className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-headline">SharePrinto</CardTitle>
            <CardDescription className="text-md sm:text-lg">
              Upload your .stl file to get an instant print estimate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
