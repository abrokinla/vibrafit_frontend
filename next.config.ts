const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';

export const nextConfig: NextConfig = {  
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'es'
  },  
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

export default withNextIntl(nextConfig);
