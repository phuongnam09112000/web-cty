import React from "react";
import styled from "styled-components";
import { logoMetrics } from "./logoMetrics";

/* A logo trimmed to its visible content and sized for equal visual weight:
 * every logo gets roughly the same area, so a square emblem and a long
 * wordmark read as equals. The parent sets --logo-scale per breakpoint. */
const Frame = styled.span`
  position: relative;
  display: block;
  flex-shrink: 0;
  width: calc(var(--w) * var(--logo-scale, 1) * 1px);
  height: calc(var(--h) * var(--logo-scale, 1) * 1px);
  overflow: hidden;

  img {
    position: absolute;
    max-width: none;
  }
`;

interface LogoProps {
  src: string;
  alt: string;
  /** Target visible area in px² at scale 1 */
  area: number;
  maxWidth: number;
  maxHeight: number;
  /** Render the <img> (false until the section is near the viewport) */
  load: boolean;
  /** Hidden from assistive technology when a visible name sits beside it */
  decorative?: boolean;
}

const Logo = ({ src, alt, area, maxWidth, maxHeight, load, decorative }: LogoProps) => {
  const metrics = logoMetrics[src] ?? { crop: [0, 0, 1, 1], ratio: 2 };
  const [left, top, right, bottom] = metrics.crop;
  const { ratio } = metrics;

  // equal area, then fit inside the allowed box
  let width = Math.sqrt(area * ratio);
  let height = width / ratio;
  if (width > maxWidth) { width = maxWidth; height = width / ratio; }
  if (height > maxHeight) { height = maxHeight; width = height * ratio; }

  const cropW = right - left;
  const cropH = bottom - top;

  return (
    <Frame
      style={{ "--w": width.toFixed(1), "--h": height.toFixed(1) } as React.CSSProperties}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": alt })}
    >
      {load && (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          style={{
            width: `${100 / cropW}%`,
            height: `${100 / cropH}%`,
            left: `${(-left / cropW) * 100}%`,
            top: `${(-top / cropH) * 100}%`,
          }}
        />
      )}
    </Frame>
  );
};

export default Logo;
