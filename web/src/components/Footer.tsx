import Link from "next/link";
import { COURSES, slugForCourse } from "@/lib/curriculum";

export default function Footer() {
  const methods = COURSES.filter((c) => ["ut", "rt", "mt", "pt", "et", "vt"].includes(c.id));
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-wordmark">NDTACADEMY<em>.COM</em></div>
            <p style={{ fontSize: ".95rem", maxWidth: "36ch" }}>
              Online NDT training and certification preparation for technicians and the
              companies that employ them — built to SNT-TC-1A and NAS410.
            </p>
          </div>
          <div>
            <h4>Training</h4>
            <Link href="/courses">NDT Courses</Link>
            <Link href="/practice-exams">Practice Exams</Link>
            <Link href="/ndt-training-hours">Training Hour Requirements</Link>
            <Link href="/resources">Resources</Link>
            <Link href="/compliance">Compliance Report</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Sign In</Link>
            <Link href="/signup">Create Account</Link>
          </div>
          <div>
            <h4>Methods</h4>
            {methods.map((c) => (
              <Link key={c.id} href={`/courses/${slugForCourse(c.id)}`}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 NDT Academy · NDTAcademy.com</span>
          <span>Training aligned to ASNT SNT-TC-1A 2024 &amp; NAS410</span>
        </div>
      </div>
    </footer>
  );
}
