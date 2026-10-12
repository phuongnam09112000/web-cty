export interface SolutionItem {
  title: string;
  content: string[];
  image?: string;
  icon?: string;
}

export interface CoreValuesSystemProps {
  title: string;
  solutions: SolutionItem[];
  backgroundColor?: string;
  defaultImage?: string;
  autoPlayInterval?: number;
  images?: string[];
  icons?: string[];
}

export interface IconContainerProps {
  isActive: boolean;
}

export interface ProgressDotProps {
  active: boolean;
}