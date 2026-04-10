/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GAMECOIN_ADDRESS: process.env.NEXT_PUBLIC_GAMECOIN_ADDRESS,
    NEXT_PUBLIC_LAPLOGIC_CORE_ADDRESS: process.env.NEXT_PUBLIC_LAPLOGIC_CORE_ADDRESS,
    NEXT_PUBLIC_RANK_REGISTRY_ADDRESS: process.env.NEXT_PUBLIC_RANK_REGISTRY_ADDRESS,
  },
};

module.exports = nextConfig;