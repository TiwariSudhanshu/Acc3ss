import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[
       {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lavender-tremendous-deer-798.mypinata.cloud",
      }
    ]
  }
};

export default nextConfig;
