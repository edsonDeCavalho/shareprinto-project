import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    // Use Docker service names for internal communication
    const authServiceUrl = process.env.NEXT_PUBLIC_API_AUTH_URL || 'http://auth-service:3000';
    
    return [
      {
        source: '/api/auth/:path*',
        destination: `${authServiceUrl}/auth/:path*`,
      },
      {
        source: '/api/user-status/:path*',
        destination: 'http://localhost:3004/api/user-status/:path*',
      },
      {
        source: '/api/order-management/:path*',
        destination: 'http://localhost:3004/api/order-management/:path*',
      },
    ];
  },
};

export default nextConfig;
