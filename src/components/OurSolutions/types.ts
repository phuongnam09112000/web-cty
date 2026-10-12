export interface SolutionCardProps {
  icon: string;
  // i18n keys thay vì hardcode string
  titleKey: string;
  descriptionKey: string;
  link: string;
  image?: string;
  iconBgColor?: string;
  // giữ backward compat nếu cần
  title?: string;
  description?: string;
}

export interface CardWrapperProps {
  $isActive?: boolean;
}

export interface StyledProps {
  visible?: boolean;
}

export interface IconWrapperProps {
  $bgColor?: string;
  $isMobileActive?: boolean;
}