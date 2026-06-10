"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompleteButton({
  lessonId,
  initialDone,
  locked = false,
  lockReason,
}: {
  lessonId: string;
  initialDone: boolean;
  locked?: boolean;
  lockReason?: string;
}) {
  const router = useRouter();
  const [done, setDone] = useState(initialDone);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    if (done) {
      const { error } = await supabase
        .from("lesson_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);
      if (!error) setDone(false);
    } else {
      const { error } = await supabase
        .from("lesson_progress")
        .upsert({ user_id: user.id, lesson_id: lessonId }, { onConflict: "user_id,lesson_id", ignoreDuplicates: true });
      if (!error) setDone(true);
    }
    setBusy(false);
    router.refresh();
  }

  if (locked && !done) {
    return (
      <button className="btn complete-btn" disabled title={lockReason}>
        {lockReason ?? "Locked"}
      </button>
    );
  }
  return (
    <button className={`btn complete-btn${done ? " done" : ""}`} onClick={toggle} disabled={busy}>
      {done ? "Completed ✓" : "Mark Lesson Complete"}
    </button>
  );
}
