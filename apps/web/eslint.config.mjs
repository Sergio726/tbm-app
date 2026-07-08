import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * ESLint 9 (flat config). Next 16 removió el comando `next lint`, así que
 * corremos ESLint directo con `eslint .`.
 *
 * Mantiene el mismo scope que el `.eslintrc.json` previo (next/core-web-vitals)
 * a propósito: NO sumamos `next/typescript` todavía para no inundar de errores
 * las ~34k líneas que nunca pasaron lint. Endurecer regla por regla después.
 */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
];

export default eslintConfig;
