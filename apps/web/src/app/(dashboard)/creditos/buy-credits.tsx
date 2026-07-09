"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { startCheckout } from "./actions";

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  amount_cents: number;
  currency: string;
};

function formatPrice(cents: number, currency: string): string {
  const cur = (currency || "usd").toUpperCase();
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: cur }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${cur}`;
  }
}

export function BuyCredits({ packages }: { packages: CreditPackage[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buy = async (id: string) => {
    setLoadingId(id);
    setError(null);
    const res = await startCheckout(id);
    if (res.ok) {
      window.location.href = res.url;
      return;
    }
    setError(res.error);
    setLoadingId(null);
  };

  const busy = loadingId !== null;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="flex flex-col gap-1 rounded-xl border p-4"
            style={{ borderColor: "var(--border-strong)", background: "var(--elevated)" }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)" }}>{pkg.name}</span>
            <span style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>
              {pkg.credits} {pkg.credits === 1 ? "crédito" : "créditos"} ·{" "}
              {formatPrice(pkg.amount_cents, pkg.currency)}
            </span>
            <button
              type="button"
              onClick={() => buy(pkg.id)}
              disabled={busy}
              className="mt-2 inline-flex items-center justify-center gap-2"
              style={{
                borderRadius: 10,
                background: "linear-gradient(135deg, #5b8aff, #2c5fe6)",
                boxShadow: "0 6px 18px rgba(91,138,255,0.30)",
                padding: "9px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                border: "none",
                cursor: busy ? "default" : "pointer",
                opacity: busy && loadingId !== pkg.id ? 0.6 : 1,
              }}
            >
              {loadingId === pkg.id ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CreditCard size={15} strokeWidth={1.9} />
              )}
              Comprar
            </button>
          </div>
        ))}
      </div>
      {error && (
        <div style={{ fontSize: 12, color: "var(--danger-text)", lineHeight: 1.45 }}>{error}</div>
      )}
      <p style={{ fontSize: 11.5, color: "var(--fg-subtle)", lineHeight: 1.5 }}>
        Pago seguro con Stripe. Los créditos se acreditan automáticamente al confirmarse el pago.
      </p>
    </div>
  );
}
