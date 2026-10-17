"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  glassFrontImg,
  modelHandoffEvent,
} from "@/features/home/components/StickyGlass";
import { gsap, useGSAP } from "@/lib/gsap";

const slideDur = 0.4;
const tagDur = 0.35;
const nameDur = 0.35;
const edgeDur = 0.35;
const glassBox = { w: 358, h: 100 } as const;
const modelDir = "/assets/pages/top/model";

type SideKey = "amber" | "gray";

type SideParts = {
  glass: HTMLElement;
  tag: HTMLElement;
  name: HTMLElement;
  edges: HTMLElement[];
};

const sideGlasses: Record<
  SideKey,
  { src: string; alt: string; name: string }
> = {
  amber: {
    src: `${modelDir}/img_glass-ared.png`,
    alt: "アンバーレッドのFREE FiTフレーム",
    name: "アンバーレッド",
  },
  gray: {
    src: `${modelDir}/img_glass-gray.png`,
    alt: "グレイブルーのFREE FiTフレーム",
    name: "グレイブルー",
  },
};

export function Model() {
  const rootRef = useRef<HTMLElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      const modelRise = 24;

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        const img = root.querySelector<HTMLElement>("[data-sp-model]");
        const amber = root.querySelector<HTMLElement>("[data-sp-amber]");
        const gray = root.querySelector<HTMLElement>("[data-sp-gray]");
        if (!img || !amber || !gray) return;
        const label = img.previousElementSibling;
        const step = 0.3;
        gsap.set([img, amber, gray], { autoAlpha: 0, y: modelRise });
        const enter = gsap.timeline({
          scrollTrigger: {
            trigger: label instanceof HTMLElement ? label : root,
            start: "center center",
            once: true,
          },
        });
        enter.to(img, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0);
        enter.to(amber, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, step);
        enter.to(gray, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, step * 2);
        return () => {
          enter.scrollTrigger?.kill();
          enter.kill();
        };
      });

      mm.add("(max-width: 767px) and (prefers-reduced-motion: reduce)", () => {
        const imgs = root.querySelectorAll<HTMLElement>(
          "[data-sp-model], [data-sp-amber], [data-sp-gray]",
        );
        if (imgs.length === 0) return;
        gsap.set(imgs, { autoAlpha: 1, y: 0 });
      });

      const normal = root.querySelector<HTMLElement>("[data-model-normal]");
      if (!normal) return;

      const sideEls = (key: SideKey): SideParts | null => {
        const glass = root.querySelector<HTMLElement>(
          `[data-side='${key}'][data-part='glass']`,
        );
        const tag = root.querySelector<HTMLElement>(
          `[data-side='${key}'][data-part='tag']`,
        );
        const name = root.querySelector<HTMLElement>(
          `[data-side='${key}'][data-part='name']`,
        );
        const edges = [
          ...root.querySelectorAll<HTMLElement>(
            `[data-side='${key}'][data-edge]`,
          ),
        ];
        if (!glass || !tag || !name || edges.length !== 4) return null;
        return { glass, tag, name, edges };
      };

      const amber = sideEls("amber");
      const gray = sideEls("gray");
      if (!amber || !gray) return;

      const edgeL = (edges: HTMLElement[]) =>
        edges.find((el) => el.dataset.edge === "left");
      const edgeT = (edges: HTMLElement[]) =>
        edges.find((el) => el.dataset.edge === "top");
      const edgeR = (edges: HTMLElement[]) =>
        edges.find((el) => el.dataset.edge === "right");
      const edgeB = (edges: HTMLElement[]) =>
        edges.find((el) => el.dataset.edge === "bottom");

      /** sticky／ノーマル枠中心から眼鏡所定位置への差分（layout 基準） */
      const fromSlotX = (glass: HTMLElement) => {
        const slotCx = normal.offsetLeft + normal.offsetWidth / 2;
        const glassCx = glass.offsetLeft + glass.offsetWidth / 2;
        return slotCx - glassCx;
      };

      /** 眼鏡中心からテキスト所定位置への差分（layout 基準） */
      const fromGlassY = (el: HTMLElement, glass: HTMLElement) => {
        const glassCy = glass.offsetTop + glass.offsetHeight / 2;
        const elCy = el.offsetTop + el.offsetHeight / 2;
        return glassCy - elCy;
      };

      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
        gsap.set([amber.glass, gray.glass], { x: 0, autoAlpha: 1 });
        gsap.set([amber.tag, gray.tag, amber.name, gray.name], {
          autoAlpha: 1,
          y: 0,
        });
        gsap.set(
          [...amber.edges, ...gray.edges].filter((el) =>
            ["left", "right"].includes(el.dataset.edge ?? ""),
          ),
          { scaleY: 1 },
        );
        gsap.set(
          [...amber.edges, ...gray.edges].filter((el) =>
            ["top", "bottom"].includes(el.dataset.edge ?? ""),
          ),
          { scaleX: 1 },
        );
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        let play: gsap.core.Timeline | null = null;
        let started = false;

        const hideSide = (side: SideParts) => {
          gsap.set(side.glass, {
            x: () => fromSlotX(side.glass),
            autoAlpha: 0,
          });
          gsap.set(side.tag, {
            autoAlpha: 0,
            y: () => fromGlassY(side.tag, side.glass),
          });
          gsap.set(side.name, {
            autoAlpha: 0,
            y: () => fromGlassY(side.name, side.glass),
          });
          const l = edgeL(side.edges);
          const t = edgeT(side.edges);
          const r = edgeR(side.edges);
          const b = edgeB(side.edges);
          if (l) gsap.set(l, { scaleY: 0 });
          if (t) gsap.set(t, { scaleX: 0 });
          if (r) gsap.set(r, { scaleY: 0 });
          if (b) gsap.set(b, { scaleX: 0 });
        };

        /** 左右同時。left → top → right → bottom */
        const drawEdges = (tl: gsap.core.Timeline, at: number | string) => {
          const verts = (pick: (e: HTMLElement[]) => HTMLElement | undefined) =>
            [pick(amber.edges), pick(gray.edges)].filter(
              (el): el is HTMLElement => !!el,
            );
          const lefts = verts(edgeL);
          const tops = verts(edgeT);
          const rights = verts(edgeR);
          const bottoms = verts(edgeB);
          if (lefts.length) {
            tl.to(
              lefts,
              { scaleY: 1, duration: edgeDur, ease: "power1.inOut" },
              at,
            );
          }
          if (tops.length) {
            tl.to(
              tops,
              { scaleX: 1, duration: edgeDur, ease: "power1.inOut" },
              ">",
            );
          }
          if (rights.length) {
            tl.to(
              rights,
              { scaleY: 1, duration: edgeDur, ease: "power1.inOut" },
              ">",
            );
          }
          if (bottoms.length) {
            tl.to(
              bottoms,
              { scaleX: 1, duration: edgeDur, ease: "power1.inOut" },
              ">",
            );
          }
        };

        const reset = () => {
          play?.kill();
          play = null;
          started = false;
          hideSide(amber);
          hideSide(gray);
        };

        const begin = () => {
          if (started || play) return;
          started = true;
          const tl = gsap.timeline();
          play = tl;

          tl.to(
            amber.glass,
            {
              x: 0,
              autoAlpha: 1,
              duration: slideDur,
              ease: "power2.out",
            },
            0,
          );
          tl.to(
            gray.glass,
            {
              x: 0,
              autoAlpha: 1,
              duration: slideDur,
              ease: "power2.out",
            },
            0,
          );

          tl.to(
            amber.tag,
            {
              y: 0,
              autoAlpha: 1,
              duration: tagDur,
              ease: "power2.out",
            },
            ">",
          );
          tl.to(
            gray.tag,
            {
              y: 0,
              autoAlpha: 1,
              duration: tagDur,
              ease: "power2.out",
            },
            "<",
          );
          tl.to(
            amber.name,
            {
              y: 0,
              autoAlpha: 1,
              duration: nameDur,
              ease: "power2.out",
            },
            "<",
          );
          tl.to(
            gray.name,
            {
              y: 0,
              autoAlpha: 1,
              duration: nameDur,
              ease: "power2.out",
            },
            "<",
          );

          // 限定モデルのスライドイン直後に枠線
          drawEdges(tl, ">");
        };

        reset();
        // sticky 吸着完了で入場（遅延なし・一度きり）
        root.addEventListener(modelHandoffEvent, begin);
        if (root.hasAttribute("data-model-handed")) begin();

        return () => {
          root.removeEventListener(modelHandoffEvent, begin);
          play?.kill();
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-model
      aria-label="選べる3モデル"
      className="relative z-10 w-full"
    >
      <div className="flex flex-col items-center gap-8 px-5 py-10 md:hidden">
        <div className="text-center text-white">
          <h2 className="font-jp text-[32px] leading-none tracking-[0.1em]">
            FREE FiT
          </h2>
          <p className="mt-3 font-jp text-[24px] leading-none">
            - 選べる3モデル -
          </p>
        </div>
        <div className="flex w-[236px] max-w-full flex-col items-center gap-10">
          <div className="flex w-full flex-col items-center gap-5">
            <p className="w-full text-center font-jp text-[20px] leading-none tracking-[0.1em] text-white">
              リーズナブル
            </p>
            <div data-sp-model className="aspect-[620/173] w-full">
              <Image
                src={glassFrontImg.src}
                alt="ノーマルのFREE FiTフレーム"
                width={glassFrontImg.width}
                height={glassFrontImg.height}
                sizes="236px"
                className="h-auto w-full"
              />
            </div>
            <p className="w-full text-center font-jp text-[16px] leading-none tracking-[0.1em] text-white">
              ノーマル
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-5">
            <p className="flex h-12 w-[200px] items-center justify-center border border-white font-jp text-[20px] leading-none tracking-[0.1em] text-white">
              限定モデル
            </p>
            <div data-sp-amber className="w-full">
              <Image
                src={sideGlasses.amber.src}
                alt={sideGlasses.amber.alt}
                width={glassBox.w}
                height={glassBox.h}
                sizes="236px"
                className="h-auto w-full"
              />
            </div>
            <p className="w-full text-center font-jp text-[16px] leading-none tracking-[0.1em] text-white">
              {sideGlasses.amber.name}
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-6">
            <p className="flex h-12 w-[200px] items-center justify-center border border-white font-jp text-[20px] leading-none tracking-[0.1em] text-white">
              限定モデル
            </p>
            <div data-sp-gray className="w-full">
              <Image
                src={sideGlasses.gray.src}
                alt={sideGlasses.gray.alt}
                width={glassBox.w}
                height={glassBox.h}
                sizes="236px"
                className="h-auto w-full"
              />
            </div>
            <p className="w-full text-center font-jp text-[16px] leading-none tracking-[0.1em] text-white">
              {sideGlasses.gray.name}
            </p>
          </div>
        </div>
      </div>
      {/* sticky(z-30) が手前。コンテンツは奥 */}
      <div
        data-art
        className="@container relative z-10 mx-auto hidden w-full max-w-360 md:block"
      >
        <div className="relative h-[55.556cqw]">
          <h2
            id="model-title"
            className="absolute top-[9.236cqw] left-1/2 -translate-x-1/2 cursor-default font-jp text-[6.667cqw] leading-none tracking-[0.1em] whitespace-nowrap text-white select-none"
          >
            FREE FiT
          </h2>
          <p className="absolute top-[18.958cqw] left-1/2 -translate-x-1/2 cursor-default font-jp text-[3.333cqw] leading-none whitespace-nowrap text-white select-none">
            選べる3モデル
          </p>

          <SideTag side="amber" className="left-[13.611cqw]" />
          <p className="absolute top-[29.722cqw] left-[44.653cqw] cursor-default font-jp text-[1.667cqw] leading-none tracking-[0.1em] whitespace-nowrap text-white select-none">
            リーズナブル
          </p>
          <SideTag side="gray" className="left-[72.083cqw]" />

          <SideGlass
            side="amber"
            className="left-[8.333cqw]"
            src={sideGlasses.amber.src}
            alt={sideGlasses.amber.alt}
          />
          <div
            data-model-normal
            className="absolute top-[34.583cqw] left-[37.569cqw] h-[6.944cqw] w-[24.861cqw]"
          >
            <div
              data-model-normal-img
              className="size-full md:motion-safe:opacity-0"
            >
              <Image
                src={glassFrontImg.src}
                alt="ノーマルのFREE FiTフレーム"
                width={glassBox.w}
                height={glassBox.h}
                sizes="358px"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <SideGlass
            side="gray"
            className="left-[66.806cqw]"
            src={sideGlasses.gray.src}
            alt={sideGlasses.gray.alt}
          />

          <p
            data-side="amber"
            data-part="name"
            className="absolute top-[43.472cqw] left-[14.444cqw] cursor-default font-jp text-[1.667cqw] leading-none tracking-[0.1em] whitespace-nowrap text-white select-none md:motion-safe:opacity-0"
          >
            {sideGlasses.amber.name}
          </p>
          <p className="absolute top-[43.472cqw] left-[46.389cqw] cursor-default font-jp text-[1.667cqw] leading-none tracking-[0.1em] whitespace-nowrap text-white select-none">
            ノーマル
          </p>
          <p
            data-side="gray"
            data-part="name"
            className="absolute top-[43.472cqw] left-[73.819cqw] cursor-default font-jp text-[1.667cqw] leading-none tracking-[0.1em] whitespace-nowrap text-white select-none md:motion-safe:opacity-0"
          >
            {sideGlasses.gray.name}
          </p>
        </div>
      </div>
    </section>
  );
}

function SideTag({
  side,
  className,
}: {
  side: SideKey;
  className: string;
}) {
  return (
    <div
      data-side={side}
      data-part="tag"
      className={`absolute top-[29.028cqw] flex h-[3.333cqw] w-[14.375cqw] cursor-default items-center justify-center font-jp text-[1.667cqw] leading-none tracking-[0.1em] text-white select-none md:motion-safe:opacity-0 ${className}`}
    >
      <span
        data-side={side}
        data-edge="left"
        className="absolute bottom-0 left-0 h-full w-px origin-bottom scale-y-0 bg-white"
      />
      <span
        data-side={side}
        data-edge="top"
        className="absolute top-0 left-0 h-px w-full origin-left scale-x-0 bg-white"
      />
      <span
        data-side={side}
        data-edge="right"
        className="absolute top-0 right-0 h-full w-px origin-top scale-y-0 bg-white"
      />
      <span
        data-side={side}
        data-edge="bottom"
        className="absolute right-0 bottom-0 h-px w-full origin-right scale-x-0 bg-white"
      />
      限定モデル
    </div>
  );
}

function SideGlass({
  side,
  className,
  src,
  alt,
}: {
  side: SideKey;
  className: string;
  src: string;
  alt: string;
}) {
  return (
    <div
      data-side={side}
      data-part="glass"
      className={`absolute top-[34.583cqw] h-[6.944cqw] w-[24.861cqw] will-change-transform md:motion-safe:opacity-0 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={glassBox.w}
        height={glassBox.h}
        sizes="358px"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
