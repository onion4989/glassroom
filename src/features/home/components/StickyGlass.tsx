"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export const glassFrontImg = {
  src: "/assets/pages/top/hero/glass_front-normal.png",
  width: 620,
  height: 173,
} as const;

const coverBlur = "blur(12px)";

export function StickyGlass() {
  const rootRef = useRef<HTMLDivElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const el = rootRef.current;
      const stack = el?.closest("[data-page-stack]");
      if (!el || !(stack instanceof HTMLElement)) return;

      const fade = el.querySelector<HTMLElement>("[data-sticky-fade]");
      const feature = stack.querySelector<HTMLElement>("[data-feature]");
      const funcDesign = stack.querySelector<HTMLElement>("[data-func-design]");

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

        let blurTl: gsap.core.Timeline | null = null;
        if (fade && feature && funcDesign) {
          gsap.set(fade, { filter: "blur(0px)" });
          // 1本の scrub。区間前は progress 0＝ブラーなし（逆スクロールで HERO に戻っても解除）
          blurTl = gsap
            .timeline({
              scrollTrigger: {
                trigger: feature,
                endTrigger: funcDesign,
                start: "top 70%",
                end: "bottom top",
                scrub: true,
              },
            })
            .fromTo(
              fade,
              { filter: "blur(0px)" },
              { filter: coverBlur, duration: 1, ease: "none" },
            )
            // filter を再 tween しない（同じ blur 値の再適用で一瞬 0 に戻るのを防ぐ）
            .to({}, { duration: 6 })
            .to(fade, { filter: "blur(0px)", duration: 1, ease: "none" });
        }

        return () => {
          blurTl?.scrollTrigger?.kill();
          blurTl?.kill();
          st.kill();
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none relative z-30 mt-[30px] w-full max-w-[620px]"
    >
      {/* pin 本体と分離し、フェード／移動が pin の transform と干渉しないようにする */}
      <div data-sticky-fade className="w-full">
        <Image
          src={glassFrontImg.src}
          alt="眼鏡の正面"
          width={glassFrontImg.width}
          height={glassFrontImg.height}
          sizes="(min-width: 1024px) 620px, 100vw"
          priority
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
