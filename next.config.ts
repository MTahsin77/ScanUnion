import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thesuit.tech',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
