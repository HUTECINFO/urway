"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { useMotionProfile } from "./use-motion-profile";

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const { simplifyScrollMotion } = useMotionProfile();

  // Native touch scrolling stays on the browser compositor. Lenis remains a desktop polish.
  if (simplifyScrollMotion) return children;

  return (
    <ReactLenis
      root
      options={{
        anchors: true,
        autoRaf: true,
        duration: 0.82,
        lerp: 0.14,
        smoothWheel: true,
        wheelMultiplier: 0.9,
      }}
    >
      {children}
    </ReactLenis>
  );
}
