"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const artBase = 1440;
const startGrow = 384;
const morphSec = 0.9;
const afterSec = 0.6;
const enterLag = 0.8;
const risePx = 16;
const slidePx = 48;
const shrinkTo = 0.6;
const coverBlur = "blur(12px)";
const glowBg =
  "radial-gradient(ellipse 65% 75% at 52% 55%, #27547b 0%, #293f53 50%, #2b2b2b 100%)";

type FeatCard = {
  title: string;
  endGrow: number;
  face: string;
  pic: string;
  glow?: boolean;
};

const featCards: FeatCard[] = [
  {
    title: "高耐久ヒンジ",
    endGrow: 282,
    face: "bg-[#2f2f2f]",
    pic: "top-[9.306cqw] right-0 left-0 h-[12.083cqw] rounded-[1.042cqw]",
  },
  {
    title: "滑らかなオーバルフレーム",
    endGrow: 588,
    face: "bg-[#2f2f2f]",
    pic: "right-0 bottom-0 left-0 h-[14.444cqw] rounded-[1.042cqw]",
    glow: true,
  },
  {
    title: "フィットするエッジ",
    endGrow: 282,
    face: "bg-[#2d2d2d]",
    pic: "top-[9.097cqw] left-0 h-[12.5cqw] w-[16.667cqw] rounded-b-[1.042cqw]",
  },
];

export function FuncDesign() {
  const rootRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      const art = artRef.current;
      if (!root || !art) return;

      const cards = [...art.querySelectorAll<HTMLElement>("[data-card]")];
      const faces = [...art.querySelectorAll<HTMLElement>("[data-face]")];
      const glow = art.querySelector<HTMLElement>("[data-glow]");
      const labels = [...art.querySelectorAll<HTMLElement>("[data-label]")];
      const pics = [...art.querySelectorAll<HTMLElement>("[data-pic]")];
      if (!glow || cards.length !== featCards.length) return;

      const scale = () => Math.min(art.clientWidth, artBase) / artBase;
      const ends = featCards.map((card) => card.endGrow);
      const show = [...faces, glow, ...labels, ...pics];
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(art, { scale: 1, filter: "none" });
        gsap.set(cards, { flexGrow: (i) => ends[i], y: 0 });
        gsap.set(show, { autoAlpha: 1, x: 0, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let wait: gsap.core.Tween | null = null;
        let play: gsap.core.Timeline | null = null;

        const stop = () => {
          wait?.kill();
          play?.kill();
          wait = null;
          play = null;
        };

        const reset = () => {
          stop();
          gsap.set(cards, {
            flexGrow: startGrow,
            y: () => risePx * scale(),
          });
          gsap.set(faces, { autoAlpha: 0 });
          gsap.set(glow, { autoAlpha: 0 });
          gsap.set(labels, {
            x: () => -slidePx * scale(),
            autoAlpha: 0,
          });
          gsap.set(pics, {
            y: () => risePx * scale(),
            autoAlpha: 0,
          });
        };

        const begin = () => {
          reset();
          wait = gsap.delayedCall(enterLag, () => {
            const tl = gsap.timeline();
            play = tl;
            cards.forEach((card, i) => {
              tl.to(
                card,
                {
                  y: 0,
                  flexGrow: ends[i],
                  duration: morphSec,
                  ease: "power2.inOut",
                },
                0,
              );
            });
            tl.to(
              faces,
              { autoAlpha: 1, duration: morphSec, ease: "power2.inOut" },
              0,
            );
            tl.to(
              glow,
              { autoAlpha: 1, duration: morphSec, ease: "power2.inOut" },
              0,
            );
            tl.to(
              labels,
              { x: 0, autoAlpha: 1, duration: afterSec, ease: "power2.out" },
              morphSec,
            );
            tl.to(
              pics,
              { y: 0, autoAlpha: 1, duration: afterSec, ease: "power2.out" },
              morphSec,
            );
          });
        };

        reset();
        ScrollTrigger.create({
          trigger: root,
          start: "top 85%",
          end: "bottom top",
          onEnter: begin,
          onEnterBack: begin,
          onLeave: reset,
          onLeaveBack: reset,
        });

        // Limited の出入りと同じ区間で、中身全体をスクロールに追従して縮める。
        const limited = document.querySelector<HTMLElement>("[data-limited]");
        if (limited) {
          gsap.fromTo(
            art,
            { scale: 1, transformOrigin: "center center" },
            {
              scale: shrinkTo,
              ease: "none",
              scrollTrigger: {
                trigger: limited,
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            },
          );
          gsap.fromTo(
            art,
            { filter: "blur(0px)" },
            {
              filter: coverBlur,
              ease: "none",
              scrollTrigger: {
                trigger: limited,
                start: "top 50%",
                end: "top top",
                scrub: true,
              },
            },
          );
        }

        return () => {
          stop();
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-func-design
      aria-labelledby="func-design-title"
      className="relative z-10 w-full bg-black"
    >
      <div ref={artRef} className="@container mx-auto w-full max-w-360">
        <h2
          id="func-design-title"
          className="flex cursor-default items-baseline justify-center font-jp text-[4.444cqw] leading-[1.2] text-white select-none"
        >
          <span>機能性</span>
          <span className="ml-[1.597cqw]">×</span>
          <span className="ml-[1.319cqw]">デザイン</span>
        </h2>
        <p className="mt-[0.972cqw] cursor-default text-center font-jp text-[1.667cqw] leading-[1.2] text-white select-none">
          機能性とデザイン、掛け心地を重視した設計
        </p>
        <ul className="mt-[6.667cqw] flex list-none gap-[1.667cqw] px-[8.333cqw]">
          {featCards.map((card) => (
            <li
              key={card.title}
              data-card
              className="relative h-[25cqw] min-w-0 basis-0 overflow-hidden rounded-[1.042cqw]"
              style={{ flexGrow: card.endGrow }}
            >
              <div
                data-face
                className={`absolute inset-0 motion-safe:opacity-0 ${card.face}`}
              />
              {card.glow ? (
                <div
                  data-glow
                  className="absolute inset-0 motion-safe:opacity-0"
                  style={{ backgroundImage: glowBg }}
                />
              ) : null}
              <p
                data-label
                className="absolute top-[1.319cqw] left-[0.972cqw] z-10 cursor-default font-jp text-[1.667cqw] leading-[1.2] whitespace-nowrap text-white select-none motion-safe:opacity-0"
              >
                {card.title}
              </p>
              <div
                data-pic
                aria-hidden
                className={`absolute z-10 bg-[#3a3a3a] motion-safe:opacity-0 ${card.pic}`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
