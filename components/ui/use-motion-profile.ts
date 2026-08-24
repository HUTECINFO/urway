"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

export function useMotionProfile() {
  const reducedMotion = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse), (max-width: 767px)");
    const update = () => setIsTouchDevice(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return {
    reducedMotion: Boolean(reducedMotion),
    isTouchDevice,
    simplifyScrollMotion: Boolean(reducedMotion) || isTouchDevice,
  };
}
