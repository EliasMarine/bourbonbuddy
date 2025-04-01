/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.1.193"]
    },
  },
  // Updated for modern Next.js standards
  serverExternalPackages: ['argon2'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bourbonbuddy.s3.ca-west-1.s4.mega.io',
        pathname: '**',
      },
    ],
    domains: [
      'localhost',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'images.unsplash.com',
      'bourbon-buddy.s3.amazonaws.com',
      'bourbon-buddy.s3.us-east-1.amazonaws.com',
    ]
  },
  // Set a custom webpack config for Socket.IO
  webpack: (config, { isServer }) => {
    // Important: For client-side bundle, ensure socket.io-client is processed correctly
    if (!isServer) {
      config.externals = [...(config.externals || []), 
        { 'bufferutil': 'bufferutil', 'utf-8-validate': 'utf-8-validate' }
      ];
    }
    
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Add keep-alive for WebSocket connections
          {
            key: 'Connection',
            value: 'keep-alive',
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ['192.168.1.219', '192.168.1.193']
}

module.exports = nextConfig