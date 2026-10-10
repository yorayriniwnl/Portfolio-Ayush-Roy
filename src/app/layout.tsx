import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { ExperienceRuntime } from "@/experience/ExperienceRuntime";
import { CustomCursor } from "@/components/CustomCursor";
import { profile } from "@/content/profile";
import { getSiteOrigin } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: "Ayush Roy | Product & Full-Stack Engineer",
    template: "%s | Ayush Roy",
  },
  description:
    "Ayush Roy builds backend systems, full-stack products, realtime APIs, applied ML workflows, and evidence-backed engineering case studies.",
  keywords: ["Ayush Roy", "Backend Software Engineer", "Full-Stack Engineer", "Python", "TypeScript", "PostgreSQL", "Redis", "Realtime Systems", "Applied ML"],
  alternates: { canonical: "/" },
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
  openGraph: {
    title: "Ayush Roy · Product & Full-Stack Engineer",
    description: profile.positioning,
    type: "website",
    url: "/",
    siteName: "YOR / Ayush Roy",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Ayush Roy Full Stack Developer editorial portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayush Roy · Product & Full-Stack Engineer",
    description: profile.positioning,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.headline,
  description: profile.positioning,
  url: getSiteOrigin(),
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: profile.location },
  sameAs: [profile.links.github, profile.links.linkedin, profile.links.steam],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning>
        <ExperienceRuntime>
          <a className="machine-skip-link" href="#main">
            Skip to content
          </a>
          <SiteNav />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
          />
          {children}
        </ExperienceRuntime>
        <CustomCursor />
      </body>
    </html>
  );
}
