import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export function AnimatedNumber({ value, className = "" }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 140,
    damping: 22,
    mass: 0.8,
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      if (ref.current) {
        ref.current.textContent = value.toLocaleString("vi-VN");
      }
      return;
    }
    motionValue.set(value);
  }, [value, motionValue, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString("vi-VN");
      }
    });
    return () => unsubscribe();
  }, [springValue, prefersReducedMotion]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value.toLocaleString("vi-VN")}
    </span>
  );
}
