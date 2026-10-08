/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Listing photos come from arbitrary hosts (Unsplash, host-provided URLs, our /uploads), so we use
  // plain <img> tags instead of next/image and skip the image-domain allowlist.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
