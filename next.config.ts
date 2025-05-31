import type {NextConfig} from 'next';

export const nextConfig: NextConfig = {

  output: 'standalone',
   i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'es',
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, 
  },
};
export default nextConfig;
