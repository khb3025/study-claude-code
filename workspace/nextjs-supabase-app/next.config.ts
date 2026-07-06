import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // 개발 모드 좌하단 Next.js 인디케이터(Bundler/Route Info 등) 비활성화
  devIndicators: false,
};

export default nextConfig;
