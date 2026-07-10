import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { resolveSiteUrlFromRequestHeaders } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = resolveSiteUrlFromRequestHeaders(await headers());

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
          "/reset-password",
          "/reset-password/",
          "/account",
          "/account/",
          "/pricing/success",
          "/pricing/success/",
          "/pricing/cancel",
          "/pricing/cancel/",
          "/preview/",
          "/dashboard-kits/",
          "/*?search=",
          "/*?sort=",
          "/*?page=",
          "/*?category=",
          "/*?subcategory=",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}