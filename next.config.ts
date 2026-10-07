import type { NextConfig } from 'next'

/** Static export: the site is plain HTML/JS/CSS and can be served by Nginx like the platform SPA. */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
}

export default nextConfig
