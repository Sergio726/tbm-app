import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * ESLint 9 (flat config). Next 16 eliminó el comando `next lint`.
 *
 * eslint-config-next 16 ya exporta flat config NATIVO, así que lo consumimos
 * directo. (Usar FlatCompat con este paquete producía "Converting circular
 * structure to JSON" al validar el schema.)
 *
 * Scope = core-web-vitals (mismo que el `.eslintrc.json` previo). NO sumamos
 * `eslint-config-next/typescript` todavía para no inundar de errores las ~34k
 * líneas que nunca pasaron lint. Endurecer regla por regla después.
 */
export default [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**"],
  },
];
