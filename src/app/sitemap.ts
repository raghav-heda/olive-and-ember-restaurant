import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oliveandember.demo";

  const routes = [
    "",
    "/menu",
    "/reservations",
    "/about",
    "/gallery",
    "/offers",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/menu" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/menu" || route === "/reservations" ? 0.9 : 0.7,
  }));
}
