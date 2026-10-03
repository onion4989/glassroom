"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const glassImg = {
  src: "/assets/pages/top/hero/glass_front-normal.png",
  width: 620,
  height: 173,
} as const;

export function StickyGlass() {
  const rootRef = useRef<HTMLDivElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const el = rootRef.current;
      const stack = el?.closest("[data-page-stack]");
      if (!el || !(stack instanceof HTMLElement)) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: el,
          endTrigger: stack,
          start: "center center",
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
        });
        return () => {
          st.kill();
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none relative z-20 mt-[30px] w-full max-w-[620px]"
    >
      <Image
        src={glassImg.src}
        alt="眼鏡の正面"
        width={glassImg.width}
        height={glassImg.height}
        sizes="(min-width: 1024px) 620px, 100vw"
        priority
        className="h-auto w-full"
      />
    </div>
  );
}
