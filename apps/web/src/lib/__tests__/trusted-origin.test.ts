import { describe, it, expect, vi, afterEach } from "vitest";

// trusted-origin.ts captura NEXT_PUBLIC_APP_URL a nivel módulo, así que para
// probar distintos valores reseteamos módulos y re-importamos tras stubear.
async function load(appUrl: string) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_APP_URL", appUrl);
  return import("../trusted-origin");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("trustedOrigin (T2 — no confiar en el origin del cliente)", () => {
  it("con NEXT_PUBLIC_APP_URL, IGNORA el origin del cliente", async () => {
    const { trustedOrigin } = await load("https://app.tbm.com");
    expect(trustedOrigin("https://evil.com")).toBe("https://app.tbm.com");
    expect(trustedOrigin(undefined)).toBe("https://app.tbm.com");
  });

  it("sin env, rechaza un host arbitrario del cliente", async () => {
    const { trustedOrigin } = await load("");
    expect(trustedOrigin("https://evil.com")).toBeNull();
  });

  it("sin env, acepta localhost del cliente (comodidad de dev)", async () => {
    const { trustedOrigin } = await load("");
    expect(trustedOrigin("http://localhost:3000")).toBe("http://localhost:3000");
    expect(trustedOrigin("http://127.0.0.1:3000")).toBe("http://127.0.0.1:3000");
  });

  it("descarta protocolos no http(s) y basura", async () => {
    const { trustedOrigin } = await load("");
    expect(trustedOrigin("ftp://localhost")).toBeNull();
    expect(trustedOrigin("javascript:alert(1)")).toBeNull();
    expect(trustedOrigin("basura")).toBeNull();
    expect(trustedOrigin(123 as unknown)).toBeNull();
  });
});
