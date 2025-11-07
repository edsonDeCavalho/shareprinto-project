'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Download, 
  Eye, 
  Maximize2, 
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';
// Dynamic import to avoid File API access during build
// import { STLPreviewService, STLPreviewData } from '@/services/stl-preview-service';
type STLPreviewData = any; // Type placeholder for build-time
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FileToPrint {
  fileName?: string;
  size?: number;
  previewImage?: string;
  fileId?: string;
}

interface STLFilesListProps {
  files: FileToPrint[];
  className?: string;
  showPreviews?: boolean;
  compact?: boolean;
}

export function STLFilesList({ 
  files, 
  className = '',
  showPreviews = true,
  compact = false 
}: STLFilesListProps) {
  const [previewData, setPreviewData] = useState<Record<string, STLPreviewData>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize loading states for files that need previews
    const initialLoading: Record<string, boolean> = {};
    files.forEach(file => {
      if (file.fileName && file.fileName.toLowerCase().endsWith('.stl')) {
        initialLoading[file.fileName] = true;
      }
    });
    setLoading(initialLoading);

    // Load existing preview data (only on client side)
    if (typeof window !== 'undefined' && typeof File !== 'undefined') {
      // Dynamically import STLPreviewService only on client
      import('@/services/stl-preview-service').then(({ STLPreviewService }) => {
        const existingPreviews = STLPreviewService.getAllPreviews();
        const previewMap: Record<string, STLPreviewData> = {};
        
        existingPreviews.forEach(preview => {
          previewMap[preview.fileName] = preview;
        });
        
        setPreviewData(previewMap);
      }).catch(() => {
        // Silently fail if service can't be loaded
      });
    }
  }, [files]);

  const handleDownload = async (file: FileToPrint) => {
    // In a real implementation, this would download the actual file
    // For now, we'll just show a message
    console.log('Downloading file:', file.fileName);
    
    // If we have the file stored locally, we can create a download link
    if (file.fileId && typeof window !== 'undefined' && typeof File !== 'undefined') {
      try {
        const { STLPreviewService } = await import('@/services/stl-preview-service');
        const storedFile = STLPreviewService.getStoredFile(file.fileId);
        if (storedFile) {
          const fileBlob = STLPreviewService.base64ToFile(
            storedFile.data, 
            storedFile.name, 
            storedFile.type
          );
          
          const url = URL.createObjectURL(fileBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.fileName || 'download.stl';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  };

  const formatFileSize = (size?: number): string => {
    if (!size) return 'Unknown';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = size;
    
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    
    return `${fileSize.toFixed(2)} ${units[unitIndex]}`;
  };

  const isSTLFile = (fileName?: string): boolean => {
    return fileName?.toLowerCase().endsWith('.stl') || false;
  };

  const getFileIcon = (fileName?: string) => {
    if (isSTLFile(fileName)) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  if (compact) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <Card key={index} className="overflow-hidden">
              
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.fileName || `File ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.fileName)}
                        <span>{file.fileName || `File ${index + 1}`}</span>
                        {isSTLFile(file.fileName) && (
                          <Badge variant="secondary" className="text-xs">
                            STL
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      {isSTLFile(file.fileName) ? '3D Model' : 'Document'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isSTLFile(file.fileName) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file)}
                            className="flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No files attached to this order.</p>
            </div>
          )}
        </CardContent>
      </Card>

      
    </div>
  );
}
