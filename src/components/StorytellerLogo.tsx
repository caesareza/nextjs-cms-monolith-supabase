import React from "react";

interface StorytellerLogoProps {
  className?: string;
  height?: number;
}

export default function StorytellerLogo({ className = "", height = 32 }: StorytellerLogoProps) {
  // Compute width based on H (approx 4.5:1 aspect ratio)
  const width = Math.round(height * 4.5);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 144 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Storyteller Logo"
    >
      {/* Black Background Rectangle */}
      <rect width="144" height="32" rx="6" fill="#121212" />

      {/* Orange/Red Dot */}
      <circle cx="16" cy="16" r="4" fill="#FF4B2B" />

      {/* Brand Text "STORYTELLER" */}
      <text
        x="28"
        y="21"
        fill="#FFFFFF"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Outfit', 'Inter', 'Montserrat', sans-serif"
        fontWeight="800"
        fontSize="12.5"
        letterSpacing="0.04em"
      >
        CMS Posthinks
      </text>
    </svg>
  );
}
