'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  // Ensure we have at least 2 valid images
  const validImages = images.filter(img => img); // Filter out empty strings
  const imagesList = validImages.length === 0 
    ? ['/images/backgrounds/Homepage background/bourbon_bg.png'] // Default image
    : validImages.length === 1 
      ? [...validImages, ...validImages] // Duplicate if only one image
      : validImages;
  
  // State for tracking images and transitions
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Refs for timers and current state
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const transitionId = useRef<NodeJS.Timeout | null>(null);
  const imagesCount = useRef(imagesList.length);
  
  // Store current indices in refs to avoid dependency issues
  const activeIndexRef = useRef(activeIndex);
  const nextIndexRef = useRef(nextIndex);
  
  // Update refs when state changes
  useEffect(() => {
    activeIndexRef.current = activeIndex;
    nextIndexRef.current = nextIndex;
    imagesCount.current = imagesList.length;
  }, [activeIndex, nextIndex, imagesList.length]);
  
  // Safe image paths with proper encoding for spaces
  const safeImagePaths = imagesList.map(path => path.replace(/\s/g, '%20'));
  
  // Set up the slideshow effect
  useEffect(() => {
    // Skip slideshow for single image
    if (imagesList.length <= 1) return;
    
    // Function to handle transitions
    const handleTransition = () => {
      // Skip if already transitioning
      if (isTransitioning) return;
      
      // Start transition
      setIsTransitioning(true);
      
      // After transition completes
      transitionId.current = setTimeout(() => {
        // Calculate indices based on refs (not state)
        const current = nextIndexRef.current;
        const next = (nextIndexRef.current + 1) % imagesCount.current;
        
        // Update state with calculated indices
        setActiveIndex(current);
        setNextIndex(next);
        setIsTransitioning(false);
      }, transitionDuration);
    };
    
    // Start interval
    intervalId.current = setInterval(handleTransition, interval);
    
    // Cleanup on unmount
    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
      if (transitionId.current) clearTimeout(transitionId.current);
    };
  }, [imagesList.length, interval, transitionDuration, isTransitioning]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Active image */}
      <div 
        className="absolute inset-0"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transition: `opacity ${transitionDuration/1000}s ease-in-out`
        }}
      >
        <OptimizedImage
          src={safeImagePaths[activeIndex]}
          alt="Background"
          isVisible={true}
          transitionDuration={0} // No transition here - we handle it in the parent div
        />
      </div>

      {/* Next image (for crossfade) */}
      <div 
        className="absolute inset-0"
        style={{
          opacity: isTransitioning ? 1 : 0,
          transition: `opacity ${transitionDuration/1000}s ease-in-out`
        }}
      >
        <OptimizedImage
          src={safeImagePaths[nextIndex]}
          alt="Background"
          isVisible={true}
          transitionDuration={0} // No transition here - we handle it in the parent div
        />
      </div>

      {/* Optional overlay */}
      {overlay && overlay}
    </div>
  );
} 