"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AuthButton, NavToggle } from "@/components/SiteChrome";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/practice-exams", label: "Practice Exams" },
  { href: "/ndt-training-hours", label: "Training Hours" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" href="/" aria-label="NDTAcademy.com home">
          <Image src="/logo.png" alt="NDTAcademy.com" width={133} height={60} priority />
        </Link>
        <NavToggle />
        <nav className="main-nav" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : undefined}>
              {l.label}
            </Link>
          ))}
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
