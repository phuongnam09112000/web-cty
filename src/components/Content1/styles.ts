import styled from "styled-components";

export const ContentWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 935px;
  overflow: hidden;

  .swiper {
    width: 100%;
    height: 100%;
  }
  .swiper-pagination {
    bottom: 30px; /* Tăng khoảng cách xuống dưới để dễ nhìn hơn */
  }

  .swiper-pagination-bullet {
    width: 12px; /* Tăng kích thước bullet */
    height: 12px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 1;
    margin: 0 10px; /* Tăng khoảng cách giữa các bullet */
    transition: all 0.3s ease;
  }

  .swiper-pagination-bullet-active {
    background: transparent;
    border: 2px solid white;
    width: 18px; /* Tăng kích thước bullet active */
    height: 18px;
    transform: translateY(3px);
  }

  /* Tablet (768px - 1024px) */
  @media (max-width: 1024px) {
    height: 600px; /* Tăng chiều cao một chút để nội dung thoải mái hơn */
    
    .swiper-pagination {
      bottom: 20px;
    }
    
    .swiper-pagination-bullet {
      width: 10px;
      height: 10px;
      margin: 0 8px;
    }
    
    .swiper-pagination-bullet-active {
      width: 14px;
      height: 14px;
    }
  }

  /* Mobile (dưới 768px) */
  @media (max-width: 768px) {
    height: 500px; /* Tăng chiều cao để nội dung không bị chật */
    
    .swiper-pagination {
      bottom: 15px;
    }
    
    .swiper-pagination-bullet {
      width: 8px;
      height: 8px;
      margin: 0 6px;
    }
    
    .swiper-pagination-bullet-active {
      width: 12px;
      height: 12px;
    }
  }
  
  /* Mobile nhỏ (dưới 480px) */
  @media (max-width: 480px) {
    height: 400px; /* Tăng từ 300px lên 400px để có thêm không gian */
  }
`;

export const BackgroundImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.65); /* Giảm brightness để văn bản dễ đọc hơn */
  transition: transform 0.5s ease;

  /* Các media queries kế thừa chiều cao từ ContentWrapper */
`;
export const Title = styled.h1`
  position: absolute;
  left: 7%;
  bottom: 220px;
  color: white;
  font-size: 3.25rem;
  font-weight: 700;
  max-width: 80%;
  line-height: 1.2;
  z-index: 3; /* Tăng z-index để đảm bảo Title nằm trên cùng */
  font-family: "Lato", sans-serif;
  text-transform: uppercase;
  animation: fadeInSlideUp 0.7s ease-out forwards;
  letter-spacing: 1.5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  overflow: hidden;

  @keyframes fadeInSlideUp {
    0% {
      opacity: 0;
      transform: translateY(50px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Tablet (768px - 1024px) */
  @media (max-width: 1024px) {
    left: 8%;
    bottom: 150px;
    font-size: 2.625rem;
    line-height: 1.2;
    max-width: 85%;
  }

  /* Mobile (dưới 768px) */
  @media (max-width: 768px) {
    left: 8%;
    bottom: 120px;
    font-size: 2rem;
    line-height: 1.3;
    max-width: 85%;
  }

  /* Mobile nhỏ (dưới 480px) */
  @media (max-width: 480px) {
    bottom: 110px;
    font-size: 1.5rem;
    line-height: 1.3;
    max-width: 90%;
  }

  /* Tỷ lệ hiển thị 125% hoặc DPI cao */
  @media (-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi) {
    left: 6%;
    font-size: 3rem;
    max-width: 82%;
    letter-spacing: 1.2px;

    /* Tablet */
    @media (max-width: 1024px) {
      font-size: 2.375rem;
      max-width: 87%;
    }

    /* Mobile */
    @media (max-width: 768px) {
      font-size: 1.875rem;
      max-width: 87%;
    }

    /* Mobile nhỏ */
    @media (max-width: 480px) {
      font-size: 1.375rem;
      max-width: 88%;
    }
  }
`;

export const Description = styled.p`
  position: absolute;
  left: 7%;
  bottom: 100px; /* Giảm bottom để tạo khoảng cách lớn hơn với Title */
  color: white;
  font-size: 1.75rem; /* Chuyển sang rem, tương đương ~28px */
  font-weight: 400;
  max-width: 80%; /* Giảm max-width để kiểm soát nội dung dài */
  line-height: 1.5;
  z-index: 2; /* Đảm bảo Description dưới Title */
  font-family: "Lato", sans-serif;
  animation: fadeInSlideUp 0.7s ease-out forwards;
  animation-delay: 0.2s;
  opacity: 0;
  letter-spacing: 1px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  overflow-wrap: break-word; /* Đảm bảo nội dung dài xuống dòng hợp lý */

  &::before {
    content: "";
    position: absolute;
    top: -20px; /* Giảm top để gần Description hơn, tránh chồng lấn Title */
    left: 0;
    width: 180px;
    height: 3px;
    background: white;
    transition: width 0.3s ease;
    z-index: 1; /* Đảm bảo ::before dưới Title và Description */
  }

  /* Tablet (768px - 1024px) */
  @media (max-width: 1024px) {
    left: 8%;
    bottom: 60px;
    font-size: 1.5rem; /* ~24px */
    line-height: 1.4;
    max-width: 82%;

    &::before {
      top: -15px;
      width: 100px;
      height: 2px;
    }
  }

  /* Mobile (dưới 768px) */
  @media (max-width: 768px) {
    left: 8%;
    bottom: 40px;
    font-size: 1.125rem; /* ~18px */
    line-height: 1.4;
    max-width: 82%;

    &::before {
      top: -12px;
      width: 70px;
      height: 2px;
    }
  }

  /* Mobile nhỏ (dưới 480px) */
  @media (max-width: 480px) {
    bottom: 30px;
    font-size: 1rem; /* ~16px */
    line-height: 1.4;
    max-width: 85%;

    &::before {
      top: -10px;
      width: 50px;
    }
  }

  /* Tỷ lệ hiển thị 125% hoặc DPI cao */
  @media (-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi) {
    font-size: 1.625rem; /* ~26px */
    max-width: 78%; /* Giảm max-width để tránh tràn */
    letter-spacing: 0.8px;
    left: 6%;

    &::before {
      top: -18px;
      width: 160px;
    }

    /* Tablet */
    @media (max-width: 1024px) {
      font-size: 1.375rem; /* ~22px */
      max-width: 80%;
      bottom: 55px;

      &::before {
        top: -14px;
        width: 90px;
      }
    }

    /* Mobile */
    @media (max-width: 768px) {
      font-size: 1rem; /* ~16px */
      max-width: 80%;
      bottom: 35px;

      &::before {
        top: -10px;
        width: 60px;
      }
    }

    /* Mobile nhỏ */
    @media (max-width: 480px) {
      font-size: 0.875rem; /* ~14px */
      max-width: 88%;
      bottom: 25px;

      &::before {
        top: -8px;
        width: 45px;
      }
    }
  }
`;