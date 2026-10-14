export interface AboutBannerProps {
    backgroundImage: string;
    title: string;
    subtitle?: string;
    eyebrow?: string;
    /** Use 2 when the page has its own h1 below the banner */
    headingLevel?: 1 | 2;
  }
  