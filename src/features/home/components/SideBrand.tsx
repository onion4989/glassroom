"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const fadeMax = 0.2;
const enterShift = 24;
const enterSec = 0.8;

export function SideBrand() {
  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(() => {
    const word = document.querySelector<HTMLElement>("[data-side-brand]");
    const title = document.querySelector<HTMLElement>("[data-hero-title]");
    if (!word || !title) return;

    const mm = gsap.matchMedia();

    const arm = (motion: boolean) => {
      gsap.set(word, { autoAlpha: 0, y: motion ? enterShift : 0 });

      const show = () => {
        if (!motion) {
          gsap.set(word, { autoAlpha: fadeMax, y: 0 });
          return;
        }
        gsap.to(word, {
          autoAlpha: fadeMax,
          y: 0,
          duration: enterSec,
          ease: "power2.out",
          overwrite: "auto",
        });
      };
      const hide = () => {
        if (!motion) {
          gsap.set(word, { autoAlpha: 0, y: 0 });
          return;
        }
        gsap.to(word, {
          autoAlpha: 0,
          y: enterShift,
          duration: enterSec,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const mark = ScrollTrigger.create({
        trigger: title,
        start: "bottom top",
        end: "max",
        onEnter: show,
        onLeaveBack: hide,
      });
      if (mark.progress > 0) gsap.set(word, { autoAlpha: fadeMax, y: 0 });
    };

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      arm(true);
    });
    mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
      arm(false);
    });

    return () => {
      mm.revert();
    };
  });

  return (
    <p
      data-side-brand
      aria-hidden="true"
      className="pointer-events-none fixed top-[60px] right-4 z-[70] hidden font-brand text-[64px] leading-none tracking-[0.3em] whitespace-nowrap text-white opacity-0 [writing-mode:vertical-rl] md:block min-[1440px]:text-[96px]"
    >
      GLASS ROOM
    </p>
  );
}
