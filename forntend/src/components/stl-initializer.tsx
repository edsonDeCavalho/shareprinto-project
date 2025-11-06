'use client';

import { useEffect } from 'react';
import { STLPreviewService } from '@/services/stl-preview-service';

export function STLInitializer() {
  useEffect(() => {
    // Initialize sample STL files for testing
    STLPreviewService.initializeSampleFiles();
  }, []);

  return null; // This component doesn't render anything
}





