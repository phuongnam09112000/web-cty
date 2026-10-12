import styled from "styled-components";

export const ContainerContent = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  text-align: center;
  padding: 35px 0;

  /* Tablet */
  @media (max-width: 768px) {
    padding: 25px 15px;
    max-width: 100%; 
  }

  /* Mobile */
  @media (max-width: 480px) {
    padding: 15px 10px; 
  }
`;

export const Container = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  text-align: center;
  padding: 15px 0;

  /* Tablet */
  @media (max-width: 768px) {
    padding: 10px 15px;
    max-width: 100%;
  }

  /* Mobile */
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

export const Title = styled.h2`
  font-size: 42px;
  font-weight: bold;
  color: #0e5d95;
  margin-bottom: 28px;

  /* Tablet */
  @media (max-width: 768px) {
    font-size: 32px; 
    margin-bottom: 50px; 
  }

  /* Mobile */
  @media (max-width: 480px) {
    font-size: 28px;
    margin-bottom: 30px;
  }
`;

export const Description = styled.p`
  font-size: 18px;
  color: #333;
  font-weight: 400;
  line-height: 1.6;
  font-family: "Open Sans", sans-serif;
  margin-bottom: 35px;

  /* Tablet */
  @media (max-width: 768px) {
    font-size: 16px; 
    margin-bottom: 25px;
  }

  /* Mobile */
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

export const SolutionItem = styled.div`
  text-align: left;
  font-size: 18px;
  margin-bottom: 10px;

  h3 {
    margin-bottom: 10px;
  }

  span {
    font-weight: bold;
    color: #000;
  }

  /* Tablet */
  @media (max-width: 768px) {
    font-size: 16px; 
    margin-bottom: 8px;
  }

  /* Mobile */
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 6px;
  }
`;

export const Divider = styled.hr`
  border-radius: 5px;
  height: 5px;
  background-color: #0E5D9595;
  width: 100%;
  margin: 40px auto 0 auto;

  @media (max-width: 768px) {
    height: 2px;
    margin: 30px auto 0 auto; 
  }

  /* Mobile */
  @media (max-width: 480px) {
    height: 1px;
    margin: 20px auto 0 auto;
  }
`;