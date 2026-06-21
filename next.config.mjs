/** @type {import('next').NextConfig} */

// Project-site op GitHub Pages => served onder /<repo>.
// Lokaal (dev) willen we geen basePath; in productie wel.
const isProd = process.env.NODE_ENV === "production";
const repo = "herken-de-oranje-selectie";

const nextConfig = {
  output: "export",
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  images: { unoptimized: true },
  trailingSlash: true,
  // basePath beschikbaar in de client (voor verwijzingen naar /public assets)
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repo}` : "",
  },
};

export default nextConfig;
