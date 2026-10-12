import styled from "styled-components";

export const StyledContainer = styled("div")<{
  border?: boolean;
}>`
  position: relative;
  width: 100%;
  max-width: 100vw;
  margin-right: auto;
  min-height: "calc(100vh - 200px)";
  margin-left: auto;
  border-top: ${(p) => (p.border ? "1px solid #CDD1D4" : "")};

  @media only screen and (max-width: 1024px) {
    max-width: 100%;
    margin: 0; /* Loại bỏ margin trái/phải */
    padding: 0; /* Loại bỏ padding trái/phải */
  }
  @media only screen and (max-width: 768px) {
    max-width: 100%; /* Lấp đầy chiều rộng trên điện thoại */
    margin: 0; /* Loại bỏ margin trái/phải */
    padding: 0; /* Loại bỏ padding trái/phải */
  }

  @media only screen and (max-width: 414px) {
    max-width: 100%; /* Đảm bảo lấp đầy trên điện thoại nhỏ */
    padding: 0; /* Đảm bảo không có padding */
  }
`;
