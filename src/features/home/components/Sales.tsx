"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const artBase = 1440;
const enterLag = 0.8;
const enterStart = "top 60%";
const countEnd = 15000;
const countDur = 2;
const labelRise = 50;
const suffixSlide = 30;
const noteDrop = 50;
const tipSlide = 50;
const arrowSlide = 30;
const edgeDur = 1.1;
const fadeDur = 0.45;
const edgeFade = 120;
const backTone = "#070707";
const arrowSrc = "/assets/pages/top/sales/ic_top_sales_arrow-r.svg";

export function Sales() {
  const rootRef = useRef<HTMLElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const unit = () => (root.clientWidth || artBase) / artBase;
      const mm = gsap.matchMedia();

      type SalesPart = {
        label: HTMLElement;
        count: HTMLElement;
        suffix: HTMLElement;
        asOf: HTMLElement;
        stroke: SVGPathElement;
        btnText: HTMLElement;
        arrow: HTMLElement;
        tip: HTMLElement;
      };

      const readParts = (box: ParentNode): SalesPart | null => {
        const label = box.querySelector<HTMLElement>("[data-part='label']");
        const count = box.querySelector<HTMLElement>("[data-part='count']");
        const suffix = box.querySelector<HTMLElement>("[data-part='suffix']");
        const asOf = box.querySelector<HTMLElement>("[data-part='asof']");
        const stroke = box.querySelector<SVGPathElement>(
          "[data-part='stroke']",
        );
        const btnText = box.querySelector<HTMLElement>("[data-part='btn-text']");
        const arrow = box.querySelector<HTMLElement>("[data-part='arrow']");
        const tip = box.querySelector<HTMLElement>("[data-part='tip']");
        if (
          !label ||
          !count ||
          !suffix ||
          !asOf ||
          !stroke ||
          !btnText ||
          !arrow ||
          !tip
        ) {
          return null;
        }
        return { label, count, suffix, asOf, stroke, btnText, arrow, tip };
      };

      const showStill = (part: SalesPart) => {
        const len = part.stroke.getTotalLength();
        part.count.textContent = countEnd.toLocaleString("en-US");
        gsap.set(
          [part.label, part.suffix, part.asOf, part.btnText, part.arrow, part.tip],
          { autoAlpha: 1, x: 0, y: 0 },
        );
        gsap.set(part.stroke, { strokeDasharray: len, strokeDashoffset: 0 });
      };

      const playEnter = (part: SalesPart) => {
        const len = part.stroke.getTotalLength();
        const countObj = { val: 0 };
        let wait: gsap.core.Tween | null = null;
        let play: gsap.core.Timeline | null = null;

        const writeCount = (n: number) => {
          part.count.textContent = Math.round(n).toLocaleString("en-US");
        };

        const reset = () => {
          wait?.kill();
          wait = null;
          play?.kill();
          play = null;
          countObj.val = 0;
          writeCount(0);
          gsap.set(part.label, { autoAlpha: 0, y: labelRise * unit() });
          gsap.set(part.suffix, { autoAlpha: 0, x: -suffixSlide * unit() });
          gsap.set(part.asOf, { autoAlpha: 0, y: -noteDrop * unit() });
          gsap.set(part.btnText, { autoAlpha: 0 });
          gsap.set(part.arrow, { autoAlpha: 0, x: -arrowSlide * unit() });
          gsap.set(part.tip, { autoAlpha: 0, x: -tipSlide * unit() });
          gsap.set(part.stroke, { strokeDasharray: len, strokeDashoffset: len });
        };

        const begin = () => {
          if (play || wait) return;
          wait = gsap.delayedCall(enterLag, () => {
            const tl = gsap.timeline();
            play = tl;

            tl.to(part.label, {
              autoAlpha: 1,
              y: 0,
              duration: fadeDur,
              ease: "power2.out",
            });

            tl.to(
              countObj,
              {
                val: countEnd,
                duration: countDur,
                ease: "power2.out",
                onUpdate: () => writeCount(countObj.val),
              },
              ">-0.1",
            );

            tl.to(
              part.suffix,
              {
                autoAlpha: 1,
                x: 0,
                duration: fadeDur,
                ease: "power2.out",
              },
              ">",
            );

            tl.to(
              part.asOf,
              {
                autoAlpha: 1,
                y: 0,
                duration: fadeDur,
                ease: "power2.out",
              },
              "<0.1",
            );

            tl.to(
              part.stroke,
              {
                strokeDashoffset: 0,
                duration: edgeDur,
                ease: "power1.inOut",
              },
              ">-0.05",
            );

            tl.to(
              part.btnText,
              {
                autoAlpha: 1,
                duration: fadeDur,
                ease: "power2.out",
              },
              ">",
            );

            tl.to(
              part.arrow,
              {
                autoAlpha: 1,
                x: 0,
                duration: fadeDur,
                ease: "power2.out",
              },
              ">",
            );

            tl.to(
              part.tip,
              {
                autoAlpha: 1,
                x: 0,
                duration: fadeDur,
                ease: "power2.out",
              },
              ">",
            );
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
      };

      const arm = (sel: string, reduced: boolean) => {
        const box = root.querySelector(sel);
        if (!box) return;
        const part = readParts(box);
        if (!part) return;
        if (reduced) {
          showStill(part);
          return;
        }
        return playEnter(part);
      };

      mm.add("(max-width: 767px) and (prefers-reduced-motion: reduce)", () => {
        arm("[data-sales-sp]", true);
      });

      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        return arm("[data-sales-sp]", false);
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
        arm("[data-sales-pc]", true);
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        return arm("[data-sales-pc]", false);
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-sales
      aria-label="累計販売本数"
      className="relative z-10 w-full overflow-hidden bg-[#070707]"
    >
      <div
        data-sales-sp
        className="relative z-10 flex flex-col items-center gap-[15px] px-5 py-10 md:hidden"
      >
        <h2
          data-part="label"
          className="font-jp text-[32px] leading-none tracking-[0.2em] text-white motion-safe:opacity-0"
        >
          累計販売本数
        </h2>
        <div className="flex items-end text-white">
          <p
            data-part="count"
            className="font-num text-[64px] leading-none tracking-[0.02em] tabular-nums"
          >
            0
          </p>
          <span
            data-part="suffix"
            className="mb-3 ml-1 font-jp text-[16px] leading-none tracking-[0.2em] motion-safe:opacity-0"
          >
            以上
          </span>
        </div>
        <p
          data-part="asof"
          className="font-jp text-[16px] leading-none tracking-[0.2em] text-white motion-safe:opacity-0"
        >
          ※2026年9月現在
        </p>
        <div className="relative flex h-[60px] w-[300px] items-center justify-center rounded-full">
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
            viewBox="0 0 483 96"
            preserveAspectRatio="none"
            overflow="visible"
          >
            <path
              data-part="stroke"
              d="M 1 48 A 47 47 0 0 1 48 1 H 435 A 47 47 0 0 1 482 48 A 47 47 0 0 1 435 95 H 48 A 47 47 0 0 1 1 48"
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={9999}
              strokeDashoffset={9999}
              className="motion-reduce:[stroke-dashoffset:0]"
            />
          </svg>
          <span
            data-part="btn-text"
            className="font-jp text-[16px] leading-none tracking-[0.2em] text-white motion-safe:opacity-0"
          >
            お問い合わせはこちらから
          </span>
          <span
            data-part="arrow"
            aria-hidden
            className="absolute right-5 flex h-[13px] w-2 items-center justify-center motion-safe:opacity-0"
          >
            <img src={arrowSrc} alt="" width={8} height={13} className="size-full" />
          </span>
        </div>
        <p
          data-part="tip"
          className="text-center font-jp text-[10px] leading-none tracking-[0.2em] text-white motion-safe:opacity-0"
        >
          在庫のご確認・ご予約、などお気軽にご相談ください。
        </p>
      </div>
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-x-0 top-0 z-1"
          style={{
            height: edgeFade,
            background: `linear-gradient(to bottom, ${backTone}, transparent)`,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-1"
          style={{
            height: edgeFade,
            background: `linear-gradient(to top, ${backTone}, transparent)`,
          }}
        />
      </div>
      <div
        data-sales-pc
        className="@container relative z-10 mx-auto hidden w-full max-w-360 flex-col items-center px-[80px] py-[100px] md:flex lg:px-[8.333cqw] lg:py-[10.417cqw]"
      >
        <h2
          id="sales-title"
          data-part="label"
          className="cursor-default font-jp text-[40px] leading-none tracking-[0.2em] text-white select-none md:motion-safe:opacity-0 lg:text-[3.333cqw]"
        >
          累計販売本数
        </h2>

        <div className="mt-[14px] flex items-start justify-center gap-2 lg:mt-[1.181cqw] lg:gap-[0.625cqw]">
          <p
            data-part="count"
            className="cursor-default font-num text-[64px] leading-none font-medium tracking-[0.2em] text-white tabular-nums select-none lg:text-[6.667cqw] lg:tracking-[0.1em]"
          >
            0
          </p>
          <span
            data-part="suffix"
            className="mt-[25px] cursor-default font-jp text-[24px] leading-none tracking-[0.2em] text-white select-none md:motion-safe:opacity-0 lg:mt-[3.264cqw] lg:text-[1.389cqw]"
          >
            以上
          </span>
        </div>

        <p
          data-part="asof"
          className="mt-[14px] cursor-default font-jp text-[20px] leading-none tracking-[0.2em] text-white select-none md:motion-safe:opacity-0 lg:mt-[2.153cqw] lg:text-[1.389cqw]"
        >
          ※2026年9月現在
        </p>

        <div className="relative mt-[40px] flex h-20 w-[440px] items-center justify-center rounded-full lg:mt-[4.028cqw] lg:h-[6.667cqw] lg:w-[33.542cqw]">
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
            viewBox="0 0 483 96"
            preserveAspectRatio="none"
            overflow="visible"
          >
            {/* 左端中央から時計回りに一周描く（stroke クリップ回避で 1px 内側） */}
            <path
              data-part="stroke"
              d="M 1 48 A 47 47 0 0 1 48 1 H 435 A 47 47 0 0 1 482 48 A 47 47 0 0 1 435 95 H 48 A 47 47 0 0 1 1 48"
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={9999}
              strokeDashoffset={9999}
              className="motion-reduce:[stroke-dashoffset:0]"
            />
          </svg>
          <span
            data-part="btn-text"
            className="cursor-default font-jp text-[20px] leading-none tracking-[0.2em] text-white select-none md:motion-safe:opacity-0 lg:text-[1.667cqw]"
          >
            お問い合わせはこちらから
          </span>
          <span
            data-part="arrow"
            aria-hidden
            className="absolute right-8 flex h-[18px] w-[11px] items-center justify-center md:motion-safe:opacity-0 lg:right-[1.944cqw] lg:h-[1.25cqw] lg:w-[0.764cqw]"
          >
            {/* next/image は既定で SVG 不可のため img */}
            <img
              src={arrowSrc}
              alt=""
              width={11}
              height={18}
              className="size-full"
            />
          </span>
        </div>

        <p
          data-part="tip"
          className="mt-[14px] cursor-default text-center font-jp text-[16px] leading-none tracking-[0.2em] whitespace-nowrap text-white select-none md:motion-safe:opacity-0 lg:mt-[1.111cqw] lg:text-[1.111cqw]"
        >
          在庫のご確認・ご予約、などお気軽にご相談ください。
        </p>
      </div>
    </section>
  );
}
