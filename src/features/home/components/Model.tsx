"use client";

import Image from "next/image";
import { useRef } from "react";
import { glassFrontImg } from "@/features/home/components/StickyGlass";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const artBase = 1440;
const enterLag = 0.8;
const enterStart = "top 60%";
const zoomDur = 0.7;
const tagDur = 0.55;
const nameDur = 0.6;
const tagDrop = 50;
const nameRise = 100;
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

      const art = root.querySelector<HTMLElement>("[data-art]");
      if (!art) return;

      const artScale = () => (art.clientWidth || artBase) / artBase;
      const mm = gsap.matchMedia();

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

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([amber.glass, gray.glass], { scale: 1, autoAlpha: 1 });
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

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let wait: gsap.core.Tween | null = null;
        let play: gsap.core.Timeline | null = null;

        const hideSide = (side: SideParts) => {
          gsap.set(side.glass, { scale: 0.3, autoAlpha: 0 });
          gsap.set(side.tag, {
            autoAlpha: 0,
            y: () => -tagDrop * artScale(),
          });
          gsap.set(side.name, {
            autoAlpha: 0,
            y: () => nameRise * artScale(),
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

        const addSide = (
          tl: gsap.core.Timeline,
          side: SideParts,
          at: number | string,
        ) => {
          const l = edgeL(side.edges);
          const t = edgeT(side.edges);
          const r = edgeR(side.edges);
          const b = edgeB(side.edges);
          tl.to(
            side.glass,
            {
              scale: 1,
              autoAlpha: 1,
              duration: zoomDur,
              ease: "power2.out",
            },
            at,
          );
          tl.to(
            side.tag,
            {
              y: 0,
              autoAlpha: 1,
              duration: tagDur,
              ease: "power2.out",
            },
            ">",
          );
          if (l) {
            tl.to(
              l,
              { scaleY: 1, duration: edgeDur, ease: "power1.inOut" },
              "<",
            );
          }
          if (t) {
            tl.to(
              t,
              { scaleX: 1, duration: edgeDur, ease: "power1.inOut" },
              ">",
            );
          }
          if (r) {
            tl.to(
              r,
              { scaleY: 1, duration: edgeDur, ease: "power1.inOut" },
              ">",
            );
          }
          if (b) {
            tl.to(
              b,
              { scaleX: 1, duration: edgeDur, ease: "power1.inOut" },
              ">",
            );
          }
          tl.to(
            side.name,
            {
              y: 0,
              autoAlpha: 1,
              duration: nameDur,
              ease: "power2.out",
            },
            ">",
          );
        };

        const reset = () => {
          wait?.kill();
          wait = null;
          play?.kill();
          play = null;
          hideSide(amber);
          hideSide(gray);
        };

        const begin = () => {
          if (play || wait) return;
          wait = gsap.delayedCall(enterLag, () => {
            const tl = gsap.timeline();
            play = tl;
            addSide(tl, amber, 0);
            addSide(tl, gray, ">");
          });
        };

        reset();
        ScrollTrigger.create({
          trigger: root,
          start: enterStart,
          once: true,
          onEnter: begin,
        });

        return () => {
          wait?.kill();
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
      aria-labelledby="model-title"
      className="relative z-10 w-full"
    >
      {/* sticky(z-30) が手前。コンテンツは奥 */}
      <div
        data-art
        className="@container relative z-10 mx-auto w-full max-w-360"
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
              className="size-full motion-safe:opacity-0"
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
            className="absolute top-[43.472cqw] left-[14.444cqw] cursor-default font-jp text-[1.667cqw] leading-none tracking-[0.1em] whitespace-nowrap text-white select-none motion-safe:opacity-0"
          >
            {sideGlasses.amber.name}
          </p>
          <p className="absolute top-[43.472cqw] left-[46.389cqw] cursor-default font-jp text-[1.667cqw] leading-none tracking-[0.1em] whitespace-nowrap text-white select-none">
            ノーマル
          </p>
          <p
            data-side="gray"
            data-part="name"
            className="absolute top-[43.472cqw] left-[73.819cqw] cursor-default font-jp text-[1.667cqw] leading-none tracking-[0.1em] whitespace-nowrap text-white select-none motion-safe:opacity-0"
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
      className={`absolute top-[29.028cqw] flex h-[3.333cqw] w-[14.375cqw] cursor-default items-center justify-center font-jp text-[1.667cqw] leading-none tracking-[0.1em] text-white select-none motion-safe:opacity-0 ${className}`}
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
      className={`absolute top-[34.583cqw] h-[6.944cqw] w-[24.861cqw] origin-center motion-safe:opacity-0 ${className}`}
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
