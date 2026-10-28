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
const spShotH = 220;
const spCardH = 110;
const detailSrc = "/assets/pages/top/detail/img_detail.jpg";
const detailAlt = "木のデスクに置かれたFREE FiTフレーム";

type SpecRow = {
  label: string;
  value: string | string[];
  /** 数値（Inter） */
  num?: boolean;
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
  { label: "重さ", value: "2mg", num: true },
  { label: "原産国", value: "Made in Japan" },
];

export function Detail() {
  const rootRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const shotRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const spStageRef = useRef<HTMLDivElement>(null);
  const spShotRef = useRef<HTMLDivElement>(null);

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

      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
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

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        // ScrambleText は md+ のみ。Mobile 初回チャンクから外す。
        let cancelled = false;
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
          void import("@/lib/gsap-scramble").then(() => {
            if (cancelled) return;
            decode?.kill();
            decode = gsap.to(els, {
              duration: scrambleDur,
              scrambleText: {
                text: "{original}",
                chars: scrambleChars,
                speed: scrambleSpeed,
              },
              stagger: 0.08,
            });
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
          cancelled = true;
          wait?.kill();
          expand?.kill();
          decode?.kill();
          window.removeEventListener("resize", onResize);
        };
      });

      mm.add("(max-width: 767px) and (prefers-reduced-motion: reduce)", () => {
        const stage = spStageRef.current;
        const shot = spShotRef.current;
        if (!stage || !shot) return;
        const apply = () => {
          gsap.set(shot, {
            left: 0,
            top: 0,
            width: stage.clientWidth,
            height: spShotH,
            borderRadius: 0,
          });
        };
        apply();
        window.addEventListener("resize", apply);
        return () => window.removeEventListener("resize", apply);
      });

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        const stage = spStageRef.current;
        const shot = spShotRef.current;
        if (!stage || !shot) return;

        let wait: gsap.core.Tween | null = null;
        let expand: gsap.core.Timeline | null = null;
        const prog = { p: 0 };
        const scale = () => (stage.clientWidth || artBase) / artBase;

        const cardBox = () => {
          const width = shotBox.w * scale();
          const height = spCardH;
          return {
            left: (stage.clientWidth - width) / 2,
            top: (spShotH - height) / 2,
            width,
            height,
            borderRadius: shotBox.r * scale(),
          };
        };

        const endBox = () => ({
          left: 0,
          top: 0,
          width: stage.clientWidth,
          height: spShotH,
          borderRadius: 0,
        });

        const place = (p: number) => {
          const from = cardBox();
          const end = endBox();
          gsap.set(shot, {
            left: gsap.utils.interpolate(from.left, end.left, p),
            top: gsap.utils.interpolate(from.top, end.top, p),
            width: gsap.utils.interpolate(from.width, end.width, p),
            height: gsap.utils.interpolate(from.height, end.height, p),
            borderRadius: gsap.utils.interpolate(
              from.borderRadius,
              end.borderRadius,
              p,
            ),
          });
        };

        const reset = () => {
          wait?.kill();
          wait = null;
          expand?.kill();
          expand = null;
          prog.p = 0;
          place(0);
        };

        const begin = () => {
          if (wait || expand) return;
          wait = gsap.delayedCall(enterLag, () => {
            const tl = gsap.timeline();
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
      <div className="py-10 md:hidden">
        <div ref={spStageRef} className="relative h-[220px] w-full">
          <div ref={spShotRef} className="absolute inset-0 overflow-hidden">
            <Image
              src={detailSrc}
              alt={detailAlt}
              fill
              sizes="100vw"
              className="object-cover object-bottom"
            />
          </div>
        </div>
        <dl className="mx-auto mt-[30px] flex w-full max-w-[350px] flex-col px-5">
          <div className="grid grid-cols-[100px_1fr] items-center gap-x-4 border-b border-white py-4">
            <dt className="font-jp text-[16px] leading-none text-white">
              ブランド
            </dt>
            <dd className="font-jp text-[16px] leading-none text-white">
              FREE FiT
            </dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-x-4 border-b border-white py-4">
            <dt className="font-jp text-[16px] leading-none text-white">
              レンズの形
            </dt>
            <dd className="font-jp text-[16px] leading-none text-white">
              オーバル
            </dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-x-4 border-b border-white py-4">
            <dt className="font-jp text-[16px] leading-none text-white">
              素材
            </dt>
            <dd className="font-jp text-[16px] leading-[1.6] text-white">
              テンプル：剛性チタン
              <br />
              フロント：ステンレス
            </dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-x-4 border-b border-white py-4">
            <dt className="font-jp text-[16px] leading-none text-white">
              サイズ
            </dt>
            <dd className="font-jp text-[16px] leading-[1.6] text-white">
              レンズ幅：53mm
              <br />
              テンプル：143mm
              <br />
              鼻幅：16mm
              <br />
              天地幅：34mm
            </dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-x-4 border-b border-white py-4">
            <dt className="font-jp text-[16px] leading-none text-white">
              重さ
            </dt>
            <dd className="font-num text-[16px] leading-none text-white">
              2mg
            </dd>
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-x-4 py-4">
            <dt className="font-jp text-[16px] leading-none text-white">
              原産国
            </dt>
            <dd className="font-jp text-[16px] leading-none text-white">
              Made in Japan
            </dd>
          </div>
        </dl>
      </div>
      <div ref={artRef} className="@container hidden w-full md:block">
        <div ref={stageRef} className="relative h-[500px] w-full lg:h-[55.556cqw]">
          <div
            ref={shotRef}
            className="absolute inset-0 overflow-hidden lg:top-[13.889cqw] lg:left-[15.417cqw] lg:h-[27.778cqw] lg:w-[69.167cqw] lg:rounded-[1.736cqw]"
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
              className="absolute inset-x-0 bottom-0 flex h-[140px] gap-8 px-16 bg-black/70 md:motion-safe:opacity-0 lg:h-[32%] lg:gap-[2.083cqw] lg:px-[6.25cqw]"
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

/** 「キー：値」を分割してキー幅を揃える（Tablet でも ： が縦に揃う） */
function SpecValueLine({ line }: { line: string }) {
  const sep = "：";
  const at = line.indexOf(sep);
  const textClass =
    "cursor-default font-jp text-[12px] leading-none whitespace-nowrap text-white select-none lg:text-[1.389cqw]";
  if (at < 0) {
    return (
      <p data-scramble className={textClass}>
        {line}
      </p>
    );
  }
  const key = line.slice(0, at);
  const rest = line.slice(at);
  return (
    <p className={`flex items-baseline ${textClass}`}>
      <span
        data-scramble
        className="inline-block w-[4.5em] shrink-0"
      >
        {key}
      </span>
      <span data-scramble>{rest}</span>
    </p>
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
      className={`grid h-full grid-rows-3 py-3 lg:py-[2.778cqw] ${className}`}
    >
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex items-center gap-6 lg:gap-[6cqw] ${
            i < rows.length - 1 ? "border-b border-white" : ""
          }`}
        >
          <p className="w-[5em] shrink-0 cursor-default font-jp text-[12px] leading-normal text-white select-none lg:w-[6.944cqw] lg:text-[1.389cqw]">
            {row.label}
          </p>
          {Array.isArray(row.value) ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 lg:gap-x-[2.778cqw]">
              {row.value.map((line) => (
                <SpecValueLine key={line} line={line} />
              ))}
            </div>
          ) : (
            <p
              data-scramble
              className={`cursor-default text-[12px] leading-normal whitespace-nowrap text-white select-none lg:text-[1.389cqw] ${
                row.num ? "font-num" : "font-jp"
              }`}
            >
              {row.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
