export interface SolutionBannerProps {
    backgroundImage: string;    // Đường dẫn ảnh nền banner (bắt buộc)
    title: string;             // Tiêu đề chính (bắt buộc)
    subtitle?: string;         // Phụ đề (optional)
    buttonText?: string;       // Text hiển thị trên button (optional)
    onButtonClick?: () => void; // Hàm xử lý khi click button (optional)
    overlayColor?: string;     // Màu overlay (optional, mặc định là rgba(0, 0, 0, 0.3))
    titleColor?: string;       // Màu tiêu đề (optional, mặc định white)
    subtitleColor?: string;    // Màu phụ đề (optional, mặc định rgba(255, 255, 255, 0.9))
  }