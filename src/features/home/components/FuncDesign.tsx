"use client";

import Image from "next/image";
import { useRef } from "react";
import { glassFrontImg } from "@/features/home/components/StickyGlass";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const artBase = 1440;
const startGrow = 384;
const morphSec = 0.9;
const afterSec = 0.6;
const enterLag = 0.8;
const enterStart = "top 85%";
const leaveBackStart = "top 50%";
const risePx = 16;
const slidePx = 48;
const stickyFadeSec = 1;
const glassLag = 0.35;
const glassSec = 1.35;
const glassRestY = 50;
const stickyRise = 24;
const shrinkTo = 0.6;
const coverBlur = "blur(12px)";
const glowBg =
  "radial-gradient(ellipse 65% 75% at 52% 55%, #27547b 0%, #293f53 50%, #2b2b2b 100%)";

type FeatCard = {
  title: string;
  endGrow: number;
  face: string;
  pic?: string;
  glow?: boolean;
  glass?: boolean;
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
    glow: true,
    glass: true,
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
      const glass = art.querySelector<HTMLElement>("[data-glass]");
      // pin 要素ではなく内側。pin の transform と y アニメが衝突しない。
      const fade = document.querySelector<HTMLElement>("[data-sticky-fade]");
      if (!glow || !glass || cards.length !== featCards.length) return;

      const scale = () => Math.min(art.clientWidth, artBase) / artBase;
      const ends = featCards.map((card) => card.endGrow);
      const glassFrom = () => glassRestY + Math.max(glass.offsetHeight, 120) * 1.15;
      const showSticky = () => {
        if (fade) gsap.set(fade, { autoAlpha: 1, y: 0 });
      };
      const hideSticky = () => {
        if (fade) gsap.set(fade, { autoAlpha: 0, y: 0 });
      };
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(art, { scale: 1, filter: "none" });
        gsap.set(cards, { flexGrow: (i) => ends[i], y: 0 });
        gsap.set([...faces, glow, ...labels, ...pics], {
          autoAlpha: 1,
          x: 0,
          y: 0,
        });
        gsap.set(glass, { autoAlpha: 1, x: 0, y: glassRestY });
        ScrollTrigger.create({
          trigger: root,
          start: enterStart,
          end: "bottom top",
          onEnter: hideSticky,
          onEnterBack: hideSticky,
          onLeave: hideSticky,
        });
        ScrollTrigger.create({
          trigger: root,
          start: leaveBackStart,
          onLeaveBack: showSticky,
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let wait: gsap.core.Tween | null = null;
        let play: gsap.core.Timeline | null = null;

        const clearWait = () => {
          wait?.kill();
          wait = null;
        };

        const killPlay = () => {
          clearWait();
          play?.kill();
          play = null;
        };

        const resetCards = () => {
          killPlay();
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
          gsap.set(glass, {
            y: glassFrom,
            autoAlpha: 0,
          });
        };

        const buildPlay = () => {
          const tl = gsap.timeline();
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
          if (fade) {
            // 順方向: フェードアウトしながら下へ。逆再生でフェードアップになる。
            tl.to(
              fade,
              {
                autoAlpha: 0,
                y: stickyRise,
                duration: stickyFadeSec,
                ease: "power2.out",
              },
              0,
            );
          }
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
          tl.to(
            glass,
            {
              y: glassRestY,
              autoAlpha: 1,
              duration: glassSec,
              ease: "power2.out",
            },
            glassLag,
          );
          return tl;
        };

        const begin = (fromTop: boolean) => {
          clearWait();
          // 既存タイムラインがあれば殺さず順再生（逆スクロールの途中復帰）。
          if (play) {
            if (play.progress() === 0 && play.reversed()) {
              wait = gsap.delayedCall(enterLag, () => {
                play?.restart();
              });
              return;
            }
            play.reversed(false);
            return;
          }

          resetCards();
          if (fromTop) showSticky();
          else hideSticky();
          wait = gsap.delayedCall(enterLag, () => {
            play = buildPlay();
          });
        };

        const leaveBack = () => {
          clearWait();
          // 入場タイムラインを逆再生。kill＋作り直しだと瞬間表示になりやすい。
          if (play) {
            play.reversed(true);
            return;
          }
          // タイムラインが無いとき（下方向 leave 後など）は sticky だけフェードアップ。
          resetCards();
          if (!fade) return;
          gsap.set(fade, { autoAlpha: 0, y: stickyRise });
          play = gsap.timeline().to(fade, {
            autoAlpha: 1,
            y: 0,
            duration: stickyFadeSec,
            ease: "power2.out",
          });
        };

        resetCards();
        showSticky();
        // 順方向: 従来どおり。逆方向の leaveBack は別 ST で早めに発火。
        ScrollTrigger.create({
          trigger: root,
          start: enterStart,
          end: "bottom top",
          onEnter: () => begin(true),
          onEnterBack: () => begin(false),
          onLeave: () => {
            resetCards();
            hideSticky();
          },
        });
        ScrollTrigger.create({
          trigger: root,
          start: leaveBackStart,
          onLeaveBack: leaveBack,
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
                start: "top 70%",
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
          killPlay();
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
      className="relative z-10 w-full bg-[#070707]"
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
              {card.glass ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div
                    data-glass
                    aria-hidden
                    className="w-155 shrink-0 motion-safe:opacity-0"
                  >
                    <Image
                      src={glassFrontImg.src}
                      alt=""
                      width={glassFrontImg.width}
                      height={glassFrontImg.height}
                      sizes="620px"
                      className="h-auto w-full"
                    />
                  </div>
                </div>
              ) : (
                <div
                  data-pic
                  aria-hidden
                  className={`absolute z-10 bg-[#3a3a3a] motion-safe:opacity-0 ${card.pic}`}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
