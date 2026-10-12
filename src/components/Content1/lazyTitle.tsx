// LazyTitle.tsx
import React from "react";
import { Title } from "./styles";


const LazyTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Title>{children}</Title>;
};

export default LazyTitle;