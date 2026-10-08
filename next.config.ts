import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // CV en PDF jusqu'à 3 Mo (+ marge pour l'enveloppe du formulaire). Vercel plafonne à 4,5 Mo.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
