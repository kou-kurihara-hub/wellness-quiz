"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger: boolean;
}

export default function ConfettiEffect({ trigger }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ["#4CAF50", "#FF9800", "#FFC107", "#81C784", "#FFB74D"];

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        zIndex: 9999,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Big burst in the center
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors,
      zIndex: 9999,
    });
  }, [trigger]);

  return null;
}
