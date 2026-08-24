"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useMotionProfile } from "./use-motion-profile";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}

export function Reveal({ children, className, delay = 0, distance = 42 }: RevealProps) {
  const { reducedMotion, simplifyScrollMotion } = useMotionProfile();
  const travel = simplifyScrollMotion ? Math.min(distance, 20) : distance;

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : simplifyScrollMotion ? { opacity: 0, y: travel } : { opacity: 0, y: travel, filter: "blur(8px)" }}
      whileInView={simplifyScrollMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.14, margin: "0px 0px -8% 0px" }}
      transition={{ duration: simplifyScrollMotion ? 0.52 : 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
