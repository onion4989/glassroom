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

export function Sales() {
  const rootRef = useRef<HTMLElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const label = root.querySelector<HTMLElement>("[data-part='label']");
      const count = root.querySelector<HTMLElement>("[data-part='count']");
      const suffix = root.querySelector<HTMLElement>("[data-part='suffix']");
      const asOf = root.querySelector<HTMLElement>("[data-part='asof']");
      const stroke = root.querySelector<SVGPathElement>("[data-part='stroke']");
      const btnText = root.querySelector<HTMLElement>("[data-part='btn-text']");
      const arrow = root.querySelector<HTMLElement>("[data-part='arrow']");
      const tip = root.querySelector<HTMLElement>("[data-part='tip']");
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
        return;
      }

      const unit = () => (root.clientWidth || artBase) / artBase;
      const mm = gsap.matchMedia();
      const countObj = { val: 0 };
      const strokeLen = stroke.getTotalLength();

      const writeCount = (n: number) => {
        count.textContent = Math.round(n).toLocaleString("en-US");
      };

      const hideStroke = () => {
        gsap.set(stroke, {
          strokeDasharray: strokeLen,
          strokeDashoffset: strokeLen,
        });
      };

      const showStroke = () => {
        gsap.set(stroke, {
          strokeDasharray: strokeLen,
          strokeDashoffset: 0,
        });
      };

      mm.add("(prefers-reduced-motion: reduce)", () => {
        writeCount(countEnd);
        gsap.set([label, suffix, asOf, btnText, arrow, tip], {
          autoAlpha: 1,
          x: 0,
          y: 0,
        });
        showStroke();
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let wait: gsap.core.Tween | null = null;
        let play: gsap.core.Timeline | null = null;

        const reset = () => {
          wait?.kill();
          wait = null;
          play?.kill();
          play = null;
          countObj.val = 0;
          writeCount(0);
          gsap.set(label, { autoAlpha: 0, y: labelRise * unit() });
          gsap.set(suffix, { autoAlpha: 0, x: -suffixSlide * unit() });
          gsap.set(asOf, { autoAlpha: 0, y: -noteDrop * unit() });
          gsap.set(btnText, { autoAlpha: 0 });
          gsap.set(arrow, { autoAlpha: 0, x: -arrowSlide * unit() });
          gsap.set(tip, { autoAlpha: 0, x: -tipSlide * unit() });
          hideStroke();
        };

        const begin = () => {
          if (play || wait) return;
          wait = gsap.delayedCall(enterLag, () => {
            const tl = gsap.timeline();
            play = tl;

            tl.to(label, {
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
              suffix,
              {
                autoAlpha: 1,
                x: 0,
                duration: fadeDur,
                ease: "power2.out",
              },
              ">",
            );

            tl.to(
              asOf,
              {
                autoAlpha: 1,
                y: 0,
                duration: fadeDur,
                ease: "power2.out",
              },
              "<0.1",
            );

            tl.to(
              stroke,
              {
                strokeDashoffset: 0,
                duration: edgeDur,
                ease: "power1.inOut",
              },
              ">-0.05",
            );

            tl.to(
              btnText,
              {
                autoAlpha: 1,
                duration: fadeDur,
                ease: "power2.out",
              },
              ">",
            );

            tl.to(
              arrow,
              {
                autoAlpha: 1,
                x: 0,
                duration: fadeDur,
                ease: "power2.out",
              },
              ">",
            );

            tl.to(
              tip,
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
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-sales
      aria-labelledby="sales-title"
      className="relative z-10 w-full overflow-hidden bg-[#070707]"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-x-0 top-0 z-[1]"
          style={{
            height: edgeFade,
            background: `linear-gradient(to bottom, ${backTone}, transparent)`,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 z-[1]"
          style={{
            height: edgeFade,
            background: `linear-gradient(to top, ${backTone}, transparent)`,
          }}
        />
      </div>
      <div className="@container relative z-10 mx-auto flex w-full max-w-360 flex-col items-center px-[8.333cqw] py-[8.333cqw]">
        <h2
          id="sales-title"
          data-part="label"
          className="cursor-default font-jp text-[2.5cqw] leading-none tracking-[0.08em] text-white select-none motion-safe:opacity-0"
        >
          累計販売本数
        </h2>

        <div className="mt-[2.778cqw] flex items-start justify-center gap-[0.694cqw]">
          <p
            data-part="count"
            className="cursor-default font-brand text-[10.417cqw] leading-none font-bold tracking-[0.02em] text-white tabular-nums select-none"
          >
            0
          </p>
          <span
            data-part="suffix"
            className="mt-[1.389cqw] cursor-default font-jp text-[1.667cqw] leading-none text-white select-none motion-safe:opacity-0"
          >
            以上
          </span>
        </div>

        <p
          data-part="asof"
          className="mt-[1.736cqw] cursor-default font-jp text-[1.25cqw] leading-none text-white select-none motion-safe:opacity-0"
        >
          ※2026年9月現在
        </p>

        <a
          href="#"
          className="relative mt-[4.167cqw] flex h-[4.167cqw] w-[27.778cqw] items-center justify-center rounded-full"
        >
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full"
            viewBox="0 0 400 60"
            preserveAspectRatio="none"
          >
            {/* 左端中央から時計回りに一周描く */}
            <path
              data-part="stroke"
              d="M 0.5 30 A 29.5 29.5 0 0 1 30 0.5 H 370 A 29.5 29.5 0 0 1 399.5 30 A 29.5 29.5 0 0 1 370 59.5 H 30 A 29.5 29.5 0 0 1 0.5 30"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={9999}
              strokeDashoffset={9999}
              className="motion-reduce:[stroke-dashoffset:0]"
            />
          </svg>
          <span
            data-part="btn-text"
            className="cursor-pointer font-jp text-[1.389cqw] leading-none tracking-[0.06em] text-white select-none motion-safe:opacity-0"
          >
            お問い合わせはこちらから
          </span>
          <span
            data-part="arrow"
            aria-hidden
            className="absolute right-[1.736cqw] font-jp text-[1.389cqw] leading-none text-white motion-safe:opacity-0"
          >
            &gt;
          </span>
        </a>

        <p
          data-part="tip"
          className="mt-[2.778cqw] cursor-default text-center font-jp text-[1.25cqw] leading-[1.6] text-white select-none motion-safe:opacity-0"
        >
          在庫のご確認・ご予約、などお気軽にご相談ください。
        </p>
      </div>
    </section>
  );
}
