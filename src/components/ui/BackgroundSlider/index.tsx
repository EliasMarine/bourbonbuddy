'use client';

import React, { useState, useEffect } from 'react';
import OptimizedImage from './ImageOptimizer';

interface BackgroundSliderProps {
  images: string[];
  interval?: number; // in milliseconds
  transitionDuration?: number; // in milliseconds
  overlay?: React.ReactNode;
}

export default function BackgroundSlider({
  images,
  interval = 12000, // Default to 12 seconds
  transitionDuration = 2000, // Default to 2 seconds
  overlay
}: BackgroundSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return; // Don't animate if there's only one image

    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      
      // After transition duration, update the current image and reset
      const transitionTimeoutId = setTimeout(() => {
        setCurrentImageIndex(nextImageIndex);
        setNextImageIndex((nextImageIndex + 1) % images.length);
        setIsTransitioning(false);
      }, transitionDuration);

      return () => clearTimeout(transitionTimeoutId);
    }, interval);

    return () => clearInterval(intervalId);
  }, [currentImageIndex, nextImageIndex, images, interval, transitionDuration]);

  // Generate image paths with proper encoding for spaces
  const safeImagePaths = images.map(path => path.replace(/\s/g, '%20'));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Current image */}
      <OptimizedImage
        src={safeImagePaths[currentImageIndex]}
        alt="Background"
        isVisible={!isTransitioning}
        transitionDuration={transitionDuration}
      />

      {/* Next image (for crossfade) */}
      <OptimizedImage
        src={safeImagePaths[nextImageIndex]}
        alt="Background"
        isVisible={isTransitioning}
        transitionDuration={transitionDuration}
      />

      {/* Additional images to preload */}
      <div className="hidden">
        {safeImagePaths.map((path, index) => (
          index !== currentImageIndex && index !== nextImageIndex && (
            <OptimizedImage
              key={`preload-${index}`}
              src={path}
              alt="Preload background"
              isVisible={false}
              transitionDuration={0}
            />
          )
        ))}
      </div>

      {/* Optional overlay */}
      {overlay && overlay}
    </div>
  );
} 