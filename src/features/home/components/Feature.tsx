"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const assetDir = "/assets/pages/top/feature";
const enterLag = 1;
const cardDur = 0.7;
const cardStep = 0.15;
const movePx = 80;
const enterStart = "top 85%";
/** Card1 → Card4 で下方向の視差を強める（px） */
const shiftY = [20, 80, 140, 200];

type FeatCard = {
  title: string;
  src: string;
  alt: string;
};

const featCards: FeatCard[] = [
  {
    title: "曇りにくい",
    src: `${assetDir}/img_card-1.jpg`,
    alt: "曇りにくいレンズのFREE FiTをかけた横顔",
  },
  {
    title: "撥水加工",
    src: `${assetDir}/img_card-2.jpg`,
    alt: "撥水加工レンズに水滴が弾ける様子",
  },
  {
    title: "専用眼鏡ケース",
    src: `${assetDir}/img_card-3.jpg`,
    alt: "FREE FiTと専用眼鏡ケース",
  },
  {
    title: "偏光グラス交換",
    src: `${assetDir}/img_card-4.jpg`,
    alt: "偏光グラス交換用レンズとフレーム",
  },
];

export function Feature() {
  const rootRef = useRef<HTMLElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const cards = [...root.querySelectorAll<HTMLElement>("[data-card]")];
      const layers = [...root.querySelectorAll<HTMLElement>("[data-parallax]")];
      if (
        cards.length !== featCards.length ||
        layers.length !== featCards.length
      ) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cards, { y: 0, autoAlpha: 1 });
        gsap.set(layers, { y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(cards, { y: movePx, autoAlpha: 0 });
        gsap.to(cards, {
          y: 0,
          autoAlpha: 1,
          duration: cardDur,
          stagger: cardStep,
          delay: enterLag,
          ease: "power2.out",
          scrollTrigger: {
            trigger: root,
            start: enterStart,
            once: true,
          },
        });

        layers.forEach((layer, i) => {
          gsap.fromTo(
            layer,
            { y: 0 },
            {
              y: shiftY[i],
              ease: "none",
              immediateRender: true,
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-feature
      aria-labelledby="feature-title"
      className="relative w-full"
    >
      {/* sticky 眼鏡より下。コンテンツは z-60 で眼鏡の上 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-[#070707]"
      />
      <div className="@container relative z-60 mx-auto w-full max-w-360 pt-[4.306cqw]">
        <h2
          id="feature-title"
          className="flex cursor-default items-baseline justify-center font-jp text-white select-none"
        >
          <span className="text-[4.444cqw] leading-[1.2]">FREE FiT</span>
          <span className="ml-[0.833cqw] text-[3.333cqw] leading-[1.2]">の</span>
          <span className="ml-[0.972cqw] text-[4.444cqw] leading-[1.2]">
            特徴
          </span>
        </h2>
        <p className="mt-[1.319cqw] cursor-default text-center font-jp text-[1.667cqw] leading-[1.2] text-white select-none">
          湿気の多い日でも曇りにくい撥水加工レンズ
        </p>
        <ul className="mt-[3.542cqw] flex list-none gap-[1.667cqw] px-[8.333cqw] pb-[5.694cqw]">
          {featCards.map((card) => (
            <li
              key={card.title}
              className="relative h-[33.333cqw] min-w-0 basis-0 grow"
            >
              <div
                data-card
                className="size-full motion-safe:opacity-0"
              >
                <div
                  data-parallax
                  className="relative size-full overflow-hidden rounded-[1.736cqw]"
                >
                  <Image
                    src={card.src}
                    alt={card.alt}
                    width={423}
                    height={720}
                    sizes="(max-width: 1440px) 20vw, 282px"
                    className="size-full object-cover"
                  />
                  <p className="absolute top-[0.833cqw] left-[0.972cqw] z-10 flex h-[3.333cqw] w-[13.403cqw] cursor-default items-center justify-center rounded-[1.042cqw] bg-black/20 font-jp text-[1.389cqw] leading-[1.75] tracking-[0.139cqw] text-white select-none">
                    {card.title}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
