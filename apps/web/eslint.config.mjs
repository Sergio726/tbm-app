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
    // Reglas nuevas y estrictas de react-hooks 7 (React Compiler). Marcan ~26
    // patrones del código heredado (setState dentro de useEffect, Date.now() en
    // render, etc.) que funcionan pero no son idempotentes. Se degradan a `warn`
    // para adoptarlas GRADUALMENTE, sin refactorizar 26 componentes a ciegas; el
    // resto del lint queda como gate duro. Subir a `error` por módulo al limpiar.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**"],
  },
];
