# Bourbon Buddy

A web application for spirits enthusiasts to catalog, rate, and share their collection.

## Features

- Add spirits to your collection with detailed information
- Rate and add tasting notes to your spirits
- Track bottle levels
- Search for spirits using royalty-free images
- Live streaming with WebRTC and Socket.IO
- Modern, responsive UI

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Prisma ORM
- Socket.IO for real-time communication
- WebRTC for peer-to-peer streaming

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server (standard)
npm run dev

# Run the development server with real-time features support
npm run dev:realtime
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Modes

Bourbon Buddy has two development modes:

1. **Standard Mode** (`npm run dev`) - Use this when working on:
   - Static pages
   - Collection management
   - User authentication
   - Any feature not requiring real-time communication

2. **Real-time Mode** (`npm run dev:realtime`) - Use this when working on:
   - Live streaming
   - Chat features
   - WebRTC connections
   - Any feature requiring WebSockets

The real-time mode uses a custom server implementation in `server.js` that properly integrates Socket.IO with Next.js.

> **Important:** If you're experiencing issues with streams, chat, or other real-time features not working, make sure you're running the app in real-time mode!

## Production Deployment

For production deployment, the app automatically uses the real-time server:

```bash
npm run build
npm run start
``` 