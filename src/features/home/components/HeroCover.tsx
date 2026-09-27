"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const heroBlur = "blur(12px)";

export function HeroCover({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const copy = root.querySelector("[data-hero-copy]");
      const fit = root.querySelector("[data-fit-intro]");
      if (!copy || !fit) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          copy,
          { filter: "blur(0px)" },
          {
            filter: heroBlur,
            ease: "none",
            scrollTrigger: {
              trigger: fit,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="contents">
      {children}
    </div>
  );
}
