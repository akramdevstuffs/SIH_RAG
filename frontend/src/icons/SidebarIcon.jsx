// components/SidebarReverseIcon.jsx
import React from "react";

export default function SidebarReverseIcon({ width = 24, height = 24, className = "", fill = "currentColor" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M16 3a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3zm-5-1v12H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h9zm1 0h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2V2z" />
    </svg>
  );
}
