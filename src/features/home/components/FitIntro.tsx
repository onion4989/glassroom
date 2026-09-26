"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const fitCopy =
  "軽い、ズレにくい、驚きのかけ心地”がテーマのFREE FiT（フリーフィット）。サイズ・フレーム・カラーともに眼鏡市場No.1のラインアップを誇り、多くのお客様に支持されるブランドから、シートメタルフロントタイプが登場しました。FFT-097は、男女問わずかけられる大きめサイズのオーバルタイプです。やわらかな形の玉型が自然に顔に馴染み、リム上部のカットで立体感と上質な印象を演出します。また、エッジの効いたテンプルがほどよく個性を表現し、横顔をすっきりと引き締めます。";

const fitTitle = "FREE FiT";

export function FitIntro() {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const shaftRef = useRef<HTMLSpanElement>(null);
  const stubRef = useRef<HTMLSpanElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      const play = (withLine: boolean) => {
        const title = titleRef.current;
        if (!title) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 85%",
            end: "top 35%",
            scrub: true,
          },
        });

        tl.fromTo(
          title,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.98, ease: "none" },
        );

        const dot = dotRef.current;
        const shaft = shaftRef.current;
        const stub = stubRef.current;
        if (!withLine || !dot || !shaft || !stub) return;

        tl.fromTo(
          dot,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.12,
            ease: "none",
            transformOrigin: "center center",
          },
          ">",
        );
        tl.fromTo(
          shaft,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.4,
            ease: "none",
            transformOrigin: "left center",
          },
          ">",
        );
        tl.fromTo(
          stub,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.18,
            ease: "none",
            transformOrigin: "left center",
          },
          ">",
        );
      };

      mm.add(
        "(prefers-reduced-motion: no-preference) and (max-width: 1023px)",
        () => play(false),
      );
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 1024px)",
        () => play(true),
      );
      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (titleRef.current) {
          gsap.set(titleRef.current, {
            clearProps: "transform,opacity,translate",
          });
        }
        const parts = [dotRef.current, shaftRef.current, stubRef.current].filter(
          (el) => el != null,
        );
        gsap.set(parts, { clearProps: "transform,opacity,scale" });
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} aria-labelledby="fit-intro-title" className="w-full">
      <div className="@container relative w-full lg:aspect-[1440/800]">
        <div className="relative aspect-[1440/800] w-full lg:absolute lg:inset-0">
          <Image
            src="/assets/pages/top/intro/img_top_intro-woman.jpg"
            alt="室内で微笑む女性"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="px-4 py-8 md:px-8 md:py-10 lg:contents">
          <h2
            id="fit-intro-title"
            className="font-jp text-[32px] leading-none whitespace-nowrap text-white md:text-[48px] lg:absolute lg:top-[9.5%] lg:left-[7.153%] lg:text-[6.667cqw] lg:text-black"
          >
            <span className="sr-only">{fitTitle}</span>
            <span
              ref={titleRef}
              aria-hidden="true"
              className="inline-block motion-safe:-translate-x-[50px] motion-safe:opacity-0"
            >
              {fitTitle}
            </span>
          </h2>
          <div
            aria-hidden
            className="mt-2 h-[2px] w-28 bg-white md:w-48 lg:absolute lg:top-[22.875%] lg:left-[7.708%] lg:mt-0 lg:w-[27.222%] lg:bg-black"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-[25%] left-[32.986%] hidden h-[6.667cqw] w-[5.347cqw] lg:block"
          >
            <span
              ref={dotRef}
              className="absolute top-0 left-0 aspect-square w-[12.987%] origin-center rounded-full bg-white lg:motion-safe:scale-0 lg:motion-safe:opacity-0"
            />
            <span className="absolute top-[5.729%] left-[6.494%] h-[2px] w-[129.521%] origin-left -translate-y-1/2 rotate-[63.832deg]">
              <span
                ref={shaftRef}
                className="block h-full w-full origin-left bg-white lg:motion-safe:scale-x-0"
              />
            </span>
            <span className="absolute top-[97.917%] left-[63.636%] h-[2px] w-[36.364%]">
              <span
                ref={stubRef}
                className="block h-full w-full origin-left bg-white lg:motion-safe:scale-x-0"
              />
            </span>
          </div>
          <p className="mt-6 font-jp text-[15px] leading-[1.8] tracking-[0.06em] text-white md:text-[16px] lg:absolute lg:top-[69%] lg:left-[8.333%] lg:mt-0 lg:h-[28%] lg:w-[83.333%] lg:rounded-[15px] lg:bg-black/50 lg:px-[3.681cqw] lg:pt-[2.222cqw] lg:text-[1.389cqw] lg:leading-[1.75] lg:tracking-[0.1em] lg:backdrop-blur-[12px]">
            {fitCopy}
          </p>
        </div>
      </div>
    </section>
  );
}
