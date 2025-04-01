import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { SpiritSchema } from '@/lib/validations/spirit';
import spiritCategories from '@/lib/spiritCategories';
import { ZodError } from 'zod';
import { collectionGetLimiter, collectionPostLimiter } from '@/lib/rate-limiters';

const prisma = new PrismaClient();

// GET /api/collection - Get user's collection
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { spirits: true },
    });

    return NextResponse.json({ spirits: user?.spirits || [] });
  } catch (error) {
    console.error('Collection GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/collection - Add new spirit to collection
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in API:', session?.user);

    // Check authentication
    if (!session?.user?.email) {
      console.error('Unauthorized request - no session email');
      return NextResponse.json(
        { error: 'Unauthorized - No user email in session' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Log request info for debugging
    console.log('Request from user:', session.user.email);
    
    // Convert FormData to an object and handle types properly
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      console.log(`Form data ${key}:`, typeof value, value instanceof File ? 'File' : value);
      data[key] = value;
    });
    
    // Parse nose, palate, and finish notes (they're stored as JSON strings)
    if (typeof data.nose === 'string') {
      try {
        data.nose = JSON.parse(data.nose as string);
      } catch (e) {
        console.warn(`Failed to parse nose notes as JSON: "${data.nose}"`, e);
        // Fallback: store as a single item array if parsing fails
        data.nose = data.nose ? [data.nose] : [];
      }
    }
    
    if (typeof data.palate === 'string') {
      try {
        data.palate = JSON.parse(data.palate as string);
      } catch (e) {
        console.warn(`Failed to parse palate notes as JSON: "${data.palate}"`, e);
        // Fallback: store as a single item array if parsing fails
        data.palate = data.palate ? [data.palate] : [];
      }
    }
    
    if (typeof data.finish === 'string') {
      try {
        data.finish = JSON.parse(data.finish as string);
      } catch (e) {
        console.warn(`Failed to parse finish notes as JSON: "${data.finish}"`, e);
        // Fallback: store as a single item array if parsing fails
        data.finish = data.finish ? [data.finish] : [];
      }
    }
    
    // Set types correctly
    const parsedData = {
      name: String(data.name || ''),
      brand: String(data.brand || ''),
      type: String(data.type || ''),
      category: String(data.category || 'whiskey'),
      description: data.description ? String(data.description) : undefined,
      nose: Array.isArray(data.nose) ? data.nose.join(',') : data.nose ? String(data.nose) : undefined,
      palate: Array.isArray(data.palate) ? data.palate.join(',') : data.palate ? String(data.palate) : undefined,
      finish: Array.isArray(data.finish) ? data.finish.join(',') : data.finish ? String(data.finish) : undefined,
      notes: data.notes ? String(data.notes) : undefined,
      imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
      proof: data.proof ? (typeof data.proof === 'string' ? parseFloat(data.proof) : Number(data.proof)) : undefined,
      price: data.price ? (typeof data.price === 'string' ? parseFloat(data.price) : Number(data.price)) : undefined,
      rating: data.rating ? (typeof data.rating === 'string' ? parseFloat(data.rating) : Number(data.rating)) : undefined,
      isFavorite: data.isFavorite === 'true' || data.isFavorite === true,
      age: data.age ? (typeof data.age === 'string' ? parseFloat(data.age) : Number(data.age)) : undefined,
      bottleLevel: data.bottleLevel ? (typeof data.bottleLevel === 'string' ? parseFloat(data.bottleLevel) : Number(data.bottleLevel)) : undefined
    };
    
    console.log('Parsed data:', parsedData);
    console.log('Validation will check:', {
      categoryValid: spiritCategories.map(c => c.id).includes(parsedData.category),
      typeValid: spiritCategories.flatMap(c => c.subcategories.map(s => s.toLowerCase())).includes(parsedData.type.toLowerCase()),
      imageUrlValid: parsedData.imageUrl?.startsWith('/') || parsedData.imageUrl?.startsWith('http')
    });
    
    // Validate input data using the schema
    try {
      const validatedData = SpiritSchema.parse(parsedData);
      console.log('Validated data:', validatedData);
      
      // Look up the user by email or create if not exists
      console.log('Looking up user with email:', session.user.email);
      
      try {
        // Try to find the user
        let user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        // If user doesn't exist, create a new one with the session data
        if (!user && session.user.email) {
          console.log('User not found, creating new user with email:', session.user.email);
          
          // Create user with required fields
          try {
            user = await prisma.user.create({
              data: {
                email: session.user.email,
                name: session.user.name || 'New User',
                // Only include ID if provided by session
                ...(session.user.id ? { id: session.user.id } : {}),
                // Add any required fields from your schema
                username: session.user.email.split('@')[0], // Generate username from email
                password: '', // Add empty password or generate one
              },
            });
            console.log('Created new user:', user.id);
          } catch (createError) {
            console.error('Error creating user:', createError);
            // Try a simpler approach without ID
            try {
              user = await prisma.user.create({
                data: {
                  email: session.user.email,
                  name: session.user.name || 'New User',
                  username: session.user.email.split('@')[0],
                  password: '',
                },
              });
              console.log('Created user with generated ID:', user.id);
            } catch (fallbackError) {
              console.error('Failed to create user with fallback approach:', fallbackError);
              throw fallbackError;
            }
          }
        }

        if (!user) {
          console.error('Failed to find or create user for email:', session.user.email);
          return NextResponse.json(
            { error: 'Unable to find or create user account' },
            { status: 500 }
          );
        }
        
        console.log('Using user:', user.id);

        // Create the spirit
        const createSpirit = {
          name: validatedData.name,
          brand: validatedData.brand,
          type: validatedData.type,
          category: validatedData.category,
          description: validatedData.description,
          proof: validatedData.proof,
          imageUrl: validatedData.imageUrl,
          notes: validatedData.notes,
          nose: validatedData.nose,
          palate: validatedData.palate,
          finish: validatedData.finish,
          price: validatedData.price,
          rating: validatedData.rating,
          isFavorite: validatedData.isFavorite || false,
          bottleLevel: validatedData.bottleLevel !== undefined ? validatedData.bottleLevel : 100, // Default to full bottle (100)
          ownerId: user.id // Use ownerId instead of userId to match Prisma schema
        };

        console.log('Spirit data to be created:', createSpirit);

        const spirit = await prisma.spirit.create({
          data: createSpirit,
        });
        
        console.log('Spirit created successfully:', spirit.id);

        return NextResponse.json(spirit);
      } catch (userError) {
        console.error('Error finding/creating user:', userError);
        return NextResponse.json(
          { error: 'Database error with user', details: userError instanceof Error ? userError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        console.error('Validation error details:', JSON.stringify(validationError.errors, null, 2));
        return NextResponse.json(
          { 
            error: 'Validation error',
            details: validationError.errors 
          },
          { status: 400 }
        );
      }
      
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Validation failed', details: validationError instanceof Error ? validationError.message : 'Unknown error' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Collection POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 