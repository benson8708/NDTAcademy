import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { COURSES, COURSE_EXAM_METHOD, slugForCourse } from "@/lib/curriculum";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] = "weekly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    page("/", 1),
    page("/courses", 0.9),
    ...COURSES.map((c) => page(`/courses/${slugForCourse(c.id)}`, 0.9)),
    page("/practice-exams", 0.9),
    ...COURSES.filter((c) => COURSE_EXAM_METHOD[c.id]).map((c) =>
      page(`/practice-exams/${slugForCourse(c.id)}`, 0.8),
    ),
    page("/ndt-training-hours", 0.8),
    page("/resources", 0.6, "monthly"),
    page("/about", 0.5, "monthly"),
    page("/contact", 0.5, "monthly"),
    page("/compliance", 0.5, "monthly"),
  ];
}
