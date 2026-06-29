import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/admin-login",
          "/admin-login/",
          "/api/",
          "/sign-in",
          "/sign-in/",
          "/sign-up",
          "/sign-up/",
          "/forgot-password",
          "/forgot-password/",
          "/pricing/success",
          "/pricing/success/",
          "/pricing/cancel",
          "/pricing/cancel/",
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
