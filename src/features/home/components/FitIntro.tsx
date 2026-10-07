"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const fitCopy =
  "軽い、ズレにくい、驚きのかけ心地”がテーマのFREE FiT（フリーフィット）。男女問わずかけられる大きめサイズのオーバルタイプです。やわらかな形の玉型が自然に顔に馴染み、リム上部のカットで立体感と上質な印象を演出します。また、エッジの効いたテンプルがほどよく個性を表現し、横顔をすっきりと引き締めます。";

const fitTitle = "FREE FiT";
const artBase = 1440;
const boxTravel = 50;
const slideDist = 160;
const typeDur = 1.2;
const typeLag = 0.8;
/** ガラス塊 A 弱め / B 強め（px @1440） */
const glassShiftA = 50;
const glassShiftB = 180;

type GlassPiece = {
  left: string;
  top: string;
  w: string;
  h: string;
  tone: "light" | "mid";
};

const glassAPieces: GlassPiece[] = [
  { left: "0", top: "0", w: "8.611cqw", h: "13.889cqw", tone: "light" },
  { left: "4.306cqw", top: "4.444cqw", w: "8.611cqw", h: "13.889cqw", tone: "mid" },
  { left: "5.139cqw", top: "15.694cqw", w: "13.889cqw", h: "8.611cqw", tone: "light" },
  { left: "9.583cqw", top: "11.667cqw", w: "13.889cqw", h: "8.611cqw", tone: "mid" },
];

const glassBPieces: GlassPiece[] = [
  { left: "4.444cqw", top: "0", w: "13.889cqw", h: "8.611cqw", tone: "light" },
  { left: "0", top: "4.028cqw", w: "13.889cqw", h: "8.611cqw", tone: "mid" },
  { left: "16.389cqw", top: "3.056cqw", w: "8.611cqw", h: "13.889cqw", tone: "mid" },
  { left: "20.694cqw", top: "7.5cqw", w: "8.611cqw", h: "13.889cqw", tone: "light" },
];

function GlassCluster({
  pieces,
  className,
  sizeClass,
  parallax,
}: {
  pieces: GlassPiece[];
  className: string;
  sizeClass: string;
  parallax: "a" | "b";
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-10 ${className}`}
    >
      <div data-glass-parallax={parallax} className={`relative ${sizeClass}`}>
        {pieces.map((p) => (
          <div
            key={`${p.left}-${p.top}`}
            className={`absolute rounded-[1.736cqw] opacity-50 ${
              p.tone === "light"
                ? "bg-[rgba(217,217,217,0.2)]"
                : "bg-[rgba(173,173,173,0.2)]"
            }`}
            style={{
              left: p.left,
              top: p.top,
              width: p.w,
              height: p.h,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function FitIntro() {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const boxMoveRef = useRef<HTMLDivElement>(null);
  const boxFadeRef = useRef<HTMLDivElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      const title = titleRef.current;
      const caret = caretRef.current;
      const boxMove = boxMoveRef.current;
      const boxFade = boxFadeRef.current;
      if (!root || !title || !boxMove || !boxFade) {
        return;
      }

      const artScale = () => Math.min(root.clientWidth, artBase) / artBase;
      const glassA = root.querySelector<HTMLElement>("[data-glass-parallax='a']");
      const glassB = root.querySelector<HTMLElement>("[data-glass-parallax='b']");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        title.textContent = fitTitle;
        if (caret) gsap.set(caret, { autoAlpha: 0 });
        gsap.set([boxMove, boxFade, glassA, glassB].filter(Boolean), {
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

        // 上端 55%〜10% で箱が入る。戻すと逆に戻る。
        gsap.fromTo(
          boxFade,
          { x: () => slideDist * artScale(), opacity: 0 },
          {
            x: 0,
            opacity: 1,
            ease: "none",
            immediateRender: true,
            scrollTrigger: {
              trigger: root,
              start: "top 55%",
              end: "top 10%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );

        gsap.fromTo(
          boxMove,
          { y: () => boxTravel * artScale() },
          {
            y: () => -boxTravel * artScale(),
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

        const scrubY = (el: HTMLElement | null, shift: number) => {
          if (!el) return;
          gsap.fromTo(
            el,
            { y: 0 },
            {
              y: () => shift * artScale(),
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

        scrubY(glassA, glassShiftA);
        scrubY(glassB, glassShiftB);

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
      className="relative w-full overflow-hidden bg-[#070707]"
    >
      <div className="@container relative mx-auto h-[55.556cqw] w-full max-w-360">
        <GlassCluster
          pieces={glassAPieces}
          parallax="a"
          className="top-1/2 left-[5.556cqw] -translate-y-1/2"
          sizeClass="h-[24.306cqw] w-[23.472cqw]"
        />
        <GlassCluster
          pieces={glassBPieces}
          parallax="b"
          className="top-[2.083cqw] right-[5.556cqw]"
          sizeClass="h-[21.389cqw] w-[29.306cqw]"
        />
        <h2
          id="fit-intro-title"
          className="absolute top-[5cqw] left-[8.333cqw] z-30 cursor-default font-jp text-[6.667cqw] leading-none whitespace-nowrap text-white select-none"
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
          ref={boxMoveRef}
          className="absolute top-[34.722cqw] left-[55.417cqw] z-30 w-[36.25cqw]"
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
