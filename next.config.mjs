/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'objectstorageapi.bja.sealos.run',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.objectstorageapi.bja.sealos.run',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
