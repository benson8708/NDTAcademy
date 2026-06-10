"use client";
// Lesson voiceover player. Audio is generated per-lesson into
// /public/audio/<courseId>/<lessonId>.mp3; until a file exists we show the
// transcript with a "narration coming soon" note instead of a broken player.
import { useEffect, useRef, useState } from "react";

const RATES = [1, 1.25, 1.5];

export default function NarrationPlayer({
  courseId,
  lessonId,
  script,
}: {
  courseId: string;
  lessonId: string;
  script: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [rate, setRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const src = `/audio/${courseId}/${lessonId}.mp3`;

  useEffect(() => {
    let cancelled = false;
    fetch(src, { method: "HEAD" })
      .then((r) => !cancelled && setAvailable(r.ok))
      .catch(() => !cancelled && setAvailable(false));
    return () => {
      cancelled = true;
    };
  }, [src]);

  function cycleRate() {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  return (
    <div className="narration">
      <div className="narration-head">
        <span className="mtag narration">narration</span>
        <span className="t">Listen to this lesson</span>
        {available && (
          <button className="rate-btn" onClick={cycleRate} aria-label="Playback speed">
            {rate}×
          </button>
        )}
        <button className="rate-btn" onClick={() => setShowTranscript((s) => !s)}>
          {showTranscript ? "Hide transcript" : "Transcript"}
        </button>
      </div>
      {available === false && (
        <div className="narration-pending">
          Voiceover audio is being produced for this lesson — read the transcript below in the meantime.
        </div>
      )}
      {available && (
        <audio
          ref={audioRef}
          controls
          preload="none"
          src={src}
          style={{ width: "100%", display: "block" }}
          onPlay={(e) => { e.currentTarget.playbackRate = rate; }}
        />
      )}
      {(showTranscript || available === false) && (
        <div className="narration-transcript">{script}</div>
      )}
    </div>
  );
}
