"use client";
// Shown when a passing final is already on record: re-runs the certificate
// gate (lessons + auditable hours + final) without forcing an exam retake.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { finalizeLevel } from "../actions";

export default function ClaimCertificate({
  courseSlug,
  levelKey,
}: { courseSlug: string; levelKey: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [issued, setIssued] = useState(false);

  async function claim() {
    setBusy(true);
    try {
      const result = await finalizeLevel(courseSlug, levelKey);
      if (result.certificateIssued) {
        setIssued(true);
        setMessage(`Certificate issued — verification code ${result.verificationCode}. It's on your dashboard.`);
        router.refresh();
      } else {
        setMessage(result.reason ?? "Requirements not met yet.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card feature" style={{ marginBottom: 26 }}>
      <span className="code">Passing final on record</span>
      <h3>Claim your certificate</h3>
      <p>
        You&apos;ve already passed this final. Once every lesson is complete and the level&apos;s
        full training hours are logged, claim the certificate here — no retake needed.
      </p>
      {message && (
        <div className={issued ? "form-ok" : "ib-feedback"} style={{ marginTop: 12 }}>{message}</div>
      )}
      <p style={{ marginTop: 14 }}>
        <button className="btn btn-primary btn-sm" onClick={claim} disabled={busy || issued}>
          {busy ? "Checking…" : issued ? "Issued ✓" : "Claim Certificate"}
        </button>
      </p>
    </div>
  );
}
