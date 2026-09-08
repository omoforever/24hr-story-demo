import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stories is a mobile-first pattern (DESIGN.md), so the dev server gets opened from a phone on
  // the LAN. Without this, Next blocks HMR as a cross-origin request and the page loads but never
  // hot-reloads. Wildcarded across the subnet because the host IP is DHCP-assigned and moves.
  // Dev-only — Next ignores this in production builds.
  allowedDevOrigins: ["192.168.1.*", "10.0.0.*", "*.local"],
};

export default nextConfig;
