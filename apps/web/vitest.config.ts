import { defineConfig } from "vitest/config";

// Tests de lógica pura (sin red ni DOM). Arranque de la red de contención
// (auditoria.md T8). Ampliar a componentes con jsdom cuando haga falta.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
