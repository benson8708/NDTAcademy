// Fixed page-top scroll progress styled as a UT trace being drawn: the line
// "scans" across as you read. Pure CSS — stroke offset is driven by the
// --scroll var, so it costs nothing beyond ScrollFX's single listener.
const PATH =
  "M0,9 L120,9 132,7 141,1 150,8 220,9 320,9 332,7.5 341,3 350,8.5 430,9 560,9 572,7 581,2 590,8 700,9 840,9 852,7.5 861,3.5 870,8.5 1000,9 1200,9";
const LENGTH = 1215; // measured path length, slight over-estimate is fine

export default function WaveProgress() {
  return (
    <div className="wave-progress" aria-hidden="true">
      <svg viewBox="0 0 1200 12" preserveAspectRatio="none">
        <path d={PATH} className="wp-track" />
        <path
          d={PATH}
          className="wp-fill"
          style={{ strokeDasharray: LENGTH, strokeDashoffset: `calc(${LENGTH}px * (1 - var(--scroll, 0)))` }}
        />
      </svg>
    </div>
  );
}
