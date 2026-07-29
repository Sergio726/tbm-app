import { describe, it, expect } from "vitest";
import {
  quarterIndex,
  quarterLabel,
  quarterStart,
  quarterEnd,
  addDaysIso,
  daysBetweenIso,
  clampToQuarterEnd,
  isClamped,
  quarterProgress,
} from "../quarters";

describe("quarters — límites del año calendario", () => {
  it("ubica cada mes en su trimestre", () => {
    expect(quarterIndex("2026-01-15")).toBe(0);
    expect(quarterIndex("2026-03-31")).toBe(0);
    expect(quarterIndex("2026-04-01")).toBe(1);
    expect(quarterIndex("2026-06-30")).toBe(1);
    expect(quarterIndex("2026-07-01")).toBe(2);
    expect(quarterIndex("2026-09-30")).toBe(2);
    expect(quarterIndex("2026-10-01")).toBe(3);
    expect(quarterIndex("2026-12-31")).toBe(3);
  });

  it("etiqueta los cuatro trimestres", () => {
    expect(quarterLabel("2026-02-10")).toBe("ene-mar");
    expect(quarterLabel("2026-05-10")).toBe("abr-jun");
    expect(quarterLabel("2026-08-10")).toBe("jul-sep");
    expect(quarterLabel("2026-11-10")).toBe("oct-dic");
  });

  it("calcula inicio y fin de trimestre", () => {
    expect(quarterStart("2026-08-20")).toBe("2026-07-01");
    expect(quarterEnd("2026-08-20")).toBe("2026-09-30");
    expect(quarterStart("2026-01-01")).toBe("2026-01-01");
    expect(quarterEnd("2026-03-01")).toBe("2026-03-31");
    expect(quarterEnd("2026-12-25")).toBe("2026-12-31");
  });

  // El borde exacto que separa Q3 de Q4: el bug clásico sería que 30/09 caiga en Q4.
  it("respeta el borde 30/09 vs 01/10", () => {
    expect(quarterEnd("2026-09-30")).toBe("2026-09-30");
    expect(quarterLabel("2026-09-30")).toBe("jul-sep");
    expect(quarterStart("2026-10-01")).toBe("2026-10-01");
    expect(quarterLabel("2026-10-01")).toBe("oct-dic");
  });
});

describe("quarters — aritmética de días en UTC", () => {
  it("suma días cruzando fin de mes y fin de año", () => {
    expect(addDaysIso("2026-08-20", 90)).toBe("2026-11-18");
    expect(addDaysIso("2026-12-30", 5)).toBe("2027-01-04");
    expect(addDaysIso("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("maneja el año bisiesto", () => {
    // 2028 es bisiesto → 29 de febrero existe.
    expect(addDaysIso("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDaysIso("2028-02-28", 2)).toBe("2028-03-01");
    expect(daysBetweenIso("2028-02-01", "2028-03-01")).toBe(29);
    // 2026 NO es bisiesto.
    expect(addDaysIso("2026-02-28", 1)).toBe("2026-03-01");
    expect(daysBetweenIso("2026-02-01", "2026-03-01")).toBe(28);
  });

  it("cuenta días entre fechas, con signo", () => {
    expect(daysBetweenIso("2026-07-01", "2026-09-30")).toBe(91);
    expect(daysBetweenIso("2026-09-30", "2026-07-01")).toBe(-91);
    expect(daysBetweenIso("2026-07-01", "2026-07-01")).toBe(0);
  });
});

describe("clampToQuarterEnd — la regla de Dilio", () => {
  // El caso textual del feedback: arrancar tarde no puede empujar el ciclo al
  // trimestre siguiente.
  it("recorta una roca que empieza tarde", () => {
    expect(clampToQuarterEnd("2026-08-20")).toBe("2026-09-30");
    expect(isClamped("2026-08-20")).toBe(true);
  });

  it("NO recorta cuando el ciclo entra completo en el trimestre", () => {
    // 01/07 + 90 = 29/09, entra justo antes del cierre.
    expect(clampToQuarterEnd("2026-07-01")).toBe("2026-09-29");
    expect(isClamped("2026-07-01")).toBe(false);
  });

  it("no recorta cuando el fin natural cae exactamente en el cierre", () => {
    // 02/07 + 90 = 30/09 → igual al límite, no se toca.
    expect(clampToQuarterEnd("2026-07-02")).toBe("2026-09-30");
    expect(isClamped("2026-07-02")).toBe(false);
  });

  it("colapsa a un solo día si arranca el último día del trimestre", () => {
    expect(clampToQuarterEnd("2026-09-30")).toBe("2026-09-30");
    expect(isClamped("2026-09-30")).toBe(true);
  });

  it("recorta al cierre de año sin saltar a enero", () => {
    expect(clampToQuarterEnd("2026-11-15")).toBe("2026-12-31");
    expect(clampToQuarterEnd("2026-12-31")).toBe("2026-12-31");
  });

  it("respeta un largo de ciclo distinto de 90", () => {
    expect(clampToQuarterEnd("2026-07-01", 10)).toBe("2026-07-11");
    expect(clampToQuarterEnd("2026-09-25", 10)).toBe("2026-09-30");
  });
});

describe("quarterProgress — contador anclado al trimestre", () => {
  it("cuenta desde el inicio del trimestre, 1-based", () => {
    expect(quarterProgress("2026-07-01")).toEqual({
      day: 1,
      total: 92,
      label: "jul-sep",
    });
    expect(quarterProgress("2026-09-30")).toEqual({
      day: 92,
      total: 92,
      label: "jul-sep",
    });
  });

  it("da el total correcto por trimestre", () => {
    expect(quarterProgress("2026-02-15").total).toBe(90); // ene-mar, no bisiesto
    expect(quarterProgress("2028-02-15").total).toBe(91); // ene-mar, bisiesto
    expect(quarterProgress("2026-05-15").total).toBe(91); // abr-jun
    expect(quarterProgress("2026-11-15").total).toBe(92); // oct-dic
  });

  it("nunca devuelve un día fuera de [1, total]", () => {
    const p = quarterProgress("2026-08-20");
    expect(p.day).toBeGreaterThanOrEqual(1);
    expect(p.day).toBeLessThanOrEqual(p.total);
    expect(p.day).toBe(51); // 01/07 → 20/08
  });
});

describe("quarters — robustez de parseo", () => {
  it("no se corre de día por zona horaria (regresión)", () => {
    // Con getters locales en UTC-3 esto daría 2026-07-31.
    expect(quarterLabel("2026-08-01")).toBe("jul-sep");
    expect(quarterStart("2026-08-01")).toBe("2026-07-01");
    expect(addDaysIso("2026-08-01", 0)).toBe("2026-08-01");
  });

  it("tolera un timestamp completo", () => {
    expect(quarterEnd("2026-08-20T13:45:00.000Z")).toBe("2026-09-30");
  });

  it("rechaza una fecha inválida", () => {
    expect(() => quarterEnd("no-es-fecha")).toThrow(RangeError);
  });
});
