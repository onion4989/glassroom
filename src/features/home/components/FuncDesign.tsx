"use client";

import Image from "next/image";
import { useRef } from "react";
import { glassFrontImg } from "@/features/home/components/StickyGlass";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const artBase = 1440;
const morphSec = 0.65;
const enterLag = 0.8;
const enterStart = "top 60%";
const leaveBackStart = "top 50%";
const risePx = 20;
const glassLag = 0.35;
const glassSec = 1.35;
const glassRestY = 50;
const rowCqw = 25;
const designDir = "/assets/pages/top/design";
const glowBg =
  "radial-gradient(ellipse 65% 75% at 52% 55%, #27547b 0%, #293f53 50%, #2b2b2b 100%)";

/** 1440 基準の散らばり初期サイズ（左上 / 中央 / 右下） */
const startBoxes = [
  { w: 180, h: 230, x: "left" as const, y: "top" as const },
  { w: 320, h: 200, x: "center" as const, y: "center" as const },
  { w: 150, h: 180, x: "right" as const, y: "bottom" as const },
];

type FeatCard = {
  title: string;
  endGrow: number;
  face: string;
  pic?: string;
  src?: string;
  picW?: number;
  picH?: number;
  glow?: boolean;
  glass?: boolean;
};

type BoxRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const featCards: FeatCard[] = [
  {
    title: "高耐久ヒンジ",
    endGrow: 282,
    face: "bg-[#2f2f2f]",
    pic: "top-[9.306cqw] right-0 left-0 h-[12.083cqw]",
    src: `${designDir}/img_hinji.png`,
    picW: 423,
    picH: 261,
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
    pic: "top-[9.097cqw] left-0 h-[12.5cqw] w-[16.667cqw] rounded-b-[25px]",
    src: `${designDir}/img_edge.png`,
    picW: 423,
    picH: 318,
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

      const list = art.querySelector<HTMLElement>("[data-list]");
      const cards = [...art.querySelectorAll<HTMLElement>("[data-card]")];
      const faces = [...art.querySelectorAll<HTMLElement>("[data-face]")];
      const glow = art.querySelector<HTMLElement>("[data-glow]");
      const labels = [...art.querySelectorAll<HTMLElement>("[data-label]")];
      const pics = [...art.querySelectorAll<HTMLElement>("[data-pic]")];
      const glass = art.querySelector<HTMLElement>("[data-glass]");
      if (!list || !glow || !glass || cards.length !== featCards.length) return;

      const ends = featCards.map((card) => card.endGrow);
      const artScale = () => art.clientWidth / artBase;
      const rowH = () => (rowCqw / 100) * art.clientWidth;
      const glassFrom = () => glassRestY + Math.max(glass.offsetHeight, 120) * 1.15;

      const clearCardPos = () => {
        gsap.set(list, { clearProps: "height" });
        gsap.set(cards, {
          clearProps: "position,left,top,width,height,x,y,margin",
          flexGrow: (i: number) => ends[i],
        });
      };

      const measureEnds = (): BoxRect[] => {
        clearCardPos();
        void list.offsetHeight;
        const listBox = list.getBoundingClientRect();
        return cards.map((card) => {
          const box = card.getBoundingClientRect();
          return {
            left: box.left - listBox.left,
            top: box.top - listBox.top,
            width: box.width,
            height: box.height,
          };
        });
      };

      const startRects = (): BoxRect[] => {
        const listW = list.clientWidth;
        const listH = rowH();
        const k = artScale();
        return startBoxes.map((box) => {
          const width = box.w * k;
          const height = box.h * k;
          const left =
            box.x === "left"
              ? 0
              : box.x === "right"
                ? listW - width
                : (listW - width) / 2;
          const top =
            box.y === "top"
              ? 0
              : box.y === "bottom"
                ? listH - height
                : (listH - height) / 2;
          return { left, top, width, height };
        });
      };

      const placeCards = (rects: BoxRect[]) => {
        gsap.set(list, { height: rowH(), position: "relative" });
        cards.forEach((card, i) => {
          const box = rects[i];
          gsap.set(card, {
            position: "absolute",
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            flexGrow: 0,
            x: 0,
            y: 0,
            margin: 0,
          });
        });
      };

      const showFaces = () => {
        gsap.set([...faces, glow, ...labels, ...pics], {
          autoAlpha: 1,
          x: 0,
          y: 0,
        });
      };

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        clearCardPos();
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        showFaces();
        gsap.set(glass, { autoAlpha: 1, x: 0, y: glassRestY });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let wait: gsap.core.Tween | null = null;
        let play: gsap.core.Timeline | null = null;
        let endRects: BoxRect[] = [];

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
          endRects = measureEnds();
          placeCards(startRects());
          gsap.set(cards, {
            autoAlpha: 0,
            y: () => risePx * artScale(),
          });
          showFaces();
          gsap.set(glass, {
            y: glassFrom,
            autoAlpha: 0,
          });
        };

        const buildPlay = () => {
          const tl = gsap.timeline();
          cards.forEach((card, i) => {
            const box = endRects[i];
            tl.to(
              card,
              {
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
                autoAlpha: 1,
                y: 0,
                duration: morphSec,
                ease: "power2.out",
              },
              0,
            );
          });
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

        const begin = () => {
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
          resetCards();
        };

        resetCards();
        // 順方向: 従来どおり。逆方向の leaveBack は別 ST で早めに発火。
        ScrollTrigger.create({
          trigger: root,
          start: enterStart,
          end: "bottom top",
          onEnter: begin,
          onEnterBack: begin,
          onLeave: () => {
            resetCards();
          },
        });
        ScrollTrigger.create({
          trigger: root,
          start: leaveBackStart,
          onLeaveBack: leaveBack,
        });

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
      className="relative w-full pt-25"
    >
      {/* sticky 眼鏡より下。コンテンツは z-60 で眼鏡の上 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-[#070707]"
      />
      <div ref={artRef} className="@container relative z-60 mx-auto w-full max-w-360">
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
        <ul
          data-list
          className="relative mt-[6.667cqw] flex list-none gap-[1.667cqw] px-[8.333cqw]"
        >
          {featCards.map((card) => (
            <li
              key={card.title}
              data-card
              className="relative h-[25cqw] min-w-0 basis-0 overflow-hidden rounded-[25px]"
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
              ) : card.src && card.pic && card.picW && card.picH ? (
                <div
                  data-pic
                  aria-hidden
                  className={`absolute z-10 overflow-hidden motion-safe:opacity-0 ${card.pic}`}
                >
                  <Image
                    src={card.src}
                    alt=""
                    width={card.picW}
                    height={card.picH}
                    sizes="282px"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
