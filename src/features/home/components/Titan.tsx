"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

const letterY = 50;
const letterStep = 0.03;
const letterDur = 0.6;
const letterLag = 0.8;
const upCount = 7;

const flameImg = {
  src: "/assets/pages/top/intro/img_glass-flame.png",
  width: 1167,
  height: 312,
} as const;

type TitanBit = {
  text: string;
  top: string;
  left: string;
  size: string;
  brand?: boolean;
  head?: boolean;
};

const titanBits: TitanBit[] = [
  {
    text: "形状記憶チタンフレーム",
    top: "top-[6.528cqw]",
    left: "left-[15.417cqw]",
    size: "text-[4.444cqw]",
    head: true,
  },
  {
    text: "圧倒的",
    top: "top-[13.056cqw]",
    left: "left-[35cqw]",
    size: "text-[3.333cqw]",
  },
  {
    text: "な",
    top: "top-[13.889cqw]",
    left: "left-[45.417cqw]",
    size: "text-[2.5cqw]",
  },
  {
    text: "軽さ",
    top: "top-[13.056cqw]",
    left: "left-[48.333cqw]",
    size: "text-[3.333cqw]",
  },
  {
    text: "わずか",
    top: "top-[12.986cqw]",
    left: "left-[55.417cqw]",
    size: "text-[3.333cqw]",
  },
  {
    text: "2",
    top: "top-[9.097cqw]",
    left: "left-[65.903cqw]",
    size: "text-[8.889cqw]",
    brand: true,
  },
  {
    text: "mg",
    top: "top-[12.986cqw]",
    left: "left-[71.806cqw]",
    size: "text-[3.333cqw]",
    brand: true,
  },
  {
    text: "仕事",
    top: "top-[38.75cqw]",
    left: "left-[17.708cqw]",
    size: "text-[4.444cqw]",
  },
  {
    text: "でも、",
    top: "top-[39.861cqw]",
    left: "left-[27.361cqw]",
    size: "text-[3.333cqw]",
  },
  {
    text: "普段の生活",
    top: "top-[38.75cqw]",
    left: "left-[36.736cqw]",
    size: "text-[4.444cqw]",
  },
  {
    text: "でも",
    top: "top-[39.861cqw]",
    left: "left-[59.722cqw]",
    size: "text-[3.333cqw]",
  },
  {
    text: "長時間",
    top: "top-[44.653cqw]",
    left: "left-[26.597cqw]",
    size: "text-[4.444cqw]",
  },
  {
    text: "掛けていても",
    top: "top-[45.764cqw]",
    left: "left-[40.833cqw]",
    size: "text-[3.333cqw]",
  },
  {
    text: "痛くならない",
    top: "top-[44.653cqw]",
    left: "left-[61.181cqw]",
    size: "text-[4.444cqw]",
  },
];

const bitClass = (bit: TitanBit) =>
  [
    "absolute cursor-default leading-none whitespace-nowrap text-white select-none",
    bit.brand ? "font-brand" : "font-jp",
    bit.top,
    bit.left,
    bit.size,
  ].join(" ");

export function Titan() {
  const rootRef = useRef<HTMLElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const held: gsap.core.Animation[] = [];
        const prep = (list: HTMLElement[]) =>
          list.flatMap((el) => {
            const split = SplitText.create(el, {
              type: "chars",
              tag: "span",
              aria: "auto",
            });
            if (!split.chars.length) return [];
            split.chars.forEach((ch) => {
              ch.style.display = "inline-block";
            });
            const rise = gsap.from(split.chars, {
              y: letterY,
              opacity: 0,
              stagger: letterStep,
              duration: letterDur,
              ease: "back.out(1.7)",
              paused: true,
              immediateRender: true,
            });
            held.push(rise);
            return [{ split, rise, count: split.chars.length }];
          });
        const upNodes = [
          ...root.querySelectorAll<HTMLElement>('[data-band="up"]'),
        ];
        const lowNodes = [
          ...root.querySelectorAll<HTMLElement>('[data-band="low"]'),
        ];
        const upParts = prep(upNodes);
        const lowParts = prep(lowNodes);
        const spanOf = (parts: { count: number }[]) => {
          const max = Math.max(0, ...parts.map((part) => part.count));
          return letterDur + letterStep * Math.max(0, max - 1);
        };
        const waits: gsap.core.Tween[] = [];
        let upDone = false;
        let lowSeen = false;
        let lowPlay = false;
        const stopWaits = () => {
          waits.forEach((tween) => tween.kill());
          waits.length = 0;
        };
        const park = () => {
          stopWaits();
          upDone = false;
          lowPlay = false;
          [...upParts, ...lowParts].forEach(({ rise }) => rise.pause(0));
        };
        const tryLow = () => {
          if (!upDone || !lowSeen || lowPlay) return;
          lowPlay = true;
          lowParts.forEach(({ rise }) => rise.play());
        };
        const lowIn = () => {
          const el = lowNodes[0];
          if (!el) return false;
          return el.getBoundingClientRect().top < window.innerHeight * 0.85;
        };
        const begin = () => {
          park();
          lowSeen = lowIn();
          const wait = gsap.delayedCall(letterLag, () => {
            upParts.forEach(({ rise }) => rise.play());
            const after = gsap.delayedCall(spanOf(upParts), () => {
              upDone = true;
              if (lowIn()) lowSeen = true;
              tryLow();
            });
            waits.push(after);
          });
          waits.push(wait);
        };
        ScrollTrigger.create({
          trigger: root,
          start: "top 85%",
          end: "bottom top",
          onEnter: begin,
          onEnterBack: begin,
          onLeave: park,
          onLeaveBack: park,
        });
        if (lowNodes[0]) {
          ScrollTrigger.create({
            trigger: lowNodes[0],
            start: "top 85%",
            onEnter: () => {
              lowSeen = true;
              tryLow();
            },
            onEnterBack: () => {
              lowSeen = true;
              tryLow();
            },
            onLeave: () => {
              lowSeen = false;
            },
            onLeaveBack: () => {
              lowSeen = false;
            },
          });
        }
        return () => {
          stopWaits();
          held.forEach((tween) => tween.kill());
          [...upParts, ...lowParts].forEach(({ split }) => split.revert());
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-titan
      aria-labelledby="titan-title"
      className="relative z-10 w-full bg-[#070707]"
    >
      <div className="@container relative mx-auto h-[55.556cqw] w-full max-w-360">
        {titanBits.map((bit, index) => {
          const className = `${bitClass(bit)}`;
          const band = index < upCount ? "up" : "low";
          if (bit.head) {
            return (
              <h2
                key={bit.text}
                id="titan-title"
                data-band={band}
                className={className}
              >
                {bit.text}
              </h2>
            );
          }
          return (
            <p key={bit.text} data-band={band} className={className}>
              {bit.text}
            </p>
          );
        })}
        <Image
          src={flameImg.src}
          alt="横から見た紫のチタンフレーム"
          width={flameImg.width}
          height={flameImg.height}
          sizes="(min-width: 1440px) 778px, 54vw"
          className="pointer-events-none absolute top-[19.861cqw] left-[20.833cqw] h-[14.444cqw] w-[54.028cqw] object-contain"
        />
      </div>
    </section>
  );
}
