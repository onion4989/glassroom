"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const artBase = 1440;
const artH = 800;
const enterLag = 0.1;
const enterStart = "top 30%";
const expandDur = 1;
const fadeDur = 0.6;
const scrambleDur = 2.5;
const scrambleSpeed = 0.3;
const scrambleChars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻ012345789";
const shotBox = { w: 996, h: 400, x: 222, y: 200, r: 25 };
const detailSrc = "/assets/pages/top/detail/img_detail.jpg";
const detailAlt = "木のデスクに置かれたFREE FiTフレーム";

type SpecRow = {
  label: string;
  value: string | string[];
};

const leftSpecs: SpecRow[] = [
  { label: "ブランド", value: "FREE FiT" },
  { label: "レンズの形", value: "オーバル" },
  { label: "素材", value: "テンプル：剛性チタン" },
];

const rightSpecs: SpecRow[] = [
  {
    label: "サイズ",
    value: ["レンズ幅：53mm", "テンプル：143mm", "鼻幅：16mm", "天地幅：34mm"],
  },
  { label: "重さ", value: "2mg" },
  { label: "原産国", value: "Made in Japan" },
];

export function Detail() {
  const rootRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const shotRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      const art = artRef.current;
      const stage = stageRef.current;
      const shot = shotRef.current;
      const panel = panelRef.current;
      if (!root || !art || !stage || !shot || !panel) return;

      const mm = gsap.matchMedia();
      const unit = () => (art.clientWidth || artBase) / artBase;
      const decodeEls = () =>
        panel.querySelectorAll<HTMLElement>("[data-scramble]");

      // 幅は窓いっぱい。高さは 1440:800 を保ちリサイズに追従。
      const fullBox = () => {
        const viewW = document.documentElement.clientWidth;
        const stageW = stage.clientWidth || viewW;
        const stageH =
          stage.clientHeight || (viewW * artH) / artBase;
        return {
          x: (stageW - viewW) / 2,
          y: 0,
          w: viewW,
          h: stageH,
        };
      };

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
        const apply = () => {
          const end = fullBox();
          gsap.set(shot, {
            left: end.x,
            top: end.y,
            width: end.w,
            height: end.h,
            borderRadius: 0,
          });
        };
        apply();
        gsap.set(panel, { autoAlpha: 1 });
        window.addEventListener("resize", apply);
        return () => window.removeEventListener("resize", apply);
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let wait: gsap.core.Tween | null = null;
        let expand: gsap.core.Timeline | null = null;
        let decode: gsap.core.Tween | null = null;
        const prog = { p: 0 };

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

        const runDecode = () => {
          decode?.kill();
          const els = decodeEls();
          if (!els.length) return;
          decode = gsap.to(els, {
            duration: scrambleDur,
            scrambleText: {
              text: "{original}",
              chars: scrambleChars,
              speed: scrambleSpeed,
            },
            stagger: 0.08,
          });
        };

        const reset = () => {
          wait?.kill();
          wait = null;
          expand?.kill();
          expand = null;
          decode?.kill();
          decode = null;
          prog.p = 0;
          place(0);
          gsap.set(panel, { autoAlpha: 0 });
        };

        const begin = () => {
          if (wait || expand) return;
          wait = gsap.delayedCall(enterLag, () => {
            const tl = gsap.timeline({
              onComplete: () => {
                gsap.to(panel, {
                  autoAlpha: 1,
                  duration: fadeDur,
                  ease: "power2.out",
                  onStart: runDecode,
                });
              },
            });
            expand = tl;
            tl.to(prog, {
              p: 1,
              duration: expandDur,
              ease: "power2.inOut",
              onUpdate: () => place(prog.p),
            });
          });
        };

        const onResize = () => place(prog.p);

        reset();
        ScrollTrigger.create({
          trigger: root,
          start: enterStart,
          once: true,
          onEnter: begin,
        });
        window.addEventListener("resize", onResize);

        return () => {
          wait?.kill();
          expand?.kill();
          decode?.kill();
          window.removeEventListener("resize", onResize);
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-detail
      aria-label="製品詳細"
      className="relative z-10 w-full bg-[#070707]"
    >
      <div ref={artRef} className="@container w-full">
        <div ref={stageRef} className="relative h-[55.556cqw] w-full">
          <div
            ref={shotRef}
            className="absolute top-[13.889cqw] left-[15.417cqw] h-[27.778cqw] w-[69.167cqw] overflow-hidden rounded-[1.736cqw]"
          >
            <Image
              src={detailSrc}
              alt={detailAlt}
              fill
              sizes="100vw"
              className="object-cover object-bottom"
            />
            <div
              ref={panelRef}
              className="absolute inset-x-0 bottom-0 flex h-[32%] gap-[2.083cqw] px-[6.25cqw] bg-black/70 motion-safe:opacity-0"
            >
              <SpecCol rows={leftSpecs} className="min-w-0 w-1/2" />
              <SpecCol rows={rightSpecs} className="min-w-0 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecCol({
  rows,
  className,
}: {
  rows: SpecRow[];
  className: string;
}) {
  return (
    <div
      className={`grid h-full grid-rows-3 py-[2.778cqw] ${className}`}
    >
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex items-center gap-[10.972cqw] ${
            i < rows.length - 1 ? "border-b border-white" : ""
          }`}
        >
          <p className="w-[6.944cqw] shrink-0 cursor-default font-jp text-[1.389cqw] leading-normal text-white select-none">
            {row.label}
          </p>
          {Array.isArray(row.value) ? (
            <div className="grid grid-cols-2 gap-x-[2.778cqw] gap-y-1">
              {row.value.map((line) => (
                <p
                  key={line}
                  data-scramble
                  className="cursor-default font-jp text-[1.389cqw] leading-none whitespace-nowrap text-white select-none"
                >
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p
              data-scramble
              className="cursor-default font-jp text-[1.389cqw] leading-normal whitespace-nowrap text-white select-none"
            >
              {row.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
