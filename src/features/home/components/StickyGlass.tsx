"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export const glassFrontImg = {
  src: "/assets/pages/top/hero/glass_front-normal.png",
  width: 620,
  height: 173,
} as const;

const coverBlur = "blur(12px)";
/** 縮小・追従の開始（Model 上端がこの位置に来たら） */
const moveStart = "top 95%";
/** 枠への吸着完了（normal 中心がビューポート中心） */
const moveEnd = "center center";
/** 一度渡したら、この進捗未満まで戻るまで sticky を復活させない */
const handoffLatch = 0.92;
const handoffRelease = 0.8;
/** Model 左右眼鏡の入場トリガ（吸着完了時に model 要素へ一度通知） */
export const modelHandoffEvent = "glassroom:model-handoff";

export function StickyGlass() {
  const rootRef = useRef<HTMLDivElement>(null);

  // GSAP は DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const el = rootRef.current;
      const stack = el?.closest("[data-page-stack]");
      if (!el || !(stack instanceof HTMLElement)) return;

      const fade = el.querySelector<HTMLElement>("[data-sticky-fade]");
      const feature = stack.querySelector<HTMLElement>("[data-feature]");
      const model = stack.querySelector<HTMLElement>("[data-model]");
      const normal = stack.querySelector<HTMLElement>("[data-model-normal]");
      const normalImg = stack.querySelector<HTMLElement>(
        "[data-model-normal-img]",
      );

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!fade) return;

        gsap.set(fade, {
          transformOrigin: "center center",
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 1,
        });
        if (normalImg) gsap.set(normalImg, { autoAlpha: 0 });

        // pin は Model 枠付近まで。受け渡し後もしばらく維持してから外す。
        const endTrigger = normal ?? model ?? stack;
        const pin = ScrollTrigger.create({
          trigger: el,
          endTrigger,
          start: "center center",
          end: normal ? "center center" : "bottom bottom",
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        });

        let blurTl: gsap.core.Timeline | null = null;
        if (feature && model) {
          gsap.set(fade, { filter: "blur(0px)" });
          blurTl = gsap
            .timeline({
              scrollTrigger: {
                trigger: feature,
                endTrigger: model,
                start: "top 70%",
                end: "top 55%",
                scrub: true,
              },
            })
            .fromTo(
              fade,
              { filter: "blur(0px)" },
              { filter: coverBlur, duration: 1, ease: "none" },
            )
            .to({}, { duration: 6 })
            .to(fade, { filter: "blur(0px)", duration: 1, ease: "none" });
        } else if (feature) {
          const funcDesign = stack.querySelector<HTMLElement>(
            "[data-func-design]",
          );
          if (funcDesign) {
            gsap.set(fade, { filter: "blur(0px)" });
            blurTl = gsap
              .timeline({
                scrollTrigger: {
                  trigger: feature,
                  endTrigger: funcDesign,
                  start: "top 70%",
                  end: "bottom top",
                  scrub: true,
                },
              })
              .fromTo(
                fade,
                { filter: "blur(0px)" },
                { filter: coverBlur, duration: 1, ease: "none" },
              )
              .to({}, { duration: 6 })
              .to(fade, { filter: "blur(0px)", duration: 1, ease: "none" });
          }
        }

        let moveSt: ScrollTrigger | null = null;
        let handed = false;

        const showSticky = () => {
          gsap.set(fade, { autoAlpha: 1 });
          if (normalImg) gsap.set(normalImg, { autoAlpha: 0 });
        };

        const showNormal = () => {
          gsap.set(fade, { autoAlpha: 0 });
          if (normalImg) gsap.set(normalImg, { autoAlpha: 1 });
        };

        const endScaleOf = () => {
          if (!normal) return 358 / glassFrontImg.width;
          const baseW = fade.offsetWidth || glassFrontImg.width;
          const slotW = normal.offsetWidth || 358;
          if (baseW <= 0) return 358 / glassFrontImg.width;
          return slotW / baseW;
        };

        const placeAt = (p: number) => {
          const scale = gsap.utils.interpolate(1, endScaleOf(), p);
          if (!normal || p <= 0) {
            gsap.set(fade, { x: 0, y: 0, scale });
            return;
          }
          // pin 根の中心（画面中央）から枠中心への差分を進捗で割る
          const base = el.getBoundingClientRect();
          const slot = normal.getBoundingClientRect();
          const dx = slot.left + slot.width / 2 - (base.left + base.width / 2);
          const dy = slot.top + slot.height / 2 - (base.top + base.height / 2);
          gsap.set(fade, { x: dx * p, y: dy * p, scale });
        };

        const syncHandoff = (p: number) => {
          if (!normalImg) return;
          if (!handed && p >= handoffLatch) {
            handed = true;
            showNormal();
            // Model 入場トリガ（属性は後マウント時の取りこぼし防止）
            model?.setAttribute("data-model-handed", "");
            model?.dispatchEvent(
              new CustomEvent(modelHandoffEvent, { bubbles: false }),
            );
            return;
          }
          if (handed && p < handoffRelease) {
            handed = false;
            model?.removeAttribute("data-model-handed");
            showSticky();
          }
        };

        if (model && normal) {
          moveSt = ScrollTrigger.create({
            trigger: model,
            start: moveStart,
            endTrigger: normal,
            end: moveEnd,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              if (handed && p >= handoffRelease) {
                // 受け渡し後は枠側を優先。sticky は隠したまま位置だけ最終へ
                placeAt(1);
                return;
              }
              placeAt(p);
              syncHandoff(p);
            },
            onRefresh: (self) => {
              const p = self.progress;
              if (handed) {
                placeAt(1);
                showNormal();
                return;
              }
              placeAt(p);
              syncHandoff(p);
            },
          });
        }

        return () => {
          blurTl?.scrollTrigger?.kill();
          blurTl?.kill();
          moveSt?.kill();
          pin.kill();
          gsap.set(fade, { clearProps: "transform,filter,opacity,visibility" });
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (!fade) return;
        gsap.set(fade, {
          filter: "none",
          scale: 1,
          x: 0,
          y: 0,
          autoAlpha: 0,
        });
        if (normalImg) gsap.set(normalImg, { autoAlpha: 1 });
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none relative z-30 mt-[30px] w-full max-w-[620px]"
    >
      {/* pin 本体と分離し、フェード／移動が pin の transform と干渉しないようにする */}
      <div data-sticky-fade className="w-full will-change-transform">
        <Image
          src={glassFrontImg.src}
          alt="眼鏡の正面"
          width={glassFrontImg.width}
          height={glassFrontImg.height}
          sizes="(min-width: 1024px) 620px, 100vw"
          priority
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
