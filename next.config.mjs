import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // sharp is a native module (JPEG conversion for Instagram uploads) and
  // firebase-admin pulls in gRPC binaries — neither can be bundled.
  serverExternalPackages: ["@google/genai", "sharp", "firebase-admin"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
