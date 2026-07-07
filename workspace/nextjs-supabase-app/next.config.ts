import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // 개발 모드 좌하단 Next.js 인디케이터(Bundler/Route Info 등) 비활성화
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wvcqavnmbtcllahbedvk.supabase.co",
        pathname: "/storage/v1/object/public/event-images/**",
      },
    ],
  },
};

export default nextConfig;
