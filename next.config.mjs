/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{
      hostname: 'static-cdn.jtvnw.net',
      protocol: 'https',
      pathname: '/**'
    }]
  }
};

export default nextConfig;
