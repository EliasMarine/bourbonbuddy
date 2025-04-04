#!/usr/bin/env node

/**
 * This script optimizes large background images for better web performance.
 * It creates smaller versions of large images with "-optimized" suffix.
 * 
 * Usage: 
 *   node scripts/optimize-bg-images.js
 * 
 * Requirements:
 *   - sharp: npm install sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const IMAGE_DIR = path.join(process.cwd(), 'public/images/backgrounds/Homepage background');
const MAX_SIZE_MB = 2; // Maximum size in MB
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const QUALITY = 80; // JPEG/WebP quality (0-100)
const MAX_WIDTH = 1920; // Max width for large screens

// Make sure the directory exists
if (!fs.existsSync(IMAGE_DIR)) {
  console.error(`Directory not found: ${IMAGE_DIR}`);
  process.exit(1);
}

// Process all images in the directory
async function optimizeImages() {
  try {
    const files = fs.readdirSync(IMAGE_DIR);
    
    // Filter for image files and exclude already optimized versions
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext) && !file.includes('-optimized');
    });
    
    console.log(`Found ${imageFiles.length} images to check for optimization.`);
    
    for (const file of imageFiles) {
      const filePath = path.join(IMAGE_DIR, file);
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      
      // Check if the file is larger than our max size
      if (fileSize > MAX_SIZE_BYTES) {
        console.log(`Optimizing ${file} (${(fileSize / 1024 / 1024).toFixed(2)} MB)...`);
        
        // Generate the output filename
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        const outputFile = path.join(IMAGE_DIR, `${baseName}-optimized${ext}`);
        
        // Skip if optimized version already exists
        if (fs.existsSync(outputFile)) {
          console.log(`  Optimized version already exists: ${outputFile}`);
          continue;
        }
        
        // Optimize the image
        await sharp(filePath)
          .resize(MAX_WIDTH) // Resize if larger than max width
          .jpeg({ quality: QUALITY, progressive: true })
          .toFile(outputFile);
        
        // Log the results
        const newStats = fs.statSync(outputFile);
        const newSize = newStats.size;
        const reduction = ((fileSize - newSize) / fileSize * 100).toFixed(2);
        
        console.log(`  ✓ Optimized: ${(newSize / 1024 / 1024).toFixed(2)} MB (${reduction}% smaller)`);
      } else {
        console.log(`Skipping ${file} (${(fileSize / 1024 / 1024).toFixed(2)} MB) - already under size limit`);
      }
    }
    
    console.log('Optimization complete!');
  } catch (error) {
    console.error('Error optimizing images:', error);
    process.exit(1);
  }
}

// Run the optimization
optimizeImages(); 