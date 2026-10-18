"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  funcDockEvent,
  glassFrontImg,
} from "@/features/home/components/StickyGlass";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const artBase = 1440;
const morphSec = 0.65;
/** 左→中央→右の拡大開始ずれ */
const morphStep = 0.12;
const enterLag = 0;
/** 中央 box 吸着より前にカード整列を終わらせる */
const enterStart = "top 45%";
const leaveBackStart = "top 30%";
/** leaveBack 抑制: dock 中心が画面内にあるあいだはカードを消さない */
const dockKeepTop = 0.05;
const dockKeepBot = 1;
const risePx = 20;
/** StickyGlass の dockRestY と揃える */
const glassRestY = 50;
/** 箱内眼鏡のフェードアップ */
const glassDur = 0.45;
const glassFrom = 36;
/** 吸着後のラベル／画像入場 */
const labelDur = 0.35;
const picDur = 0.4;
const detailStep = 0.2;
const labelFromX = 28;
const picFromY = 36;
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
      if (
        !list ||
        !glow ||
        !glass ||
        cards.length !== featCards.length ||
        labels.length !== 3 ||
        pics.length !== 2
      ) {
        return;
      }

      // DOM 順: 左ラベル / 中央ラベル / 右ラベル、左画像 / 右画像
      const labelL = labels[0];
      const labelC = labels[1];
      const labelR = labels[2];
      const picL = pics[0];
      const picR = pics[1];

      const ends = featCards.map((card) => card.endGrow);
      const artScale = () => art.clientWidth / artBase;
      const rowH = () => (rowCqw / 100) * art.clientWidth;

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
        gsap.set([...faces, glow], { autoAlpha: 1, x: 0, y: 0 });
      };

      const showDetails = () => {
        gsap.set(labels, { autoAlpha: 1, x: 0, y: 0 });
        gsap.set(pics, { autoAlpha: 1, x: 0, y: 0 });
      };

      const hideDetails = () => {
        const lx = -labelFromX * artScale();
        const py = picFromY * artScale();
        gsap.set(labels, { autoAlpha: 0, x: lx, y: 0 });
        gsap.set(pics, { autoAlpha: 0, x: 0, y: py });
      };

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
        clearCardPos();
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        showFaces();
        showDetails();
        // 眼鏡の表示は StickyGlass の吸着が担う。ここは静止位置だけ揃える。
        gsap.set(glass, { autoAlpha: 1, x: 0, y: glassRestY, scale: 1 });
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        let wait: gsap.core.Tween | null = null;
        let play: gsap.core.Timeline | null = null;
        let detail: gsap.core.Timeline | null = null;
        /** 一度入場したら section 退出までタイトル／画像は消さない */
        let detailsShown = false;
        /** 一度出したら、セクションを上へ抜けるまで消さない */
        let glassShown = false;
        let glassTw: gsap.core.Tween | null = null;
        let endRects: BoxRect[] = [];
        const dockEl = root.querySelector<HTMLElement>("[data-func-dock]");

        const clearWait = () => {
          wait?.kill();
          wait = null;
        };

        const killDetail = () => {
          detail?.kill();
          detail = null;
        };

        const keepDetails = () => {
          if (detailsShown) showDetails();
        };

        const resetDetails = () => {
          detailsShown = false;
          killDetail();
          hideDetails();
        };

        const resetCards = () => {
          clearWait();
          play?.kill();
          play = null;
          resetDetails();
          endRects = measureEnds();
          placeCards(startRects());
          gsap.set(cards, {
            autoAlpha: 0,
            y: () => risePx * artScale(),
          });
          showFaces();
          gsap.set(glass, {
            x: 0,
            scale: 1,
            y: glassShown ? glassRestY : glassRestY + glassFrom * artScale(),
            autoAlpha: glassShown ? 1 : 0,
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
              i * morphStep,
            );
          });
          tl.eventCallback("onComplete", keepDetails);
          return tl;
        };

        const buildDetail = () => {
          const lx = -labelFromX * artScale();
          const py = picFromY * artScale();
          gsap.set([labelC, labelL, labelR], { autoAlpha: 0, x: lx, y: 0 });
          gsap.set([picR, picL], { autoAlpha: 0, x: 0, y: py });
          // 吸着後: 中央ラベル → 右画像 → 左ラベル → 左画像 → 右ラベル
          return gsap
            .timeline()
            .to(
              labelC,
              { autoAlpha: 1, x: 0, duration: labelDur, ease: "power2.out" },
              0,
            )
            .to(
              picR,
              { autoAlpha: 1, y: 0, duration: picDur, ease: "power2.out" },
              detailStep,
            )
            .to(
              labelL,
              { autoAlpha: 1, x: 0, duration: labelDur, ease: "power2.out" },
              detailStep * 2,
            )
            .to(
              picL,
              { autoAlpha: 1, y: 0, duration: picDur, ease: "power2.out" },
              detailStep * 3,
            )
            .to(
              labelR,
              { autoAlpha: 1, x: 0, duration: labelDur, ease: "power2.out" },
              detailStep * 4,
            );
        };

        const beginDetail = () => {
          // 一度出したら最終表示のまま（上スクロールで消さない）
          if (detailsShown) {
            showDetails();
            return;
          }
          if (detail) {
            if (detail.reversed()) detail.reversed(false);
            return;
          }
          hideDetails();
          detail = buildDetail();
          detail.eventCallback("onComplete", () => {
            detailsShown = true;
            showDetails();
          });
        };

        const hideGlass = () => {
          glassShown = false;
          glassTw?.kill();
          glassTw = null;
          gsap.set(glass, {
            autoAlpha: 0,
            x: 0,
            scale: 1,
            y: glassRestY + glassFrom * artScale(),
          });
        };

        const showGlass = () => {
          if (glassShown) {
            gsap.set(glass, { autoAlpha: 1, x: 0, y: glassRestY, scale: 1 });
            return;
          }
          if (glassTw) return;
          gsap.set(glass, {
            autoAlpha: 0,
            x: 0,
            scale: 1,
            y: glassRestY + glassFrom * artScale(),
          });
          glassTw = gsap.to(glass, {
            autoAlpha: 1,
            y: glassRestY,
            duration: glassDur,
            ease: "power2.out",
            onComplete: () => {
              glassShown = true;
              glassTw = null;
              gsap.set(glass, { autoAlpha: 1, y: glassRestY });
            },
          });
        };

        const remountCards = () => {
          clearWait();
          play?.kill();
          play = null;
          // detailsShown 中はタイトル／画像を触らない（box だけ組み直す）
          endRects = measureEnds();
          placeCards(startRects());
          gsap.set(cards, {
            autoAlpha: 0,
            y: () => risePx * artScale(),
          });
          showFaces();
          if (detailsShown) showDetails();
          else hideDetails();
          gsap.set(glass, {
            x: 0,
            scale: 1,
            y: glassShown ? glassRestY : glassRestY + glassFrom * artScale(),
            autoAlpha: glassShown ? 1 : 0,
          });
        };

        const begin = () => {
          clearWait();
          // 既存タイムラインがあれば殺さず順再生（逆スクロールの途中復帰）。
          if (play) {
            if (play.progress() === 0 && play.reversed()) {
              wait = gsap.delayedCall(enterLag, () => {
                play?.restart();
                keepDetails();
              });
              return;
            }
            play.reversed(false);
            keepDetails();
            return;
          }

          remountCards();
          wait = gsap.delayedCall(enterLag, () => {
            play = buildPlay();
          });
        };

        const leaveBack = () => {
          // 吸着〜弾き出し付近では逆再生しない（上スクロールで box が消えるのを防ぐ）。
          if (dockEl) {
            const box = dockEl.getBoundingClientRect();
            const mid = box.top + box.height / 2;
            const vh = window.innerHeight;
            if (mid > vh * dockKeepTop && mid < vh * dockKeepBot) return;
          }
          clearWait();
          // タイトル／画像は維持。box morph だけ逆再生。
          if (play) {
            play.reversed(true);
            return;
          }
          if (detailsShown) remountCards();
          else resetCards();
        };

        // Sticky 吸着完了でラベル／画像を順に入場（購読は cleanup 必須）。
        const onDock = (ev: Event) => {
          const docked = Boolean(
            (ev as CustomEvent<{ docked?: boolean }>).detail?.docked,
          );
          if (docked) beginDetail();
        };

        resetCards();
        root.addEventListener(funcDockEvent, onDock);
        if (root.hasAttribute("data-func-docked")) beginDetail();

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
        // ラベルは箱の中心が 72% に来たとき。吸着イベントには頼らない。
        if (dockEl) {
          ScrollTrigger.create({
            trigger: dockEl,
            start: "center 72%",
            onEnter: beginDetail,
            onEnterBack: beginDetail,
          });
          ScrollTrigger.create({
            trigger: dockEl,
            start: "top 70%",
            onEnter: showGlass,
            onEnterBack: showGlass,
          });
        }
        // セクションを上へ抜けたあとだけ隠し、次の入場でフェードアップする。
        ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          onLeaveBack: hideGlass,
        });

        return () => {
          root.removeEventListener(funcDockEvent, onDock);
          clearWait();
          play?.kill();
          glassTw?.kill();
          glassTw = null;
          play = null;
          resetDetails();
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-func-design
      aria-label="機能性 × デザイン"
      className="relative w-full md:pt-25"
    >
      {/* sticky 眼鏡より下。コンテンツは z-60 で眼鏡の上 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-[#070707]"
      />
      <div className="relative z-60 flex flex-col items-center gap-5 px-5 py-10 md:hidden">
        <h2 className="flex items-baseline font-jp text-[32px] leading-none text-white">
          <span>機能性</span>
          <span className="ml-[11px] text-[24px]">×</span>
          <span className="ml-2">デザイン</span>
        </h2>
        <article className="relative h-[160px] w-full overflow-hidden rounded-[15px] bg-[#2f2f2f]">
          <p className="absolute top-2 left-2.5 z-10 font-jp text-[16px] leading-none text-white">
            高耐久ヒンジ
          </p>
          <Image
            src={featCards[0].src ?? ""}
            alt=""
            width={featCards[0].picW}
            height={featCards[0].picH}
            sizes="180px"
            className="absolute bottom-0 left-1/2 h-[111px] w-[180px] -translate-x-1/2 object-contain object-bottom"
          />
        </article>
        <article
          data-sp-func-dock
          className="relative h-[160px] w-full overflow-hidden rounded-[15px] bg-[#2f2f2f]"
          style={{ backgroundImage: glowBg }}
        >
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div
              data-sp-func-glass
              aria-hidden
              className="w-[236px] max-w-full opacity-0"
            >
              <Image
                src={glassFrontImg.src}
                alt=""
                width={glassFrontImg.width}
                height={glassFrontImg.height}
                sizes="236px"
                className="h-auto w-full"
              />
            </div>
          </div>
          <p className="absolute top-2.5 left-2.5 z-20 font-jp text-[16px] leading-none text-white">
            滑らかなオーバルフレーム
          </p>
        </article>
        <article className="relative h-[160px] w-full overflow-hidden rounded-[15px] bg-[#2f2f2f]">
          <p className="absolute top-[11px] left-2.5 z-10 font-jp text-[16px] leading-none text-white">
            フィットするエッジ
          </p>
          <Image
            src={featCards[2].src ?? ""}
            alt=""
            width={featCards[2].picW}
            height={featCards[2].picH}
            sizes="145px"
            className="absolute bottom-0 left-1/2 h-[108px] w-[145px] -translate-x-1/2 rounded-b-[15px] object-contain object-bottom"
          />
        </article>
      </div>
      <div ref={artRef} className="@container relative z-60 mx-auto hidden w-full max-w-360 md:block">
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
              {...(card.glass ? { "data-func-dock": "" } : {})}
              className="relative h-[25cqw] min-w-0 basis-0 overflow-hidden rounded-[25px]"
              style={{ flexGrow: card.endGrow }}
            >
              <div
                data-face
                className={`absolute inset-0 md:motion-safe:opacity-0 ${card.face}`}
              />
              {card.glow ? (
                <div
                  data-glow
                  className="absolute inset-0 md:motion-safe:opacity-0"
                  style={{ backgroundImage: glowBg }}
                />
              ) : null}
              <p
                data-label
                className="absolute top-[1.319cqw] left-[0.972cqw] z-10 cursor-default font-jp text-[1.667cqw] leading-[1.2] whitespace-nowrap text-white select-none md:motion-safe:opacity-0"
              >
                {card.title}
              </p>
              {card.glass ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div
                    data-glass
                    data-func-glass
                    aria-hidden
                    className="w-155 shrink-0 md:motion-safe:opacity-0"
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
                  className={`absolute z-10 overflow-hidden md:motion-safe:opacity-0 ${card.pic}`}
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
