'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { STLPreviewService } from '@/services/stl-preview-service';
import { FileText, Info, AlertCircle, CheckCircle } from 'lucide-react';

interface STLDebugInfoProps {
  files: Array<{
    fileName?: string;
    size?: number;
    fileId?: string;
  }>;
  className?: string;
}

export function STLDebugInfo({ files, className = '' }: STLDebugInfoProps) {
  const [showDebug, setShowDebug] = React.useState(false);
  const [debugInfo, setDebugInfo] = React.useState<any>(null);

  React.useEffect(() => {
    if (showDebug) {
      const info = {
        files: files.map(file => ({
          ...file,
          hasFileId: !!file.fileId,
          storedFile: file.fileId ? STLPreviewService.getStoredFile(file.fileId) : null,
          isSTL: file.fileName?.toLowerCase().endsWith('.stl') || false,
        })),
        allStoredFiles: STLPreviewService.getStoredFiles(),
        allPreviews: STLPreviewService.getAllPreviews(),
        localStorageKeys: Object.keys(localStorage).filter(key => 
          key.includes('stl') || key.includes('preview')
        ),
      };
      setDebugInfo(info);
    }
  }, [showDebug, files]);

  const hasIssues = files.some(file => 
    file.fileName?.toLowerCase().endsWith('.stl') && !file.fileId
  );

  if (!showDebug) {
    return (
      <div className={className}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug(true)}
          className="flex items-center gap-2"
        >
          <Info className="h-4 w-4" />
          {hasIssues ? 'Debug STL Issues' : 'Debug STL Info'}
          {hasIssues && <AlertCircle className="h-4 w-4 text-orange-500" />}
        </Button>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          STL Debug Information
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(false)}
            className="ml-auto"
          >
            Close
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {debugInfo && (
          <>
            <div className="space-y-2">
              <h4 className="font-semibold">Files Analysis</h4>
              {debugInfo.files.map((file: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{file.fileName || `File ${index + 1}`}</span>
                    <div className="flex gap-1">
                      {file.isSTL && <Badge variant="secondary">STL</Badge>}
                      {file.hasFileId ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Has ID
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          No ID
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Size: {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown'}</p>
                    <p>File ID: {file.fileId || 'None'}</p>
                    <p>Stored: {file.storedFile ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Storage Status</h4>
              <div className="text-sm space-y-1">
                <p>Stored Files: {debugInfo.allStoredFiles.length}</p>
                <p>Stored Previews: {debugInfo.allPreviews.length}</p>
                <p>LocalStorage Keys: {debugInfo.localStorageKeys.join(', ')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Recommendations</h4>
              <div className="text-sm space-y-1">
                {hasIssues && (
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-orange-800">
                      ⚠️ Some STL files don't have file IDs. This usually means they weren't properly stored during upload.
                    </p>
                  </div>
                )}
                {!hasIssues && debugInfo.files.some((f: any) => f.isSTL) && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800">
                      ✅ All STL files have proper file IDs and should display correctly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}





