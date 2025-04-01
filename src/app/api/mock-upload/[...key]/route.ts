import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // Authentication temporarily disabled for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // Extract the key from pathname, removing /api/mock-upload/ prefix
    const pathParts = request.nextUrl.pathname.split('/');
    const keyParts = pathParts.slice(3); // Skip /api/mock-upload/ parts
    const key = keyParts.join('/');
    
    // Mock saving the file
    // In a real implementation, we would save the file to disk or cloud storage
    const buffer = await request.arrayBuffer();
    
    console.log(`Received file upload: ${key}`);
    console.log(`File size: ${buffer.byteLength} bytes`);

    // Construct the URL where the file would be accessible
    const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_ENDPOINT}/${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}/${key}`;

    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully',
      key,
      url: imageUrl
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json(
      { error: 'Error handling file upload', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 