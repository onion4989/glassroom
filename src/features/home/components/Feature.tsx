"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const assetDir = "/assets/pages/top/feature";
const cardDur = 0.6;
const cardFromY = 40;
const enterStart = "top 80%";
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

      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
        gsap.set(cards, { y: 0, autoAlpha: 1 });
        gsap.set(layers, { y: 0 });
      });

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: cardFromY },
            {
              opacity: 1,
              y: 0,
              duration: cardDur,
              scrollTrigger: {
                trigger: card,
                start: enterStart,
              },
            },
          );
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
      <div className="@container relative z-60 mx-auto flex w-full max-w-360 flex-col items-center gap-[15px] px-5 py-10 md:block md:gap-0 md:px-8 md:py-[100px] lg:px-0 lg:py-0 lg:pt-[4.306cqw]">
        <h2
          id="feature-title"
          className="flex cursor-default items-baseline justify-center font-jp text-white select-none"
        >
          <span className="text-[32px] leading-none md:text-[48px] md:leading-[1.2] lg:text-[4.444cqw]">
            FREE FiT
          </span>
          <span className="ml-[5px] text-[24px] leading-none md:ml-2 md:text-[32px] md:leading-[1.2] lg:ml-[0.833cqw] lg:text-[3.333cqw]">
            の
          </span>
          <span className="ml-[5px] text-[32px] leading-none md:ml-2 md:text-[48px] md:leading-[1.2] lg:ml-[0.972cqw] lg:text-[4.444cqw]">
            特徴
          </span>
        </h2>
        <p className="cursor-default text-center font-jp text-[16px] leading-none text-white select-none md:mt-[13px] md:text-[24px] md:leading-[1.2] lg:mt-[1.319cqw] lg:text-[1.667cqw]">
          湿気の多い日でも曇りにくい撥水加工レンズ
        </p>
        <ul className="grid w-full list-none grid-cols-2 gap-x-[10px] gap-y-3 md:mt-[34px] md:flex md:gap-5 md:px-0 md:pb-0 lg:mt-[3.542cqw] lg:gap-[1.667cqw] lg:px-[8.333cqw] lg:pb-[5.694cqw]">
          {featCards.map((card) => (
            <li
              key={card.title}
              className="relative h-[160px] min-w-0 md:h-[250px] md:w-[161px] md:grow-0 md:basis-[161px] lg:h-[33.333cqw] lg:w-auto lg:basis-0 lg:grow"
            >
              <div
                data-card
                className="size-full md:motion-safe:opacity-0"
              >
                <div
                  data-parallax
                  className="relative size-full overflow-hidden rounded-[15px] md:rounded-[14.667px] lg:rounded-[1.736cqw]"
                >
                  <Image
                    src={card.src}
                    alt={card.alt}
                    width={423}
                    height={720}
                    sizes="(max-width: 767px) 45vw, (max-width: 1023px) 161px, (max-width: 1440px) 20vw, 282px"
                    className="size-full object-cover"
                  />
                  <p className="absolute top-2 right-2 left-2 z-10 flex h-[31px] cursor-default items-center rounded-[5px] bg-black/20 px-3 font-jp text-[14px] leading-none tracking-[0.1em] text-white select-none md:top-[9px] md:right-auto md:left-[10px] md:h-[25px] md:w-[110px] md:justify-center md:rounded-[8.8px] md:px-0 md:text-[12px] md:leading-none lg:top-[0.833cqw] lg:left-[0.972cqw] lg:h-[3.333cqw] lg:w-[13.403cqw] lg:rounded-[1.042cqw] lg:text-[1.389cqw] lg:leading-[1.75] lg:tracking-[0.139cqw]">
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
