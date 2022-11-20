/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/page/1",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
