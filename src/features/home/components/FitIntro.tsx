"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const fitCopy =
  "軽い、ズレにくい、驚きのかけ心地”がテーマのFREE FiT（フリーフィット）。男女問わずかけられる大きめサイズのオーバルタイプです。やわらかな形の玉型が自然に顔に馴染み、リム上部のカットで立体感と上質な印象を演出します。また、エッジの効いたテンプルがほどよく個性を表現し、横顔をすっきりと引き締めます。";

const fitCopySp =
  "軽い、ズレにくい、驚きのかけ心地”がテーマのFREE FiT（フリーフィット）。サイズ・フレーム・カラーともに眼鏡市場No.1のラインアップを誇り、多くのお客様に支持されるブランドから、シートメタルフロントタイプが登場しました。FFT-097は、男女問わずかけられる大きめサイズのオーバルタイプです。やわらかな形の玉型が自然に顔に馴染み、リム上部のカットで立体感と上質な印象を演出します。また、エッジの効いたテンプルがほどよく個性を表現し、横顔をすっきりと引き締めます。";

type IntroOrb = {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: "light" | "mid";
};

const introOrbs: IntroOrb[] = [
  { x: 0, y: 23, w: 51, h: 81, tone: "light" },
  { x: 25, y: 49, w: 51, h: 81, tone: "mid" },
  { x: 30, y: 115, w: 82, h: 50, tone: "light" },
  { x: 56, y: 91, w: 82, h: 50, tone: "mid" },
];

/** 右側の塊。左へ 180 度回して右上に置く（元座標から 202 を引く） */
const introOrbsR: IntroOrb[] = [
  { x: 0, y: 0, w: 43, h: 70, tone: "light" },
  { x: 22, y: 22, w: 43, h: 70, tone: "mid" },
  { x: 55, y: 65, w: 70, h: 43, tone: "light" },
  { x: 78, y: 44, w: 70, h: 43, tone: "mid" },
];

const fitTitle = "FREE FiT";
const artBase = 1440;
const boxTravel = 50;
const slideDist = 160;
const typeDur = 1.2;
const typeLag = 0.8;
/** ガラス塊 A 弱め / B 強め（px @1440） */
const glassShiftA = 50;
const glassShiftB = 180;
/** モバイルのテキスト箱。弱 50 と強 180 の中間 */
const boxShiftSp = 110;

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

      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
        title.textContent = fitTitle;
        if (caret) gsap.set(caret, { autoAlpha: 0 });
        gsap.set([boxMove, boxFade, glassA, glassB].filter(Boolean), {
          clearProps: "transform,opacity,translate",
        });
      });

      const scrubIntroArt = () => {
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
      };

      // Tablet: タイトル常時表示。吸着なし（Sticky は通過のみ）。
      mm.add(
        "(min-width: 768px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          title.textContent = fitTitle;
          if (caret) gsap.set(caret, { autoAlpha: 0 });
          scrubIntroArt();
        },
      );

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
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

        scrubIntroArt();

        return () => {
          blink?.kill();
        };
      });

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        const box = root.querySelector<HTMLElement>("[data-sp-box]");
        if (!box) return;
        const shift = gsap.fromTo(
          box,
          { y: boxShiftSp / 2 },
          {
            y: -boxShiftSp / 2,
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
        return () => {
          shift.scrollTrigger?.kill();
          shift.kill();
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-fit-intro
      aria-label={fitTitle}
      className="relative w-full overflow-hidden bg-[#070707]"
    >
      <div className="relative flex flex-col gap-[15px] px-5 pt-[27px] pb-[45px] md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute top-12 right-5 z-10 h-[108px] w-[148px] origin-center -rotate-180"
        >
          {introOrbsR.map((orb) => (
            <div
              key={`r-${orb.x}-${orb.y}`}
              className={`absolute rounded-[10px] opacity-50 ${
                orb.tone === "light"
                  ? "bg-[rgba(217,217,217,0.2)]"
                  : "bg-[rgba(173,173,173,0.2)]"
              }`}
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.w,
                height: orb.h,
              }}
            />
          ))}
        </div>
        <h2 className="font-jp text-[32px] leading-none text-white">
          {fitTitle}
        </h2>
        <div className="relative h-[165px] w-full">
          {introOrbs.map((orb) => (
            <div
              key={`${orb.x}-${orb.y}`}
              aria-hidden
              className={`absolute rounded-[10px] opacity-50 ${
                orb.tone === "light"
                  ? "bg-[rgba(217,217,217,0.2)]"
                  : "bg-[rgba(173,173,173,0.2)]"
              }`}
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.w,
                height: orb.h,
              }}
            />
          ))}
        </div>
        <div
          data-sp-box
          className="relative z-30 h-[300px] rounded-[15px] bg-black/40 px-[13px] pt-3"
        >
          <p className="font-jp text-[14px] leading-[25px] tracking-[0.1em] text-white">
            {fitCopySp}
          </p>
        </div>
      </div>
      <div className="hidden md:block">
      {/* Tablet: 固定寸法（Figma 768）。Desktop: cqw @1440 */}
      <div className="@container relative mx-auto h-[700px] w-full max-w-360 px-8 pt-[100px] lg:h-[55.556cqw] lg:px-0 lg:pt-0">
        <GlassCluster
          pieces={glassAPieces}
          parallax="a"
          className="top-[270px] left-8 lg:top-1/2 lg:left-[5.556cqw] lg:-translate-y-1/2"
          sizeClass="h-[224px] w-[217px] lg:h-[24.306cqw] lg:w-[23.472cqw]"
        />
        <GlassCluster
          pieces={glassBPieces}
          parallax="b"
          className="top-[100px] right-0 lg:top-[2.083cqw] lg:right-[5.556cqw]"
          sizeClass="h-[197px] w-[271px] lg:h-[21.389cqw] lg:w-[29.306cqw]"
        />
        <h2
          id="fit-intro-title"
          className="absolute top-[100px] left-8 z-40 cursor-default font-jp text-[48px] leading-none whitespace-nowrap text-white select-none lg:top-[5cqw] lg:left-[8.333cqw] lg:text-[6.667cqw]"
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
          className="absolute top-[375px] left-[305px] z-30 w-[431px] lg:top-[34.722cqw] lg:left-[55.417cqw] lg:w-[36.25cqw]"
        >
          <div
            ref={boxFadeRef}
            className="h-[206px] rounded-[15px] bg-black/40 px-[17px] pt-[17px] backdrop-blur-md md:motion-safe:opacity-0 lg:h-[20.556cqw] lg:rounded-[1.042cqw] lg:px-[1.25cqw] lg:pt-[1.389cqw]"
          >
            <p className="font-jp text-[16px] leading-[25px] tracking-[0.1em] text-white lg:text-[1.389cqw] lg:leading-[1.75]">
              {fitCopy}
            </p>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
