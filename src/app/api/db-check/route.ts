import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDatabaseUrl } from '@/lib/env';

export async function GET() {
  try {
    // Check database connection
    const dbConnectionString = getDatabaseUrl();
    const isLocal = dbConnectionString.includes('localhost') || 
                    dbConnectionString.includes('127.0.0.1');
    
    // Mask sensitive parts of the connection string
    const maskedConnectionString = dbConnectionString
      .replace(/\/\/[^:]+:[^@]+@/, '//[username]:[password]@');
    
    // Check the database connection by counting users
    let dbStatus = 'unknown';
    let userCount = 0;
    
    try {
      // Just do a simple query to verify connection
      await prisma.$queryRaw`SELECT 1`;
      userCount = await prisma.user.count();
      dbStatus = 'connected';
    } catch (dbError: any) {
      dbStatus = 'error';
      console.error('Database error:', dbError);
    }
    
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        isLocal,
        connection: maskedConnectionString,
        userCount,
        environment: process.env.NODE_ENV || 'unknown',
      }
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error.message 
    }, { status: 500 });
  }
} 