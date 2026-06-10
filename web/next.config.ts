import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  // Authored lesson content is read with fs at request time — make sure it
  // ships in serverless bundles on deploy.
  outputFileTracingIncludes: {
    "/learn/**": ["./src/data/content/**"],
  },
  async redirects() {
    // Legacy prototype URLs → canonical routes (SEO-safe 301s)
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/courses.html", destination: "/courses", permanent: true },
      { source: "/exams.html", destination: "/practice-exams", permanent: true },
      { source: "/resources.html", destination: "/resources", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/login.html", destination: "/login", permanent: true },
      { source: "/exams", destination: "/practice-exams", permanent: true },
    ];
  },
};

export default nextConfig;
