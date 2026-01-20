/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Excluir scripts do build
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    // Excluir scripts da compilação
    config.module.rules.push({
      test: /scripts\/.*\.ts$/,
      use: 'ignore-loader',
    });
    return config;
  },
}

module.exports = nextConfig
