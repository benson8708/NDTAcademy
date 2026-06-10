"use client";
// Embedded Persona flow. The widget collects the government ID + selfie and
// creates the inquiry with our user id as reference-id; on completion we POST
// the inquiry id to the server, which re-verifies against Persona's API
// before recording anything.
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    Persona?: {
      Client: new (options: Record<string, unknown>) => { open: () => void };
    };
  }
}

export default function PersonaVerify({
  referenceId,
  templateId,
  environment,
  lastStatus,
}: {
  referenceId: string;
  templateId: string;
  environment: string;
  lastStatus: string | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const clientRef = useRef<{ open: () => void } | null>(null);

  useEffect(() => {
    if (window.Persona) setSdkReady(true);
  }, []);

  async function recordCompletion(inquiryId?: string) {
    const resp = await fetch("/api/identity/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiryId ? { inquiryId } : {}),
    });
    const result = await resp.json();
    if (result.verified) {
      setMessage("Identity verified — taking you back to your training.");
      router.push(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } else {
      setMessage(
        result.status
          ? `Verification status: ${result.status}. If you just finished, give it a few seconds and press "Check my status".`
          : "No verification found yet — start the verification below.",
      );
    }
    return result.verified;
  }

  function begin() {
    if (!window.Persona) {
      setMessage("The verification widget hasn't loaded yet — give it a second and try again.");
      return;
    }
    setBusy(true);
    const client = new window.Persona.Client({
      templateId,
      environment,
      referenceId,
      onReady: () => client.open(),
      onComplete: async ({ inquiryId }: { inquiryId: string }) => {
        await recordCompletion(inquiryId);
        setBusy(false);
      },
      onCancel: () => {
        setBusy(false);
        setMessage("Verification cancelled — you can restart it any time.");
      },
      onError: (error: unknown) => {
        setBusy(false);
        setMessage(`Verification error: ${JSON.stringify(error)}`);
      },
    });
    clientRef.current = client;
  }

  return (
    <div className="card feature">
      <Script
        src="https://cdn.withpersona.com/dist/persona-v5.1.2.js"
        strategy="lazyOnload"
        onLoad={() => setSdkReady(true)}
      />
      <span className="code">Required before courses &amp; exams</span>
      <h3>Government ID + selfie check</h3>
      <p>
        Powered by Persona{environment === "sandbox" ? " (sandbox mode — simulated documents accepted)" : ""}.
        Have your driver&apos;s license, passport, or state ID ready.
      </p>
      {lastStatus && !message && (
        <div className="ib-feedback" style={{ marginTop: 12 }}>
          Previous attempt status: {lastStatus}
        </div>
      )}
      {message && <div className="ib-feedback" style={{ marginTop: 12 }}>{message}</div>}
      <p style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={begin} disabled={busy || !sdkReady}>
          {busy ? "Verification in progress…" : sdkReady ? "Begin Verification" : "Loading widget…"}
        </button>
        <button
          className="btn btn-ghost"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setMessage("Checking with Persona…");
            await recordCompletion();
            setBusy(false);
          }}
        >
          Check My Status
        </button>
      </p>
    </div>
  );
}
