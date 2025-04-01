import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Constants for stream cleanup
const CLEANUP_PERIODS = {
  STALE_LIVE: 1 * 60 * 60 * 1000,     // 1 hour for live streams
  INACTIVE: 1 * 60 * 60 * 1000,       // 1 hour for inactive streams
  COMPLETED: 1 * 60 * 60 * 1000       // 1 hour for completed streams
};

// POST /api/streams/cleanup - Clean up stale streams
// This endpoint should be called by a cron job every hour
export async function POST() {
  try {
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - CLEANUP_PERIODS.STALE_LIVE);
    const inactiveThreshold = new Date(now.getTime() - CLEANUP_PERIODS.INACTIVE);

    // 1. Mark stale live streams as not live
    const staleLiveStreams = await prisma.stream.updateMany({
      where: {
        isLive: true,
        startedAt: {
          lt: staleThreshold
        }
      },
      data: {
        isLive: false
      }
    });

    // 2. Delete old inactive streams
    const deletedStreams = await prisma.stream.deleteMany({
      where: {
        isLive: false,
        startedAt: {
          lt: inactiveThreshold
        }
      }
    });

    return NextResponse.json({
      success: true,
      staleLiveCount: staleLiveStreams.count,
      deletedCount: deletedStreams.count,
      message: `Cleaned up ${staleLiveStreams.count} stale live streams and deleted ${deletedStreams.count} old streams`
    });
  } catch (error) {
    console.error('Stream cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 