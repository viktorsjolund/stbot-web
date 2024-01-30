/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{
      hostname: 'static-cdn.jtvnw.net',
      protocol: 'https',
      pathname: '/jtv_user_pictures/**'
    }]
  }
};

export default nextConfig;
