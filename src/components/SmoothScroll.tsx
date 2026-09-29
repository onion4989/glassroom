"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollSmoother, useGSAP } from "@/lib/gsap";

const smoothSec = 1;

export function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(() => {
    const wrap = wrapRef.current;
    const content = contentRef.current;
    if (!wrap || !content) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const smoother = ScrollSmoother.create({
        wrapper: wrap,
        content,
        smooth: smoothSec,
        effects: false,
        smoothTouch: false,
      });
      return () => {
        smoother.kill();
      };
    });
  });

  return (
    <div ref={wrapRef} id="smooth-wrapper" className="relative z-1">
      <div ref={contentRef} id="smooth-content">
        {children}
      </div>
    </div>
  );
}
