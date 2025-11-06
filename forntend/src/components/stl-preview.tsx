'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RotateCcw, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STLPreviewService } from '@/services/stl-preview-service';

interface STLPreviewProps {
  file: File | string; // File object or URL string
  width?: number;
  height?: number;
  className?: string;
  showControls?: boolean;
}

export function STLPreview({ 
  file, 
  width = 300, 
  height = 200, 
  className = '',
  showControls = true 
}: STLPreviewProps) {
  // Don't render if file is empty or invalid
  if (!file || (typeof file === 'string' && file.trim() === '')) {
    return (
      <Card className={className} key="no-file">
        <CardContent className="p-0 relative">
          <div 
            className="relative flex items-center justify-center"
            style={{ width, height }}
          >
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3" />
              <p className="text-sm">No 3D model file available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mountedRef = useRef(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Don't clear the container - let React manage it
    // Just check if there's already a canvas and remove it
    if (canvasRef.current) {
      try {
        mountRef.current?.removeChild(canvasRef.current);
      } catch (error) {
        console.warn('Error removing existing canvas:', error);
      }
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xf8fafc, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -5);
    scene.add(pointLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    // Add to DOM safely
    try {
      mountRef.current.appendChild(renderer.domElement);
      canvasRef.current = renderer.domElement;
    } catch (error) {
      console.warn('Error adding renderer to DOM:', error);
      return;
    }

    // Animation loop
    let animationId: number;
    
    const animate = () => {
      if (!mountedRef.current) return;
      
      animationId = requestAnimationFrame(animate);
      
      // Check if refs are still valid
      if (controlsRef.current && rendererRef.current && sceneRef.current) {
        controlsRef.current.update();
        rendererRef.current.render(sceneRef.current, camera);
      }
    };
    animate();

    // Load STL file
    const loadSTL = async () => {
      try {
        setLoading(true);
        setError(null);



        const loader = new STLLoader();
        let geometry: THREE.BufferGeometry;

        if (typeof file === 'string') {
          // Check if it's a file ID (stored file) or a URL
          if (!file || file.trim() === '') {
            throw new Error('No file ID provided');
          }
          
          const storedFile = STLPreviewService.getStoredFile(file);
          
          if (storedFile) {
            // Load from stored file data
            const fileBlob = STLPreviewService.base64ToFile(
              storedFile.data, 
              storedFile.name, 
              storedFile.type
            );
            const arrayBuffer = await fileBlob.arrayBuffer();
            geometry = loader.parse(arrayBuffer);
          } else {
            // Try to load as URL
            geometry = await new Promise((resolve, reject) => {
              loader.load(file, resolve, undefined, reject);
            });
          }
        } else {
          // Load from File object
          const arrayBuffer = await file.arrayBuffer();
          geometry = loader.parse(arrayBuffer);
        }

        // Create material
        const material = new THREE.MeshPhongMaterial({
          color: 0x3b82f6,
          specular: 0x111111,
          shininess: 200,
          transparent: true,
          opacity: 0.9,
        });

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        meshRef.current = mesh;

        // Center and scale the model
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        if (box) {
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 3 / maxDim;
          
          mesh.position.sub(center.multiplyScalar(scale));
          mesh.scale.setScalar(scale);
        }

        scene.add(mesh);
        setLoading(false);
      } catch (err) {
        console.error('Error loading STL:', err);
        
        let errorMessage = 'Failed to load 3D model';
        
        if (err instanceof Error) {
          if (err.message === 'No file ID provided') {
            errorMessage = 'No 3D model file available';
          } else if (err.message.includes('Failed to fetch')) {
            errorMessage = 'Unable to load 3D model file';
          } else if (err.message.includes('parse')) {
            errorMessage = 'Invalid 3D model file format';
          }
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    loadSTL();

    // Cleanup
    return () => {
      // Mark as unmounted
      mountedRef.current = false;
      
      // Cancel animation frame
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // Dispose controls
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
                // Remove renderer from DOM safely
      if (mountRef.current && canvasRef.current) {
        try {
          // Check if the element is still a child of the mount ref
          if (mountRef.current.contains(canvasRef.current)) {
            mountRef.current.removeChild(canvasRef.current);
          }
        } catch (error) {
          console.warn('Error removing renderer from DOM:', error);
          // Don't try to clear the entire container - let React handle it
        }
      }
      
      // Clear canvas ref
      canvasRef.current = null;
      
      // Dispose renderer
      try {
        renderer.dispose();
      } catch (error) {
        console.warn('Error disposing renderer:', error);
      }
      
      // Dispose mesh and materials
      if (meshRef.current) {
        try {
          meshRef.current.geometry.dispose();
          if (meshRef.current.material instanceof THREE.Material) {
            meshRef.current.material.dispose();
          }
        } catch (error) {
          console.warn('Error disposing mesh:', error);
        }
      }
      
      // Clear scene safely
      try {
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (object.material instanceof THREE.Material) {
              object.material.dispose();
            }
          }
        });
      } catch (error) {
        console.warn('Error clearing scene:', error);
      }
      
      // Clear references
      sceneRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      meshRef.current = null;
    };
  }, [file, width, height]);

  // Reset mounted ref on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      // Ensure cleanup on unmount
      if (canvasRef.current && mountRef.current) {
        try {
          if (mountRef.current.contains(canvasRef.current)) {
            mountRef.current.removeChild(canvasRef.current);
          }
        } catch (error) {
          console.warn('Error in unmount cleanup:', error);
        }
        canvasRef.current = null;
      }
    };
  }, []);

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const zoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.5);
      controlsRef.current.update();
    }
  };

  const zoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.5);
      controlsRef.current.update();
    }
  };

  return (
    <Card className={className} key={`stl-preview-${typeof file === 'string' ? file : file.name}`}>
      <CardContent className="p-0 relative">
        <div 
          ref={mountRef} 
          className="relative"
          style={{ width, height }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading 3D model...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {error === 'No 3D model file available' 
                    ? 'This order doesn\'t have a 3D model file attached'
                    : 'Unable to preview this file'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {showControls && !loading && !error && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={resetView}
              className="h-8 w-8 p-0"
              title="Reset view"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={zoomIn}
              className="h-8 w-8 p-0"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={zoomOut}
              className="h-8 w-8 p-0"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
