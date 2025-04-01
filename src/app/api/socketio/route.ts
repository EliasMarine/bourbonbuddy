import { NextResponse } from 'next/server';
import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Socket } from 'net';

/**
 * IMPORTANT: This route is only used as a fallback for Socket.IO when the custom server.js
 * is not being used. For production or full functionality, please run:
 * - Development: `npm run dev:socket`
 * - Production: `npm run start:socket`
 * 
 * These commands use the custom server implementation in server.js at the project root,
 * which provides a more robust Socket.IO implementation with proper WebSocket support.
 */

interface SocketServer extends HTTPServer {
  io?: IOServer;
}

interface SocketWithIO extends Socket {
  server: SocketServer;
}

// This keeps track of the Socket.IO server instance
let io: IOServer | undefined;

export async function GET(req: Request) {
  if (io) {
    return NextResponse.json({
      status: 'ok',
      message: 'Socket.IO server is already running',
      socketCount: io.engine?.clientsCount || 0
    });
  }

  try {
    // Check if we can get server from request to initialize Socket.IO
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const forceNewServer = searchParams.get('force') === 'true';

    if (forceNewServer) {
      // This is just a placeholder - in App Router we need to set up Socket.IO differently
      // This endpoint mainly serves as a health check
      console.log('Received force=true parameter but cannot create new server in route handler');
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Socket.IO endpoint is accessible. Socket.IO server should be initialized via middleware or server component.',
      note: 'For production use, consider setting up Socket.IO with a custom server'
    });
  } catch (err) {
    console.error('Error in Socket.IO route handler:', err);
    return NextResponse.json({ 
      status: 'error',
      message: 'Socket.IO initialization failed',
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

// For CORS
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Required for Socket.IO
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 