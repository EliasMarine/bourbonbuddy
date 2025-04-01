import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';

// Ensure environment variables exist
if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error('Missing AWS_ACCESS_KEY_ID environment variable');
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('Missing AWS_SECRET_ACCESS_KEY environment variable');
}

if (!process.env.AWS_REGION) {
  throw new Error('Missing AWS_REGION environment variable');
}

if (!process.env.AWS_BUCKET_NAME) {
  throw new Error('Missing AWS_BUCKET_NAME environment variable');
}

if (!process.env.AWS_ENDPOINT) {
  throw new Error('Missing AWS_ENDPOINT environment variable');
}

// Create a custom S3 client for Mega S3
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: `https://${process.env.AWS_ENDPOINT}`,
  forcePathStyle: true,
});

// Modified upload function for Mega S3
export async function uploadToS3(file: Buffer, key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  });

  await s3Client.send(command);
  
  // Construct the URL using Mega's format
  return `https://${process.env.AWS_ENDPOINT}/${process.env.AWS_BUCKET_NAME}/${key}`;
}

// Function to generate signed upload URL
export async function getSignedUploadUrl(key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: 'application/octet-stream',
    ACL: 'public-read',
  });

  // Log the command for debugging
  console.log('S3 command details:', {
    bucket: process.env.AWS_BUCKET_NAME,
    key,
    endpoint: process.env.AWS_ENDPOINT,
    region: process.env.AWS_REGION,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
} 