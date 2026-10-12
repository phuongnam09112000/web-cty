import styled from "styled-components";

export const LazySection = styled.div<{ isVisible: boolean }>`
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transform: ${(props) => (props.isVisible ? "translateY(0)" : "translateY(50px)")};
  transition: opacity 0.7s ease-out, transform 0.7s ease-out;
`;