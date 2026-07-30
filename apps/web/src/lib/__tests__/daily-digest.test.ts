import { describe, it, expect } from "vitest";
import { buildDailyDigest, dcGreeting, type DigestInput } from "../daily-digest";

function base(over: Partial<DigestInput> = {}): DigestInput {
  return {
    dcName: "DC",
    firstName: "Sebas",
    companyName: "STLabs",
    weekday: 3, // miércoles: sin lunes de rocas ni domingo de reporte
    preGameDone: false,
    habits: [],
    overdueTaskCount: 0,
    warUpPending: null,
    rocks: [],
    weeklyReportReady: false,
    ...over,
  };
}

describe("dcGreeting — la voz que pidió Dilio", () => {
  it("saluda con el nombre de la persona y se presenta como executive coach", () => {
    const g = dcGreeting("DC", "Sebas");
    expect(g).toContain("Buenos días, Sebas");
    expect(g).toContain("executive coach");
    expect(g).toContain("<strong>DC</strong>");
  });

  it("respeta el nombre configurado desde el admin", () => {
    expect(dcGreeting("Jarvis", "Ana")).toContain("<strong>Jarvis</strong>");
  });

  it("no rompe si no hay nombre cargado", () => {
    expect(dcGreeting("DC", "")).toContain("Buenos días");
    expect(dcGreeting("DC", "   ")).not.toContain("undefined");
  });

  it("escapa HTML en el nombre (viene de la base)", () => {
    expect(dcGreeting("DC", '<img src=x onerror="alert(1)">')).not.toContain("<img");
  });
});

describe("regla 1 · el despertador SIEMPRE tiene contenido", () => {
  // El digest viejo hacía `if (lines.length === 0) continue`: en un día tranquilo
  // no llegaba nada. Es la regresión principal que cubre este archivo.
  it("con todo al día devuelve líneas igual, en tono de refuerzo", () => {
    const d = buildDailyDigest(
      base({ preGameDone: true, warUpPending: false, overdueTaskCount: 0 })
    );
    expect(d.lines.length).toBeGreaterThan(0);
    expect(d.lines.join(" ")).toContain("Todo al día");
  });

  it("nunca devuelve una lista vacía, en ningún escenario", () => {
    const escenarios: Partial<DigestInput>[] = [
      {},
      { preGameDone: true },
      { preGameDone: true, habits: [{ label: "Gym", emoji: "🏋️", done: true }] },
      { weekday: 0 },
      { weekday: 1 },
      { overdueTaskCount: 9 },
    ];
    for (const e of escenarios) {
      expect(buildDailyDigest(base(e)).lines.length).toBeGreaterThan(0);
    }
  });

  it("el Pre-game va primero, hecho o no", () => {
    expect(buildDailyDigest(base({ preGameDone: false })).lines[0]).toContain("Pre-game");
    expect(buildDailyDigest(base({ preGameDone: true })).lines[0]).toContain("Pre-game");
  });
});

describe("regla 2 · los hábitos son los que la persona eligió", () => {
  it("lista solo los pendientes, con su emoji", () => {
    const d = buildDailyDigest(
      base({
        habits: [
          { label: "Gym", emoji: "🏋️", done: true },
          { label: "Meditar", emoji: "🧘", done: false },
          { label: "Tomar agua", emoji: "💧", done: false },
        ],
      })
    );
    const txt = d.lines.join(" ");
    expect(txt).toContain("Meditar");
    expect(txt).toContain("Tomar agua");
    expect(txt).toContain("1 de 3");
    // El cumplido no se repite en la lista de pendientes.
    expect(txt).not.toMatch(/quedan.*Gym/);
  });

  it("celebra cuando cerró todos", () => {
    const d = buildDailyDigest(
      base({
        habits: [
          { label: "Gym", emoji: "🏋️", done: true },
          { label: "Meditar", emoji: "🧘", done: true },
        ],
      })
    );
    expect(d.lines.join(" ")).toContain("Cerraste tus 2 hábitos");
  });

  it("omite la sección si la persona no cargó hábitos", () => {
    const d = buildDailyDigest(base({ habits: [] }));
    expect(d.lines.join(" ")).not.toContain("hábito");
  });

  it("tolera hábitos sin emoji (los propios pueden no tenerlo)", () => {
    const d = buildDailyDigest(
      base({ habits: [{ label: "Leer 10 páginas", emoji: null, done: false }] })
    );
    expect(d.lines.join(" ")).toContain("Leer 10 páginas");
    expect(d.lines.join(" ")).not.toContain("null");
  });

  it("escapa HTML en el label (el hábito propio es texto libre del usuario)", () => {
    const d = buildDailyDigest(
      base({ habits: [{ label: "<script>alert(1)</script>", emoji: null, done: false }] })
    );
    expect(d.lines.join(" ")).not.toContain("<script>");
  });
});

describe("contenido por rol y por día", () => {
  it("el War Up solo aparece si se pasó el flag (es del Arquitecto)", () => {
    expect(buildDailyDigest(base({ warUpPending: true })).lines.join(" ")).toContain("War Up");
    // null = colaborador: no le corresponde.
    expect(buildDailyDigest(base({ warUpPending: null })).lines.join(" ")).not.toContain("War Up");
    expect(buildDailyDigest(base({ warUpPending: false })).lines.join(" ")).not.toContain("War Up");
  });

  it("las Rocas solo el lunes", () => {
    const rocks = [{ title: "Sistema de ventas", progress: 40 }];
    expect(buildDailyDigest(base({ weekday: 1, rocks })).lines.join(" ")).toContain("Rocas");
    expect(buildDailyDigest(base({ weekday: 2, rocks })).lines.join(" ")).not.toContain("Rocas");
  });

  it("el reporte semanal solo el domingo y si está listo", () => {
    expect(
      buildDailyDigest(base({ weekday: 0, weeklyReportReady: true })).lines.join(" ")
    ).toContain("Reporte Semanal");
    expect(
      buildDailyDigest(base({ weekday: 0, weeklyReportReady: false })).lines.join(" ")
    ).not.toContain("Reporte Semanal");
  });

  it("singulariza bien una sola tarea vencida", () => {
    expect(buildDailyDigest(base({ overdueTaskCount: 1 })).lines.join(" ")).toContain("1 tarea ");
    expect(buildDailyDigest(base({ overdueTaskCount: 3 })).lines.join(" ")).toContain("3 tareas");
  });
});

describe("asunto — es lo único que se ve sin abrir", () => {
  it("prioriza el Pre-game pendiente", () => {
    expect(buildDailyDigest(base({ preGameDone: false })).subject).toContain("Pre-game");
  });

  it("si el Pre-game está hecho, avisa las tareas vencidas", () => {
    expect(
      buildDailyDigest(base({ preGameDone: true, overdueTaskCount: 2 })).subject
    ).toContain("2 tareas");
  });

  it("si no hay urgencias, menciona los hábitos pendientes", () => {
    const s = buildDailyDigest(
      base({ preGameDone: true, habits: [{ label: "Gym", emoji: null, done: false }] })
    ).subject;
    expect(s).toContain("hábitos");
  });

  it("con todo al día, nombra la empresa", () => {
    const s = buildDailyDigest(base({ preGameDone: true, companyName: "STLabs" })).subject;
    expect(s).toContain("STLabs");
  });
});
