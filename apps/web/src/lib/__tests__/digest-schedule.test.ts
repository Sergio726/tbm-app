import { describe, it, expect } from "vitest";
import {
  localHour,
  parseHourColumn,
  resolveTargetHour,
  isDigestDue,
  isHourlyCron,
} from "../digest-schedule";

describe("localHour", () => {
  // 2026-08-01T14:00Z → Bogotá (UTC-5) 09:00 · Buenos Aires (UTC-3) 11:00 · Tokio (UTC+9) 23:00
  const d = new Date("2026-08-01T14:00:00Z");

  it("traduce la hora a cada zona", () => {
    expect(localHour(d, "America/Bogota")).toBe(9);
    expect(localHour(d, "America/Argentina/Buenos_Aires")).toBe(11);
    expect(localHour(d, "Asia/Tokyo")).toBe(23);
    expect(localHour(d, "UTC")).toBe(14);
  });

  it("cruza la medianoche correctamente", () => {
    // 03:00Z → 22:00 del día anterior en Bogotá.
    expect(localHour(new Date("2026-08-02T03:00:00Z"), "America/Bogota")).toBe(22);
    // 05:00Z → 00:00 en Bogotá (no 24).
    expect(localHour(new Date("2026-08-02T05:00:00Z"), "America/Bogota")).toBe(0);
  });

  it("devuelve 0-23 siempre, nunca 24", () => {
    for (let h = 0; h < 24; h++) {
      const dt = new Date(Date.UTC(2026, 7, 1, h));
      for (const tz of ["America/Bogota", "Asia/Tokyo", "UTC", "Pacific/Auckland"]) {
        const v = localHour(dt, tz);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(23);
      }
    }
  });

  it("no rompe el cron con una zona inválida", () => {
    expect(() => localHour(d, "No/Existe")).not.toThrow();
    expect(localHour(d, "No/Existe")).toBe(14); // cae a UTC
  });
});

describe("parseHourColumn — el `time` de ritual_configs.pre_game_reminder", () => {
  it("parsea los formatos que devuelve Postgres", () => {
    expect(parseHourColumn("07:00")).toBe(7);
    expect(parseHourColumn("07:00:00")).toBe(7);
    expect(parseHourColumn("5:30")).toBe(5);
    expect(parseHourColumn("23:59:59")).toBe(23);
    expect(parseHourColumn("00:00")).toBe(0);
  });

  it("devuelve null ante basura, en vez de un número raro", () => {
    for (const v of [null, undefined, "", "  ", "abc", "99:00", "-1:00"]) {
      expect(parseHourColumn(v), `con ${JSON.stringify(v)}`).toBeNull();
    }
  });
});

describe("resolveTargetHour — la cascada de preferencias", () => {
  it("lo que la persona ELIGIÓ gana sobre la empresa", () => {
    expect(resolveTargetHour(5, "07:00")).toBe(5);
  });

  it("sin elección propia, usa la hora de la empresa", () => {
    // Es la columna que existía desde el sprint 2 y el cron ignoraba.
    expect(resolveTargetHour(null, "07:00")).toBe(7);
    expect(resolveTargetHour(undefined, "07:00")).toBe(7);
  });

  it("sin ninguna de las dos, no hay hora objetivo", () => {
    expect(resolveTargetHour(null, null)).toBeNull();
  });

  it("la medianoche (0) es una elección válida, no un 'sin valor'", () => {
    expect(resolveTargetHour(0, "07:00")).toBe(0);
  });

  it("ignora horas fuera de rango y cae a la empresa", () => {
    expect(resolveTargetHour(99, "07:00")).toBe(7);
    expect(resolveTargetHour(-3, "07:00")).toBe(7);
  });
});

describe("isDigestDue — compatible con las dos frecuencias de cron", () => {
  // ── El caso que evita la regresión en producción ──
  describe("con cron DIARIO (el actual)", () => {
    it("manda siempre, sin importar la hora — nadie se queda sin correo", () => {
      for (let h = 0; h < 24; h++) {
        expect(
          isDigestDue({ currentHour: h, targetHour: 5, hourlyCron: false }),
          `hora ${h}`
        ).toBe(true);
      }
    });

    it("también manda si la persona no eligió hora", () => {
      expect(isDigestDue({ currentHour: 11, targetHour: null, hourlyCron: false })).toBe(true);
    });
  });

  describe("con cron HORARIO", () => {
    it("no manda antes de su hora", () => {
      expect(isDigestDue({ currentHour: 4, targetHour: 5, hourlyCron: true })).toBe(false);
      expect(isDigestDue({ currentHour: 0, targetHour: 5, hourlyCron: true })).toBe(false);
    });

    it("manda en su hora exacta", () => {
      expect(isDigestDue({ currentHour: 5, targetHour: 5, hourlyCron: true })).toBe(true);
    });

    it("manda después de su hora — recupera un envío que se perdió", () => {
      // Si la corrida de las 5 falló, la de las 6 lo levanta en vez de saltear el día.
      expect(isDigestDue({ currentHour: 6, targetHour: 5, hourlyCron: true })).toBe(true);
      expect(isDigestDue({ currentHour: 23, targetHour: 5, hourlyCron: true })).toBe(true);
    });

    it("sin hora objetivo, manda en cualquier corrida", () => {
      expect(isDigestDue({ currentHour: 3, targetHour: null, hourlyCron: true })).toBe(true);
    });

    it("bordes: medianoche como hora elegida", () => {
      expect(isDigestDue({ currentHour: 0, targetHour: 0, hourlyCron: true })).toBe(true);
      expect(isDigestDue({ currentHour: 23, targetHour: 0, hourlyCron: true })).toBe(true);
    });

    it("bordes: las 23 como hora elegida", () => {
      expect(isDigestDue({ currentHour: 22, targetHour: 23, hourlyCron: true })).toBe(false);
      expect(isDigestDue({ currentHour: 23, targetHour: 23, hourlyCron: true })).toBe(true);
    });
  });
});

describe("isHourlyCron — se declara, no se adivina", () => {
  it("default false = comportamiento actual (mergear no cambia nada)", () => {
    expect(isHourlyCron(undefined)).toBe(false);
    expect(isHourlyCron("")).toBe(false);
    expect(isHourlyCron("false")).toBe(false);
    expect(isHourlyCron("0")).toBe(false);
  });

  it("acepta las formas habituales de decir que sí", () => {
    for (const v of ["1", "true", "TRUE", "yes", "Yes"]) {
      expect(isHourlyCron(v), v).toBe(true);
    }
  });
});
