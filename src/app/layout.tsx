import type { Metadata } from "next";
import "./globals.css";
import "./rebuild.css";
import { SiteNav } from "@/components/SiteNav";
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
    "Ayush Roy builds realtime systems, full-stack products, applied ML workflows, and interactive Three.js experiences with evidence-backed engineering case studies.",
  keywords: ["Ayush Roy", "Product Engineer", "Full-Stack Engineer", "Next.js", "Realtime Systems", "Applied ML", "Three.js"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ayush Roy · Product & Full-Stack Engineer",
    description: profile.positioning,
    type: "website",
    url: "/",
    siteName: "YOR / Ayush Roy",
    images: [
      {
        url: "/media/hero-studio.svg",
        width: 1600,
        height: 1100,
        alt: "YOR crimson field hub artwork",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayush Roy · Product & Full-Stack Engineer",
    description: profile.positioning,
    images: ["/media/hero-studio.svg"],
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
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteNav />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
        <CustomCursor />
      </body>
    </html>
  );
}
