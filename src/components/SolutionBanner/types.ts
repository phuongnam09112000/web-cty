export interface SolutionBannerProps {
    backgroundImage: string;    // Đường dẫn ảnh nền banner (bắt buộc)
    title: string;             // Tiêu đề chính (bắt buộc)
    subtitle?: string;         // Phụ đề (optional)
    buttonText?: string;       // Text hiển thị trên button (optional)
    onButtonClick?: () => void; // Hàm xử lý khi click button (optional)
  }