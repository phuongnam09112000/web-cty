import { RefObject, useEffect, useState } from "react";

/**
 * True once the element is within `margin` of the visible area, and from
 * then on. Used to start below-the-fold images only when they are about to be
 * seen, so they never compete with the hero image on page load.
 */
const useNearViewport = (ref: RefObject<Element>, margin = 600) => {
  const [near, setNear] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (near || !ref.current) return;
    // The page scrolls inside <body> (global overflow styles); the margin only
    // takes effect when it is set on that scroll container.
    const bodyScrolls = getComputedStyle(document.body).overflowY !== "visible";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { root: bodyScrolls ? document.body : null, rootMargin: `${margin}px 0px` }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [near, ref, margin]);

  return near;
};

export default useNearViewport;
