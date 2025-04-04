// Maximum size for background images (in bytes)
// 2MB is a reasonable size for web background images
export const MAX_BACKGROUND_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Gets the optimal source for an image based on device screen size and connection
 * @param originalSrc The original image source
 * @returns The optimized image source
 */
export function getOptimalImageSource(originalSrc: string): string {
  // If we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check if the connection is slow
    const isSlowConnection = isSlowNetworkConnection();
    
    // Check if we're on a mobile device
    const isMobile = window.innerWidth < 768;
    
    // If on mobile or slow connection, return a compressed version if available
    if (isSlowConnection || isMobile) {
      // Try to get an optimized version of the image
      const optimizedSrc = getOptimizedImagePath(originalSrc);
      if (optimizedSrc !== originalSrc) {
        return optimizedSrc;
      }
    }
  }
  
  return originalSrc;
}

/**
 * Checks if the user has a slow network connection
 * @returns boolean indicating if the network connection is slow
 */
function isSlowNetworkConnection(): boolean {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    
    // Check if the effectiveType is 2G or slow-2G
    if (connection && connection.effectiveType) {
      return ['slow-2g', '2g', '3g'].includes(connection.effectiveType);
    }
    
    // Check if saveData is enabled
    if (connection && connection.saveData) {
      return true;
    }
  }
  
  return false;
}

/**
 * Gets the optimized image path if available
 * @param originalSrc The original image source
 * @returns The optimized image source if available, otherwise the original
 */
function getOptimizedImagePath(originalSrc: string): string {
  // If the image is in the Homepage background folder
  if (originalSrc.includes('/Homepage background/')) {
    // Check if we can generate a smaller version path
    const parts = originalSrc.split('.');
    const extension = parts.pop();
    
    // If we can form a valid path with a smaller version
    if (extension && ['jpg', 'jpeg', 'png'].includes(extension.toLowerCase())) {
      const basePath = parts.join('.');
      return `${basePath}-optimized.${extension}`;
    }
  }
  
  return originalSrc;
} 