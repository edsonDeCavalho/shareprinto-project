'use client';

import React from 'react';
import { FileText } from 'lucide-react';

interface FileToPrint {
  fileName?: string;
  size?: number;
  previewImage?: string;
  fileId?: string;
}

interface OrderFilesPreviewProps {
  files: FileToPrint[];
  className?: string;
}

export function OrderFilesPreview({ files, className = '' }: OrderFilesPreviewProps) {
  const stlFiles = files.filter(file => 
    file.fileName?.toLowerCase().endsWith('.stl')
  );

  if (stlFiles.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 bg-muted/50 rounded-lg ${className}`}>
        <div className="text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2" />
          <p className="text-xs">No STL files</p>
        </div>
      </div>
    );
  }

  // Show the first STL file as preview
  const firstSTLFile = stlFiles[0];
  
  return (
    <div className={`h-32 bg-muted/50 rounded-lg overflow-hidden relative ${className}`}>
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2" />
          <p className="text-xs">{firstSTLFile.fileName}</p>
          <p className="text-xs text-muted-foreground">3D preview disabled</p>
        </div>
      </div>
      {stlFiles.length > 1 && (
        <div className="absolute top-2 right-2 bg-background/80 rounded-full px-2 py-1 text-xs font-medium">
          +{stlFiles.length - 1} more
        </div>
      )}
    </div>
  );
}
