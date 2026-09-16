import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { profile } from "@/content/profile";
import { getSiteOrigin } from "@/content/site";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-display",
});
const technical = DM_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-technical",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: "YOR — The personal universe of Ayush Roy",
    template: "%s · YOR",
  },
  description:
    "Explore Ayush Roy's products and experiments, play chess and arcade games, and watch moments from Yor Ayrin's channel.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "YOR // Ayush Roy field hub",
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
    title: "YOR // Ayush Roy field hub",
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
      className={`${display.variable} ${technical.variable}`}
    >
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteNav />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
