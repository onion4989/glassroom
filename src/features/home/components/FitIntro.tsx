"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const fitCopy =
  "軽い、ズレにくい、驚きのかけ心地”がテーマのFREE FiT（フリーフィット）。男女問わずかけられる大きめサイズのオーバルタイプです。やわらかな形の玉型が自然に顔に馴染み、リム上部のカットで立体感と上質な印象を演出します。また、エッジの効いたテンプルがほどよく個性を表現し、横顔をすっきりと引き締めます。";

const fitTitle = "FREE FiT";
const artBase = 1440;
const glassTravel = 140;
const boxTravel = 50;
const slideDist = 80;
const typeDur = 1.2;
const typeLag = 0.8;

const glassImg = {
  src: "/assets/pages/top/intro/glass_free-fit.png",
  width: 1089,
  height: 510,
} as const;

export function FitIntro() {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const glassMoveRef = useRef<HTMLDivElement>(null);
  const glassFadeRef = useRef<HTMLDivElement>(null);
  const boxMoveRef = useRef<HTMLDivElement>(null);
  const boxFadeRef = useRef<HTMLDivElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      const title = titleRef.current;
      const caret = caretRef.current;
      const glassMove = glassMoveRef.current;
      const glassFade = glassFadeRef.current;
      const boxMove = boxMoveRef.current;
      const boxFade = boxFadeRef.current;
      if (!root || !title || !glassMove || !glassFade || !boxMove || !boxFade) {
        return;
      }

      const artScale = () => Math.min(root.clientWidth, artBase) / artBase;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        title.textContent = fitTitle;
        if (caret) gsap.set(caret, { autoAlpha: 0 });
        gsap.set([glassMove, glassFade, boxMove, boxFade], {
          clearProps: "transform,opacity,translate",
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const blink = caret
          ? gsap.fromTo(
              caret,
              { opacity: 1 },
              {
                opacity: 0,
                duration: 0.45,
                repeat: -1,
                yoyo: true,
                ease: "steps(1)",
                paused: true,
                immediateRender: false,
              },
            )
          : null;

        gsap.to(title, {
          duration: typeDur,
          delay: typeLag,
          text: { value: fitTitle, delimiter: "" },
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top 75%",
            once: true,
          },
          onStart: () => {
            blink?.restart();
          },
        });

        // 横スライドと視差は別ノード。x と y を取り合わない。
        // 上端 75%〜50% で眼鏡、50%〜30% で箱。戻すと逆に戻る。
        const enter = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top 75%",
            end: "top 30%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        enter.fromTo(
          glassFade,
          { x: () => -slideDist * artScale(), opacity: 0 },
          { x: 0, opacity: 1, duration: 25, immediateRender: true },
          0,
        );
        enter.fromTo(
          boxFade,
          { x: () => slideDist * artScale(), opacity: 0 },
          { x: 0, opacity: 1, duration: 20, immediateRender: true },
          25,
        );

        const drift = (el: HTMLDivElement, travel: number) => {
          gsap.fromTo(
            el,
            { y: () => travel * artScale() },
            {
              y: () => -travel * artScale(),
              ease: "none",
              immediateRender: true,
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        };
        drift(glassMove, glassTravel);
        drift(boxMove, boxTravel);

        return () => {
          blink?.kill();
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-fit-intro
      aria-labelledby="fit-intro-title"
      className="relative z-10 w-full overflow-hidden bg-black"
    >
      <div className="@container relative mx-auto h-[55.556cqw] w-full max-w-360">
        <h2
          id="fit-intro-title"
          className="absolute top-[5cqw] left-[8.333cqw] cursor-default font-jp text-[6.667cqw] leading-none whitespace-nowrap text-white select-none"
        >
          <span className="sr-only">{fitTitle}</span>
          <span ref={titleRef} aria-hidden="true" />
          <span
            ref={caretRef}
            aria-hidden
            className="ml-[0.08em] inline-block h-[0.85em] w-[0.045em] translate-y-[0.08em] bg-white opacity-0"
          />
        </h2>
        <div
          ref={glassMoveRef}
          className="absolute top-[19.444cqw] left-[23.403cqw] w-[50.417cqw]"
        >
          <div ref={glassFadeRef} className="motion-safe:opacity-0">
            <Image
              src={glassImg.src}
              alt="紫のオーバル型フレームの眼鏡"
              width={glassImg.width}
              height={glassImg.height}
              sizes="(min-width: 1440px) 726px, 50vw"
              className="h-[23.611cqw] w-full object-contain"
            />
          </div>
        </div>
        <div
          ref={boxMoveRef}
          className="absolute top-[34.722cqw] left-[55.417cqw] z-10 w-[36.25cqw]"
        >
          <div
            ref={boxFadeRef}
            className="h-[20.556cqw] rounded-[1.042cqw] bg-black/40 px-[1.25cqw] pt-[1.389cqw] backdrop-blur-md motion-safe:opacity-0"
          >
            <p className="font-jp text-[1.389cqw] leading-[1.75] tracking-[0.1em] text-white">
              {fitCopy}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
