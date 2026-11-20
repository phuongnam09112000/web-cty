import styled from "styled-components";

const Banner = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 8px 16px;
  text-align: center;
  font-weight: 600;
  color: #1f1f1f;
  background: #ffd666;
`;

const PreviewBanner = () => (
  <Banner role="status" data-testid="preview-banner">
    Đang xem bản nháp
  </Banner>
);

export default PreviewBanner;
