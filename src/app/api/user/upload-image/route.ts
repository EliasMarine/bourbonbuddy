import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { imageUrl, type } = await request.json();

    if (!imageUrl || !type || !['profile', 'cover'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Update the user record with the new image URL
    const updateData = type === 'profile' 
      ? { image: imageUrl }
      : { coverPhoto: imageUrl };

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        ...updatedUser,
        image: updatedUser.image,
        coverPhoto: updatedUser.coverPhoto
      }
    });
  } catch (error) {
    console.error('Error updating user image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
} 