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
  const [error, setError] = useState(false);

  // Load image when component mounts or src changes
  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
    
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
      // If we're already using the original source or it also fails
      if (optimizedSrc === src || error) {
        // Mark as loaded but indicate error
        setIsLoaded(true);
        setError(true);
        // Use a placeholder or the original source even if it might not work
        setImageSrc(src);
      } else {
        // Try the original source as fallback
        setError(true); // Mark that we had an error with optimized version
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setIsLoaded(true);
          setImageSrc(src);
        };
        fallbackImg.onerror = () => {
          // Both original and optimized failed
          setIsLoaded(true);
          setError(true);
        };
        fallbackImg.src = src;
      }
    };
    
    // Set image source to begin loading
    img.src = optimizedSrc;
    
    // Clean up
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, error]);

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
          }}
        />
      )}
      
      {/* Loading spinner */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error fallback */}
      {isLoaded && error && !imageSrc && (
        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>Image could not be loaded</p>
        </div>
      )}
    </>
  );
} 