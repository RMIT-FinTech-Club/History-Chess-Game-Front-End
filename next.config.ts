import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fintech-club-vietnamese-historical-chess-game.s3.ap-southeast-2.amazonaws.com',
        port: '',
        pathname: '/avatars/**',
      },
    ],
  },
};

export default nextConfig;