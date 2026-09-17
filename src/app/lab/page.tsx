import type { Metadata } from "next";
import { Lab } from "@/components/Lab";
import { absoluteSiteUrl } from "@/content/site";

export const metadata: Metadata = {
  title: "YOR Lab · Experiments",
  description: "Experimental game-room, interface, and media concepts by Ayush Roy, clearly separated from recruiter-facing engineering work.",
  alternates: { canonical: absoluteSiteUrl("/lab") },
  robots: { index: true, follow: true },
};

export default function LabPage() {
  return <Lab />;
}
