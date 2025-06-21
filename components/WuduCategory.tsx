// WuzuCategory.tsx
import React from "react";

interface StepProps {
  id: number;
  title: string;
  description: string;
}

 const WuzuCategory: React.FC<StepProps> = ({ id, title, description }) => (
  <li key={id} style={{ marginBottom: "15px" }}>
    <h3>{title}</h3>
    <p>{description}</p>
  </li>
);

export default WuzuCategory;  