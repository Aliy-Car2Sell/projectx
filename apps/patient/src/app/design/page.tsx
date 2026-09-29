import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignShowcase } from "./DesignShowcase";

export const metadata: Metadata = { title: "ProjectX · Design" };

/**
 * Every token and component of the design system on one page, in all their variants.
 * A tool for whoever works on the UI: it exists in `next dev` only, a build answers 404.
 */
export default function DesignPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DesignShowcase />;
}
