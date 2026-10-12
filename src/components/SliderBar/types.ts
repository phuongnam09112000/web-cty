export interface SlideData {
    src: string;
    text: string;
    description?: string;
  }
  
  export interface SliderProps {
    interval?: number; // Thời gian tự động chuyển slide (ms)
    autoplay?: boolean; // Bật/tắt tự động chuyển
  }