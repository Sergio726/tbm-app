import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Root del monorepo (apps/admin → tbm-app/). Turbopack lo necesita explícito.
const MONOREPO_ROOT = path.join(__dirname, "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: MONOREPO_ROOT },
  // El paquete @tbm/shared se distribuye como TS fuente → Next lo transpila.
  transpilePackages: ["@tbm/shared"],
};

export default nextConfig;
