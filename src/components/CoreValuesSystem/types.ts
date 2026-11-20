export interface SolutionItem {
  title: string;
  content: string[];
  image?: string;
  icon?: string;
  imageAlt?: string;
  iconAlt?: string;
}

export interface IconContainerProps {
  isActive: boolean;
}

export interface ProgressDotProps {
  active: boolean;
}
