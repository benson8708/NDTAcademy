// Site-wide constants used by metadata, JSON-LD, and the sitemap.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ndtacademy.com";
export const SITE_NAME = "NDT Academy";
export const SITE_TITLE = "NDT Training Online — SNT-TC-1A & NAS410 Courses | NDT Academy";
export const SITE_DESCRIPTION =
  "Online NDT training built to SNT-TC-1A 2024 and NAS410: UT, RT, MT, PT, ET and VT courses for Levels I–III with audit-ready training records and a 5,000+ question practice exam bank.";

export const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Online nondestructive testing training provider. Method courses aligned to ANSI/ASNT CP-105 with formal training hours mapped to SNT-TC-1A and NAS410.",
  sameAs: [],
};

export const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
