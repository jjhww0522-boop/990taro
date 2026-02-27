"use client";

import { useEffect, useRef } from "react";

export default function StarParticles() {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const starsEl = starsRef.current;
    if (!starsEl) return;

    starsEl.innerHTML = "";

    const starCount = 80;
    for (let i = 0; i < starCount; i += 1) {
      const s = document.createElement("div");
      s.className = "star";
      const size = Math.random() < 0.2 ? 4 : Math.random() < 0.5 ? 3 : 2;
      s.style.cssText = `
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        --dur:${2.5 + Math.random() * 4}s;
        --delay:${Math.random() * 5}s;
        opacity:${0.4 + Math.random() * 0.6};
        width:${size}px;
        height:${size}px;
        box-shadow: 0 0 ${size * 2}px rgba(212, 175, 55, 0.5);
      `;
      starsEl.appendChild(s);
    }
  }, []);

  return <div className="stars" ref={starsRef} id="stars" />;
}
