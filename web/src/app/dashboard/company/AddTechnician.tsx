"use client";
import { useActionState } from "react";
import { addTechnician } from "./actions";

export default function AddTechnician({ orgId }: { orgId: string }) {
  const [state, formAction, pending] = useActionState(addTechnician, null);
  return (
    <form action={formAction}>
      {state && (
        <div className={state.ok ? "form-ok" : "form-error"} role="status">{state.message}</div>
      )}
      <input type="hidden" name="org_id" value={orgId} />
      <div className="field">
        <label htmlFor="tech-email">Technician&apos;s account email</label>
        <input id="tech-email" name="email" type="email" placeholder="tech@company.com" required />
      </div>
      <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>
        {pending ? "Adding…" : "+ Add to Roster"}
      </button>
      <p style={{ fontSize: ".84rem", color: "var(--text-soft)", marginTop: 10 }}>
        They need a free account first — send them to ndtacademy.com/signup.
      </p>
    </form>
  );
}
