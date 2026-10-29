import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const COLORS = [
  "var(--color-accent-1)",
  "var(--color-gold-1)",
  "var(--color-emerald-1)",
  "var(--color-ink-1)",
  "var(--color-accent-2)",
];

export function Confetti() {
  const prefersReducedMotion = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => {
        const angle = (i / 36) * Math.PI * 2 + (i % 3) * 0.15;
        const distance = 110 + (i % 5) * 45;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 40,
          rotate: (i * 57) % 360,
          color: COLORS[i % COLORS.length],
          size: 6 + (i % 4) * 2,
          delay: (i % 6) * 0.03,
        };
      }),
    []
  );

  if (prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden flex items-center justify-center z-50"
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.4, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.x,
            y: [p.y, p.y + 180],
            scale: [0.4, 1.1, 0.8],
            rotate: p.rotate + 240,
          }}
          transition={{
            duration: 1.8,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
          }}
          className="absolute rounded-[2px]"
        />
      ))}
    </div>
  );
}
