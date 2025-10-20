/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src', 'pages', 'components', 'lib', 'utils'], // Especifica os diretórios para lint
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', '@sparticuz/chromium', 'playwright-core'],
    outputFileTracingIncludes: {
      'app/api/automation/run/route': [
        './node_modules/@sparticuz/chromium/bin/**'
      ]
    }
  },
  images: {
    domains: ['localhost', 'naf-contabil.netlify.app'],
    unoptimized: true
  },
  trailingSlash: false,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://naf-contabil.netlify.app',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'naf-production-secret-2024'
  }
};

module.exports = nextConfig;
