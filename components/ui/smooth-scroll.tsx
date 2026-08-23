"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return children;

  return (
    <ReactLenis
      root
      options={{
        anchors: true,
        autoRaf: true,
        duration: 0.82,
        lerp: 0.14,
        smoothWheel: true,
        syncTouch: true,
        touchInertiaExponent: 1.65,
        touchMultiplier: 1,
        wheelMultiplier: 0.9,
      }}
    >
      {children}
    </ReactLenis>
  );
}
