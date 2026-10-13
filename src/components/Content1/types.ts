import type { MouseEvent } from "react";

export interface HeroAction {
  label: string;
  /** In-app route (rendered as a router Link) */
  to?: string;
  /** Same-page anchor, e.g. "#solutions"; onClick can take over the scroll */
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export interface ContentBlockProps {
  /** Slide images; the first one is the LCP image and loads first */
  backgroundImage: string[];
  /** Small label above the headline (company name) */
  eyebrow: string;
  /** The page's h1: ISTT's value proposition */
  title: string;
  /** One supporting line per slide (existing taglines) */
  descriptions: string[];
  primaryAction: HeroAction;
  secondaryAction: HeroAction;
  id: string;
}
