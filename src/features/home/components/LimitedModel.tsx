"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const artBase = 1440;
const copyLag = 0.8;
const lineDur = 0.6;
const lineRise = 16;
const waveRise = 10;
const waveStep = 0.06;
const waveUp = 0.18;
const waveDn = 0.28;
const edgeDur = 0.35;
const shotBox = { w: 996, h: 400, x: 222, y: 200, r: 25 };
const modelSrc = "/assets/pages/top/limited/img_limited-model2.jpg";
const modelAlt = "アンバーレッドの期間限定フレームをかけた横顔";
const titleChars = ["期", "間", "限", "定", "モ", "デ", "ル"];

const copyLine = "cursor-default text-black select-none motion-safe:opacity-0";

export function LimitedModel() {
  const rootRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const shotRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLDivElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      const art = artRef.current;
      const stage = stageRef.current;
      const shot = shotRef.current;
      const tail = tailRef.current;
      if (!root || !art || !stage || !shot || !tail) return;

      const brand = root.querySelector<HTMLElement>("[data-copy='brand']");
      const chars = [...root.querySelectorAll<HTMLElement>("[data-char]")];
      const edgeL = root.querySelector<HTMLElement>("[data-edge='left']");
      const edgeT = root.querySelector<HTMLElement>("[data-edge='top']");
      const edgeR = root.querySelector<HTMLElement>("[data-edge='right']");
      const edgeB = root.querySelector<HTMLElement>("[data-edge='bottom']");
      const amber = root.querySelector<HTMLElement>("[data-copy='amber']");
      const sale = root.querySelector<HTMLElement>("[data-copy='sale']");
      const rules = [...root.querySelectorAll<HTMLElement>("[data-rule]")];
      if (!brand || !amber || !sale || !edgeL || !edgeT || !edgeR || !edgeB) {
        return;
      }
      const mm = gsap.matchMedia();

      const unit = () => (art.clientWidth || artBase) / artBase;

      // 幅は窓いっぱい。高さは窓の高さまで、スクロールに追従して広げる。
      const fullBox = () => {
        const viewW = document.documentElement.clientWidth;
        const viewH = document.documentElement.clientHeight;
        const stageW = stage.clientWidth || viewW;
        return {
          x: (stageW - viewW) / 2,
          y: 0,
          w: viewW,
          h: viewH,
        };
      };

      // 最後のセクションでも上端が画面上端に届くようにする。
      const setRoom = () => {
        const viewH = document.documentElement.clientHeight;
        const short = viewH - stage.offsetHeight;
        tail.style.height = `${Math.max(0, short + 2)}px`;
      };
      setRoom();
      ScrollTrigger.addEventListener("refreshInit", setRoom);

      const card = () => {
        const u = unit();
        return {
          left: shotBox.x * u,
          top: shotBox.y * u,
          width: shotBox.w * u,
          height: shotBox.h * u,
          borderRadius: shotBox.r * u,
        };
      };

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const end = fullBox();
        gsap.set(shot, {
          left: end.x,
          top: end.y,
          width: end.w,
          height: end.h,
          borderRadius: 0,
        });
        gsap.set([brand, amber, sale, ...chars], { autoAlpha: 1, y: 0 });
        gsap.set([edgeL, edgeR], { scaleY: 1 });
        gsap.set([edgeT, edgeB, ...rules], { scaleX: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let copyWait: gsap.core.Tween | null = null;
        let copyTl: gsap.core.Timeline | null = null;

        const stopCopy = () => {
          copyWait?.kill();
          copyTl?.kill();
          copyWait = null;
          copyTl = null;
        };

        const hideCopy = () => {
          stopCopy();
          const y = () => lineRise * unit();
          gsap.set([brand, amber], { autoAlpha: 0, y });
          gsap.set(sale, { autoAlpha: 0, y: 0 });
          gsap.set(chars, { autoAlpha: 0, y: 0 });
          gsap.set([edgeL, edgeR], { scaleY: 0 });
          gsap.set([edgeT, edgeB, ...rules], { scaleX: 0 });
        };

        const showCopy = () => {
          if (copyWait || copyTl) return;
          copyWait = gsap.delayedCall(copyLag, () => {
            const tl = gsap.timeline();
            copyTl = tl;
            tl.to(brand, {
              y: 0,
              autoAlpha: 1,
              duration: lineDur,
              ease: "power2.out",
            });
            tl.add("wave");
            chars.forEach((ch, i) => {
              const at = i * waveStep;
              tl.to(
                ch,
                {
                  y: () => -waveRise * unit(),
                  autoAlpha: 1,
                  duration: waveUp,
                  ease: "power1.out",
                },
                `wave+=${at}`,
              );
              tl.to(
                ch,
                { y: 0, duration: waveDn, ease: "power2.out" },
                `wave+=${at + waveUp}`,
              );
            });
            tl.to(
              edgeL,
              { scaleY: 1, duration: edgeDur, ease: "power1.inOut" },
              ">",
            );
            tl.to(
              edgeT,
              { scaleX: 1, duration: edgeDur, ease: "power1.inOut" },
              ">",
            );
            tl.to(
              edgeR,
              { scaleY: 1, duration: edgeDur, ease: "power1.inOut" },
              ">",
            );
            tl.to(
              edgeB,
              { scaleX: 1, duration: edgeDur, ease: "power1.inOut" },
              ">",
            );
            tl.to(
              amber,
              {
                y: 0,
                autoAlpha: 1,
                duration: lineDur,
                ease: "power2.out",
              },
              ">",
            );
            tl.to(
              sale,
              { autoAlpha: 1, duration: lineDur, ease: "power2.out" },
              ">",
            );
            tl.to(
              rules,
              { scaleX: 1, duration: lineDur, ease: "power2.out" },
              "<",
            );
          });
        };

        const place = (p: number) => {
          const from = card();
          const end = fullBox();
          gsap.set(shot, {
            left: gsap.utils.interpolate(from.left, end.x, p),
            top: gsap.utils.interpolate(from.top, end.y, p),
            width: gsap.utils.interpolate(from.width, end.w, p),
            height: gsap.utils.interpolate(from.height, end.h, p),
            borderRadius: gsap.utils.interpolate(from.borderRadius, 0, p),
          });
        };

        const sync = (p: number) => {
          place(p);
          if (p >= 0.999) showCopy();
          else hideCopy();
        };

        place(0);
        hideCopy();

        ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "top top",
          onUpdate: (self) => sync(self.progress),
          onRefresh: (self) => sync(self.progress),
        });

        return () => {
          stopCopy();
        };
      });

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", setRoom);
        tail.style.height = "";
      };
    },
    { scope: rootRef },
  );

  return (
    <>
      <section
        ref={rootRef}
        data-limited
        aria-labelledby="limited-title"
        className="relative z-10 w-full bg-[#070707]"
      >
        <div ref={artRef} className="@container mx-auto w-full max-w-360">
          <div ref={stageRef} className="relative h-[55.556cqw]">
            <div
              ref={shotRef}
              className="absolute top-[13.889cqw] left-[15.417cqw] h-[27.778cqw] w-[69.167cqw] overflow-hidden rounded-[1.736cqw]"
            >
              <Image
                src={modelSrc}
                alt={modelAlt}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <p
              data-copy="brand"
              className={`absolute top-[13.333cqw] left-[10.833cqw] font-jp text-[4.444cqw] leading-[1.2] tracking-[0.444cqw] ${copyLine}`}
            >
              FREE FiT
            </p>
            <h2
              id="limited-title"
              className="absolute top-[20.556cqw] left-[8.333cqw] flex h-[5cqw] w-[26.667cqw] cursor-default items-center justify-center font-jp text-[3.333cqw] leading-none text-black select-none"
            >
              <span
                data-edge="left"
                className="absolute bottom-0 left-0 h-full w-px origin-bottom scale-y-0 bg-black"
              />
              <span
                data-edge="top"
                className="absolute top-0 left-0 h-px w-full origin-left scale-x-0 bg-black"
              />
              <span
                data-edge="right"
                className="absolute top-0 right-0 h-full w-px origin-top scale-y-0 bg-black"
              />
              <span
                data-edge="bottom"
                className="absolute right-0 bottom-0 h-px w-full origin-right scale-x-0 bg-black"
              />
              {titleChars.map((ch) => (
                <span key={ch} data-char className="inline-block motion-safe:opacity-0">
                  {ch}
                </span>
              ))}
            </h2>
            <p
              data-copy="amber"
              className={`absolute top-[27.569cqw] left-[8.333cqw] w-[26.667cqw] text-center font-jp text-[2.222cqw] leading-[1.2] tracking-[0.444cqw] ${copyLine}`}
            >
              アンバーレッド
            </p>
            <div className="absolute top-[32.778cqw] left-[13.75cqw] h-[5.944cqw] w-[15.833cqw]">
              <span
                data-rule
                className="absolute inset-x-0 top-0 h-px origin-center scale-x-0 bg-black"
              />
              <p
                data-copy="sale"
                className={`absolute inset-x-0 top-[0.972cqw] text-center font-jp text-[3.333cqw] leading-[1.2] tracking-[0.667cqw] ${copyLine}`}
              >
                発売中
              </p>
              <span
                data-rule
                className="absolute inset-x-0 bottom-0 h-px origin-center scale-x-0 bg-black"
              />
            </div>
          </div>
        </div>
      </section>
      <div ref={tailRef} aria-hidden />
    </>
  );
}
