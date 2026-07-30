import { describe, it, expect } from "vitest";
import {
  checkSplit,
  splitMessage,
  derivePace,
  computeProgress,
  fmt,
} from "../kpi-cascade";

// El caso textual de Dilio, traducido al trimestre: 5 clientes/mes × 3 = 15.
const DILIO = {
  target: 15,
  sebastian: 9, // 3/mes
  dilio: 6, // 2/mes
};

describe("checkSplit — el 'obligar' de Dilio, en aritmética", () => {
  it("el ejemplo de Dilio cierra exacto", () => {
    const c = checkSplit(DILIO.target, [
      { ownerId: "s", targetValue: DILIO.sebastian },
      { ownerId: "d", targetValue: DILIO.dilio },
    ]);
    expect(c.status).toBe("exact");
    expect(c.assigned).toBe(15);
    expect(c.gap).toBe(0);
    expect(splitMessage(c)).toBe(""); // si cierra, no hay nada que decir
  });

  it("detecta cuando falta repartir", () => {
    const c = checkSplit(15, [{ ownerId: "s", targetValue: 9 }]);
    expect(c.status).toBe("under");
    expect(c.gap).toBe(6);
    expect(splitMessage(c, "clientes")).toContain("Falta repartir 6 clientes");
  });

  it("detecta sobreasignación", () => {
    const c = checkSplit(15, [
      { ownerId: "s", targetValue: 10 },
      { ownerId: "d", targetValue: 8 },
    ]);
    expect(c.status).toBe("over");
    expect(c.gap).toBe(-3);
    expect(splitMessage(c)).toContain("supera la meta en 3");
  });

  it("sin meta, pide definirla antes de repartir", () => {
    for (const t of [null, undefined, 0, -5, NaN]) {
      const c = checkSplit(t, [{ ownerId: "s", targetValue: 3 }]);
      expect(c.status).toBe("no_target");
      expect(splitMessage(c)).toContain("Definí la meta");
    }
  });

  it("sin responsables, todo está sin repartir", () => {
    const c = checkSplit(15, []);
    expect(c.status).toBe("under");
    expect(c.gap).toBe(15);
  });

  it("tolera decimales de redondeo (numeric de Postgres)", () => {
    const c = checkSplit(10, [
      { ownerId: "a", targetValue: 3.33 },
      { ownerId: "b", targetValue: 3.33 },
      { ownerId: "c", targetValue: 3.34 },
    ]);
    expect(c.status).toBe("exact");
  });

  it("ignora valores basura en vez de romper", () => {
    const c = checkSplit(15, [
      { ownerId: "a", targetValue: 9 },
      { ownerId: "b", targetValue: NaN },
    ]);
    expect(c.assigned).toBe(9);
  });
});

describe("derivePace — la cadencia con la que habla Dilio", () => {
  it("15 en el trimestre son los '5 mensuales' que él enuncia", () => {
    expect(derivePace(15).perMonth).toBe(5);
  });

  it("el aporte de Sebastián (9) son sus 3 por mes", () => {
    expect(derivePace(DILIO.sebastian).perMonth).toBe(3);
  });

  it("expresa también el ritmo semanal", () => {
    // 15 / 13 semanas ≈ 1.15
    expect(derivePace(15).perWeek).toBeCloseTo(1.15, 1);
  });

  it("no se rompe con 0", () => {
    expect(derivePace(0).perMonth).toBe(0);
  });
});

describe("computeProgress — '¿voy bien para llegar?', nunca 'cumpliste el mes'", () => {
  // Q3 2026 = jul-sep (92 días). 01/08 → transcurrió ~34%.
  const MID_Q3 = "2026-08-01";

  it("con 0 avance a mitad de trimestre, marca atraso", () => {
    const p = computeProgress(15, 0, MID_Q3);
    expect(p.percent).toBe(0);
    expect(p.remaining).toBe(15);
    expect(["behind", "at_risk"]).toContain(p.status);
  });

  it("con el avance a la par del tiempo, está en ritmo", () => {
    // A 01/08 transcurrió ~34% del trimestre → ~5 de 15.
    const p = computeProgress(15, 5, MID_Q3);
    expect(p.status).toBe("on_track");
  });

  it("con avance muy por delante, marca adelantado", () => {
    expect(computeProgress(15, 13, MID_Q3).status).toBe("ahead");
  });

  it("al alcanzar la meta, queda logrado", () => {
    const p = computeProgress(15, 15, MID_Q3);
    expect(p.status).toBe("done");
    expect(p.percent).toBe(100);
    expect(p.remaining).toBe(0);
    expect(p.requiredPerWeek).toBe(0);
  });

  it("pasarse de la meta no rompe el porcentaje", () => {
    const p = computeProgress(15, 20, MID_Q3);
    expect(p.percent).toBe(100);
    expect(p.status).toBe("done");
  });

  // El corazón de la aclaración de Sebas: dos meses flojos y el último fuerte
  // tiene que poder cerrar. Nada acá dice "no cumpliste el mes 1".
  it("NO penaliza un arranque flojo si el acumulado puede recuperarse", () => {
    // Arrancó con 2 de 15 al inicio de agosto: atrasado, pero no "fallido".
    const agosto = computeProgress(15, 2, "2026-08-01");
    expect(agosto.status).not.toBe("done");
    expect(agosto.remaining).toBe(13);
    // Sabe exactamente qué ritmo necesita de acá en adelante — que es el pedido:
    // "debe saber qué está haciendo o no está haciendo para lograr el objetivo".
    expect(agosto.requiredPerWeek).toBeGreaterThan(0);
    expect(Number.isFinite(agosto.requiredPerWeek)).toBe(true);

    // Con 6 (2+4) a inicios de septiembre sigue habiendo camino.
    const septiembre = computeProgress(15, 6, "2026-09-01");
    expect(septiembre.remaining).toBe(9);
    expect(septiembre.daysLeft).toBeGreaterThan(0);

    // Y si el último mes logra los 9 que faltaban, cierra: 2+4+9 = 15.
    expect(computeProgress(15, 15, "2026-09-29").status).toBe("done");
  });

  it("el ritmo necesario sube a medida que queda menos tiempo", () => {
    const temprano = computeProgress(15, 3, "2026-07-15");
    const tarde = computeProgress(15, 3, "2026-09-15");
    expect(tarde.requiredPerWeek).toBeGreaterThan(temprano.requiredPerWeek);
  });

  it("el último día del trimestre sin llegar queda en riesgo, no 'logrado'", () => {
    const p = computeProgress(15, 10, "2026-09-30");
    expect(p.daysLeft).toBe(0);
    expect(p.status).toBe("at_risk");
    expect(p.requiredPerWeek).toBe(Infinity);
  });

  it("sin meta definida no inventa veredicto", () => {
    const p = computeProgress(0, 0, MID_Q3);
    expect(p.status).toBe("on_track");
    expect(p.percent).toBe(0);
  });

  it("un valor actual negativo se trata como 0", () => {
    expect(computeProgress(15, -5, MID_Q3).percent).toBe(0);
  });
});

describe("fmt", () => {
  it("no muestra decimales de más", () => {
    expect(fmt(15)).toBe("15");
    expect(fmt(1.5)).toBe("1.5");
    expect(fmt(1.15)).toBe("1.15");
  });

  it("maneja Infinity sin escupir 'Infinity' a la UI", () => {
    expect(fmt(Infinity)).toBe("—");
  });
});
