/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Images are proxied through our own cache route, so no remote patterns are
  // needed here. Source image URLs expire, particularly on Facebook.
  images: { unoptimized: true },
}

export default nextConfig
