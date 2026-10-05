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
const endScale = 358 / glassFrontImg.width;

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
      const model = stack.querySelector<HTMLElement>("[data-model]");
      const normal = stack.querySelector<HTMLElement>("[data-model-normal]");
      const normalImg = stack.querySelector<HTMLElement>(
        "[data-model-normal-img]",
      );

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!fade) return;

        // Model（ノーマル枠）で sticky 終了。Detail には到達しない。
        const endTrigger = normal ?? model ?? stack;
        const st = ScrollTrigger.create({
          trigger: el,
          endTrigger,
          start: "center center",
          end: normal ? "center center" : "bottom bottom",
          pin: true,
          pinSpacing: false,
          onLeave: () => {
            if (!normalImg) return;
            gsap.set(fade, { autoAlpha: 0 });
            gsap.set(normalImg, { autoAlpha: 1 });
          },
          onEnterBack: () => {
            if (!normalImg) return;
            gsap.set(fade, { autoAlpha: 1 });
            gsap.set(normalImg, { autoAlpha: 0 });
          },
        });

        let blurTl: gsap.core.Timeline | null = null;
        if (feature && model) {
          gsap.set(fade, { filter: "blur(0px)" });
          // Feature 入場でボケ → Model 入場で解除
          blurTl = gsap
            .timeline({
              scrollTrigger: {
                trigger: feature,
                endTrigger: model,
                start: "top 70%",
                end: "top 55%",
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
        } else if (feature) {
          const funcDesign = stack.querySelector<HTMLElement>(
            "[data-func-design]",
          );
          if (funcDesign) {
            gsap.set(fade, { filter: "blur(0px)" });
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
              .to({}, { duration: 6 })
              .to(fade, { filter: "blur(0px)", duration: 1, ease: "none" });
          }
        }

        let scaleTl: gsap.core.Tween | null = null;
        if (model && normal) {
          gsap.set(fade, { transformOrigin: "center center", scale: 1 });
          scaleTl = gsap.fromTo(
            fade,
            { scale: 1 },
            {
              scale: endScale,
              ease: "none",
              scrollTrigger: {
                trigger: model,
                start: "top 85%",
                endTrigger: normal,
                end: "center center",
                scrub: true,
              },
            },
          );
        }

        return () => {
          blurTl?.scrollTrigger?.kill();
          blurTl?.kill();
          scaleTl?.scrollTrigger?.kill();
          scaleTl?.kill();
          st.kill();
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (!fade) return;
        gsap.set(fade, { filter: "none", scale: 1, autoAlpha: 1 });
        if (normalImg) gsap.set(normalImg, { autoAlpha: 1 });
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
