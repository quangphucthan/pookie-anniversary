import type { NextConfig } from "next";

// next/image needs the Supabase hostname allow-listed; derive it from the env
// var that's already there rather than hardcoding the project ref twice.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
    : undefined;

const nextConfig: NextConfig = {
    images: supabaseHost
        ? {
              remotePatterns: [
                  { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/**" },
              ],
          }
        : {},
};

export default nextConfig;
