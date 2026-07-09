import { describe, it, expect } from "vitest";
import {
  creditTypeLabel,
  buildCreditRequestMailto,
  formatCreditDate,
  SUPPORT_EMAIL,
} from "../credits";

describe("creditTypeLabel", () => {
  it("traduce los tipos conocidos del ledger", () => {
    expect(creditTypeLabel("grant")).toBe("Carga / regalo");
    expect(creditTypeLabel("consume")).toBe("Test DISC");
    expect(creditTypeLabel("purchase")).toBe("Compra");
  });

  it("cae al valor crudo si el tipo es desconocido", () => {
    expect(creditTypeLabel("no_existe")).toBe("no_existe");
  });
});

describe("buildCreditRequestMailto", () => {
  it("arma un mailto a la casilla de soporte por defecto", () => {
    const href = buildCreditRequestMailto();
    expect(href.startsWith(`mailto:${SUPPORT_EMAIL}?`)).toBe(true);
    expect(href).toContain("subject=");
    expect(href).toContain("body=");
  });

  it("incluye el nombre de la empresa (codificado) en el cuerpo", () => {
    const href = buildCreditRequestMailto("ACME S.A.");
    expect(href).toContain(encodeURIComponent('ACME S.A.'));
  });

  it("respeta un email de soporte explícito", () => {
    const href = buildCreditRequestMailto(null, "soporte@x.com");
    expect(href.startsWith("mailto:soporte@x.com?")).toBe(true);
  });
});

describe("formatCreditDate", () => {
  it("devuelve string vacío ante una fecha inválida", () => {
    expect(formatCreditDate("no-es-fecha")).toBe("");
    expect(formatCreditDate("")).toBe("");
  });

  it("devuelve algo no vacío ante una fecha ISO válida", () => {
    expect(formatCreditDate("2026-06-12T14:30:00Z").length).toBeGreaterThan(0);
  });
});
