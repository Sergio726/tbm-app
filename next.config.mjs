import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fijar el root del workspace a este proyecto: hay un package-lock.json en la
  // carpeta padre que hace que Turbopack infiera mal la raíz (warning en build).
  turbopack: { root: __dirname },
};

export default nextConfig;
