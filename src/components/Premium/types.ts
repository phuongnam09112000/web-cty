export interface Solution {
  title: string;
  content: string;
}

export interface SectionProps {
  id: string; // Nếu dữ liệu JSON có ID, thêm vào để dễ quản lý key
  title: string;
  title2: string;
  description: string;
  solutions: Solution[];
}

export interface ServiceContentProps {
  sections: SectionProps[];
}
