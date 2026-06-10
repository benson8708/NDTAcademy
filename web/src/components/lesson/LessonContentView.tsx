// Server-rendered body of an authored lesson: teaching sections, figures,
// tables, and callouts. Interactive and assessment blocks are client islands
// mounted by the lesson page.
import Image from "next/image";
import { MarkdownLite } from "@/lib/markdownLite";
import type { ContentSection, ContentFigure } from "@/lib/vtContent";

export default function LessonContentView({
  courseId,
  sections,
  figures,
}: {
  courseId: string;
  sections: ContentSection[];
  figures: ContentFigure[];
}) {
  const figureById = new Map(figures.map((f) => [f.id, f]));
  return (
    <div className="lesson-content prose" style={{ maxWidth: "none" }}>
      {sections.map((s, i) => {
        if (s.type === "text") {
          return (
            <section key={i} className="lc-text">
              {s.heading && <h2>{s.heading}</h2>}
              <MarkdownLite text={s.body ?? ""} />
            </section>
          );
        }
        if (s.type === "callout") {
          return (
            <aside key={i} className={`lc-callout ${s.variant ?? "standard"}`}>
              {s.title && <div className="lc-callout-title">{s.title}</div>}
              <MarkdownLite text={s.body ?? ""} />
            </aside>
          );
        }
        if (s.type === "figure") {
          const fig = s.figureId ? figureById.get(s.figureId) : undefined;
          if (!fig) return null;
          return (
            <figure key={i} className="lc-figure">
              <Image
                src={`/content/${courseId}/figures/${fig.file}`}
                alt={fig.title}
                width={800}
                height={450}
                unoptimized
              />
              {s.caption && <figcaption>{s.caption}</figcaption>}
            </figure>
          );
        }
        if (s.type === "table") {
          return (
            <div key={i} className="lc-table">
              <table className="data">
                <thead>
                  <tr>{(s.headers ?? []).map((h, j) => <th key={j}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {(s.rows ?? []).map((row, j) => (
                    <tr key={j}>{row.map((cell, k) => <td key={k}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
              {s.caption && <div className="lc-table-caption">{s.caption}</div>}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
