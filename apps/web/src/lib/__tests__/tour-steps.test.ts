import { describe, it, expect } from "vitest";
import { tourStepsForRole } from "../tour-steps";

/**
 * Coherencia rol → selectores del tour (S21b).
 *
 * El bug que estos tests evitan que vuelva: en S21 el coach dedicado pasó a tener
 * su propio sidebar (`COACH_MODULES`), pero `tourStepsForRole` seguía mandándolo a
 * los pasos del colaborador → casi todos sus popovers apuntaban a módulos que él
 * no tiene, quedando flotando sin ancla.
 *
 * Los `data-tour="nav-*"` NO están hardcodeados en el DOM: el sidebar los genera
 * desde `visibleModules` (`data-tour={`nav-${href.slice(1)}`}`). Así que un paso
 * solo es válido si su módulo está en la lista **de ese rol**.
 */

/** Espejo de `MODULES` en `components/layout/sidebar.tsx` (empresa completa). */
const NAV_EMPRESA = [
  "nav-dashboard",
  "nav-rituales",
  "nav-equipo",
  "nav-delegacion",
  "nav-feedback",
  "nav-plan-90d",
  "nav-workbooks",
  "nav-sistema",
  "nav-multiplicador",
  "nav-diagnosticos",
];

/** Espejo de `COACH_MODULES` — lo único que ve un coach dedicado. */
const NAV_COACH = ["nav-super-coach", "nav-notificaciones", "nav-cuenta"];

/** Anclas que existen para cualquier rol logueado (layout, no sidebar de módulos). */
const SIEMPRE = ["sidebar-nav", "user-avatar", "dc-launcher", "mobile-menu"];

/** `semaforos` vive en /dashboard: solo lo ve quien tiene empresa. */
const SOLO_CON_EMPRESA = ["semaforos"];

/** Extrae los `data-tour` que pide una lista de pasos. */
function selectorsOf(steps: ReturnType<typeof tourStepsForRole>): string[] {
  return steps
    .map((s) => (typeof s.element === "string" ? s.element : null))
    .filter((e): e is string => !!e)
    .map((e) => e.replace(/^\[data-tour="/, "").replace(/"\]$/, ""));
}

describe("tour · coach dedicado (el bug de S21b)", () => {
  const permitidos = new Set([...NAV_COACH, ...SIEMPRE]);

  it("no pide NINGÚN módulo de empresa", () => {
    for (const isMobile of [false, true]) {
      for (const sel of selectorsOf(tourStepsForRole("coach", isMobile))) {
        expect(
          permitidos.has(sel),
          `el coach no tiene "${sel}" en su sidebar (mobile=${isMobile})`
        ).toBe(true);
      }
    }
  });

  it("no pide `semaforos` — su home es /super-coach, no el dashboard", () => {
    for (const isMobile of [false, true]) {
      expect(selectorsOf(tourStepsForRole("coach", isMobile))).not.toContain("semaforos");
    }
  });

  it("le muestra su módulo real: Mis empresas", () => {
    expect(selectorsOf(tourStepsForRole("coach"))).toContain("nav-super-coach");
  });

  it("NO cae en los pasos del colaborador (la regresión exacta)", () => {
    const coach = JSON.stringify(tourStepsForRole("coach"));
    const colaborador = JSON.stringify(tourStepsForRole("colaborador"));
    expect(coach).not.toBe(colaborador);
  });

  it("tiene pasos suficientes para que el tour valga la pena", () => {
    expect(tourStepsForRole("coach").length).toBeGreaterThanOrEqual(4);
  });
});

describe("tour · arquitecto y colaborador siguen sanos", () => {
  const permitidos = new Set([...NAV_EMPRESA, ...SIEMPRE, ...SOLO_CON_EMPRESA]);

  for (const role of ["arquitecto", "colaborador"]) {
    it(`${role}: todos sus selectores existen para su rol`, () => {
      for (const isMobile of [false, true]) {
        for (const sel of selectorsOf(tourStepsForRole(role, isMobile))) {
          expect(
            permitidos.has(sel) || sel === "nav-creditos",
            `"${sel}" no existe para ${role} (mobile=${isMobile})`
          ).toBe(true);
        }
      }
    });
  }

  it("solo el arquitecto ve Créditos", () => {
    expect(selectorsOf(tourStepsForRole("arquitecto"))).toContain("nav-creditos");
    expect(selectorsOf(tourStepsForRole("colaborador"))).not.toContain("nav-creditos");
  });

  it("un rol desconocido cae en el flujo de colaborador (fallback seguro)", () => {
    expect(JSON.stringify(tourStepsForRole("observador"))).toBe(
      JSON.stringify(tourStepsForRole("colaborador"))
    );
    expect(JSON.stringify(tourStepsForRole(null))).toBe(
      JSON.stringify(tourStepsForRole("colaborador"))
    );
  });
});

describe("tour · contenido nuevo de S22/S23/S25", () => {
  const texto = (role: string) => JSON.stringify(tourStepsForRole(role));

  it("al colaborador le explica su insignia de nivel y su ficha de rol (S22)", () => {
    const t = texto("colaborador");
    expect(t).toContain("insignia");
    expect(t).toContain("ficha de rol");
  });

  it("menciona los Avisos en Mi cuenta, para los tres roles (S23)", () => {
    for (const role of ["arquitecto", "colaborador", "coach"]) {
      expect(texto(role), `falta en ${role}`).toContain("Avisos");
    }
  });

  it("al arquitecto le explica la cascada del Plan 90D (S25)", () => {
    expect(texto("arquitecto")).toContain("cascada");
  });

  it("NO menciona DC proactivo — está detrás de un flag en OFF", () => {
    // Anunciar algo que el usuario no puede ver es peor que no decirlo.
    for (const role of ["arquitecto", "colaborador", "coach"]) {
      expect(texto(role).toLowerCase()).not.toContain("proactiv");
    }
  });
});

describe("tour · invariantes de todos los flujos", () => {
  for (const role of ["arquitecto", "colaborador", "coach", null]) {
    for (const isMobile of [false, true]) {
      it(`${role ?? "sin rol"}${isMobile ? " (mobile)" : ""}: cierra con un paso sin ancla`, () => {
        const steps = tourStepsForRole(role, isMobile);
        expect(steps.length).toBeGreaterThan(0);
        // El último paso es el mensaje de cierre: va centrado, sin `element`.
        expect(steps[steps.length - 1].element).toBeUndefined();
      });

      it(`${role ?? "sin rol"}${isMobile ? " (mobile)" : ""}: todos los pasos tienen título`, () => {
        for (const s of tourStepsForRole(role, isMobile)) {
          expect(s.popover?.title, JSON.stringify(s)).toBeTruthy();
        }
      });
    }
  }
});
