'use client';

import React, { useState, useEffect } from 'react';
import { getOptimalImageSource } from './utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  isVisible: boolean;
  transitionDuration: number;
  className?: string;
}

// This component handles image optimization and proper loading
export default function OptimizedImage({
  src,
  alt,
  isVisible,
  transitionDuration,
  className = ''
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Load image when component mounts
  useEffect(() => {
    // Get optimized source based on device and network conditions
    const optimizedSrc = getOptimalImageSource(src);
    
    // Create a new image element to preload
    const img = new Image();
    
    // Set up load handler
    img.onload = () => {
      setIsLoaded(true);
      setImageSrc(optimizedSrc);
    };
    
    // Error handler - fallback to original source if optimized version fails
    img.onerror = () => {
      if (optimizedSrc !== src) {
        // Try the original source as fallback
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setIsLoaded(true);
          setImageSrc(src);
        };
        fallbackImg.src = src;
      } else {
        // Mark as loaded even if it fails, to avoid showing loading spinner forever
        setIsLoaded(true);
        setImageSrc(src);
      }
    };
    
    // Set image source to begin loading
    img.src = optimizedSrc;
    
    // Clean up
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover ${className}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: `opacity ${transitionDuration/1000}s ease-in-out`,
            opacity: isVisible && isLoaded ? 1 : 0,
          }}
        />
      )}
      
      {/* Optional loading state when image is not yet loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
} 