"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  glassFrontImg,
  glassFrontSizes,
} from "@/features/home/data/glass-front";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export { glassFrontImg, glassFrontSizes };

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
/** FuncDesign 吸着完了／解除（detail.docked） */
export const funcDockEvent = "glassroom:func-dock";

/** box 内眼鏡の静止 y（FuncDesign と揃える） */
const dockRestY = 50;
/** 入場ブラー完了（FuncDesign 上端） */
const blurInEnd = "top 75%";
/** 退場でブラーを戻す */
const blurOutStart = "bottom 50%";
const blurOutEnd = "bottom top";

/** モバイル眼鏡が留まるビューポート上の位置。pin 前は自然位置 */
export const spGlassLine = (edge: "top" | "center") => {
  const fade = document.querySelector<HTMLElement>("[data-sticky-fade]");
  const root = fade?.parentElement ?? null;
  if (!fade || !root) return 0;
  const host =
    root.parentElement?.classList.contains("pin-spacer")
      ? root.parentElement
      : root;
  const scroll = window.scrollY || document.documentElement.scrollTop || 0;
  const top = host.getBoundingClientRect().top + scroll;
  if (edge === "top") return top;
  return top + fade.offsetHeight / 2;
};

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
      const funcDesign = stack.querySelector<HTMLElement>("[data-func-design]");
      const funcGlass = stack.querySelector<HTMLElement>("[data-func-glass]");

      const mm = gsap.matchMedia();

      // Tablet: Hero 自然位置から pin。FitIntro 通過 / Titan 最終。
      // 吸着中はブラーなし・位置固定。退場は不透明度のみ→非表示→pin 解除。
      mm.add(
        "(min-width: 768px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          if (!fade) return;
          const titan = stack.querySelector<HTMLElement>("[data-titan]");

          gsap.set(fade, {
            transformOrigin: "center center",
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1,
            filter: "blur(0px)",
          });
          gsap.set(el, { zIndex: 20 });
          if (normalImg) gsap.set(normalImg, { autoAlpha: 1 });

          const pin = ScrollTrigger.create({
            trigger: el,
            start: () => `top ${Math.round(spGlassLine("top"))}px`,
            endTrigger: titan ?? el,
            // 退場フェード完了より後まで pin（解除＝上ジャンプ）
            end: titan ? "bottom top-=120" : "bottom bottom",
            pin: true,
            pinSpacing: false,
            anticipatePin: 0,
            invalidateOnRefresh: true,
          });

          let exitTl: gsap.core.Timeline | null = null;
          if (titan) {
            // セクションがほぼ画面外に出てから消す（吸着中は触らない）
            exitTl = gsap.timeline({
              scrollTrigger: {
                trigger: titan,
                start: "bottom 20%",
                end: "bottom top-=80",
                scrub: true,
                invalidateOnRefresh: true,
                onLeave: () => {
                  gsap.set(fade, {
                    autoAlpha: 0,
                    filter: "blur(0px)",
                    x: 0,
                    y: 0,
                  });
                  gsap.set(el, { display: "none" });
                },
                onEnterBack: () => {
                  gsap.set(el, { display: "block" });
                  gsap.set(fade, {
                    autoAlpha: 1,
                    filter: "blur(0px)",
                    x: 0,
                    y: 0,
                  });
                },
              },
            });
            // ブラーなし。位置も動かさない
            exitTl.fromTo(
              fade,
              { autoAlpha: 1, filter: "blur(0px)", x: 0, y: 0 },
              {
                autoAlpha: 0,
                filter: "blur(0px)",
                x: 0,
                y: 0,
                ease: "none",
              },
            );
          }

          return () => {
            exitTl?.scrollTrigger?.kill();
            exitTl?.kill();
            pin.kill();
            gsap.set(el, { clearProps: "zIndex,display" });
            gsap.set(fade, {
              clearProps: "transform,filter,opacity,visibility",
            });
          };
        },
      );

      mm.add(
        "(min-width: 768px) and (max-width: 1023px) and (prefers-reduced-motion: reduce)",
        () => {
          if (!fade) return;
          gsap.set(fade, {
            filter: "none",
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1,
          });
          if (normalImg) gsap.set(normalImg, { autoAlpha: 1 });
        },
      );

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
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
        let blurOutTw: gsap.core.Tween | null = null;
        // Feature でぼかし、FuncDesign 通過中は維持。退場区間で戻す。
        if (feature && funcDesign) {
          gsap.set(fade, { filter: "blur(0px)", autoAlpha: 1, scale: 1 });
          blurTl = gsap.timeline({
            scrollTrigger: {
              trigger: feature,
              endTrigger: funcDesign,
              start: "top 70%",
              end: blurInEnd,
              scrub: true,
            },
          }).fromTo(
            fade,
            { filter: "blur(0px)" },
            { filter: coverBlur, ease: "none" },
          );
          blurOutTw = gsap.fromTo(
            fade,
            { filter: coverBlur },
            {
              filter: "blur(0px)",
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: funcDesign,
                start: blurOutStart,
                end: blurOutEnd,
                scrub: true,
              },
            },
          );
        } else if (feature && model) {
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
          blurOutTw?.scrollTrigger?.kill();
          blurOutTw?.kill();
          blurTl?.scrollTrigger?.kill();
          blurTl?.kill();
          moveSt?.kill();
          pin.kill();
          gsap.set(fade, { clearProps: "transform,filter,opacity,visibility" });
          if (funcGlass) {
            gsap.set(funcGlass, {
              clearProps: "transform,opacity,visibility",
            });
          }
        };
      });

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: reduce)", () => {
        if (!fade) return;
        gsap.set(fade, {
          filter: "none",
          scale: 1,
          x: 0,
          y: 0,
          autoAlpha: 0,
        });
        if (normalImg) gsap.set(normalImg, { autoAlpha: 1 });
        if (funcGlass) {
          gsap.set(funcGlass, {
            y: dockRestY,
            scale: 1,
            autoAlpha: 1,
          });
        }
      });

      // モバイル: Titan 退場で Sticky を消す。FuncDesign は箱の中だけ。
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        if (!fade) return;

        const spDock = stack.querySelector<HTMLElement>("[data-sp-func-dock]");
        const spGlass = stack.querySelector<HTMLElement>("[data-sp-func-glass]");
        const titan = stack.querySelector<HTMLElement>("[data-titan]");

        gsap.set(fade, {
          transformOrigin: "center center",
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 1,
          filter: "blur(0px)",
        });
        gsap.set(el, { zIndex: 20 });
        if (spGlass) {
          gsap.set(spGlass, {
            transformOrigin: "center center",
            y: 0,
            scale: 1,
            autoAlpha: 0,
          });
        }

        let boxIn: gsap.core.Tween | null = null;
        if (spDock && spGlass) {
          const fromY = spDock.offsetHeight / 2 + spGlass.offsetHeight / 2;
          gsap.set(spGlass, { y: fromY, autoAlpha: 0 });
          boxIn = gsap.to(spGlass, {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: spDock,
              start: "center center",
              once: true,
            },
          });
        }

        const pin = ScrollTrigger.create({
          trigger: el,
          start: () => `top ${Math.round(spGlassLine("top"))}px`,
          endTrigger: titan ?? el,
          // Titan の pin 余白 120px 分、見た目の下端より先に進む
          end: titan ? "bottom top-=420" : "bottom bottom",
          pin: true,
          pinSpacing: false,
          anticipatePin: 0,
        });

        let exitTl: gsap.core.Timeline | null = null;
        if (titan) {
          exitTl = gsap.timeline({
            scrollTrigger: {
              trigger: titan,
              start: "bottom top-=120",
              end: "bottom top-=420",
              scrub: true,
              onLeave: () => {
                gsap.set(el, { display: "none" });
              },
              onEnterBack: () => {
                gsap.set(el, { display: "block" });
              },
            },
          });
          exitTl.fromTo(
            fade,
            { filter: "blur(0px)", autoAlpha: 1 },
            { filter: coverBlur, autoAlpha: 0, ease: "none" },
          );
        }

        return () => {
          exitTl?.scrollTrigger?.kill();
          exitTl?.kill();
          boxIn?.scrollTrigger?.kill();
          boxIn?.kill();
          pin.kill();
          gsap.set(el, { clearProps: "zIndex,display" });
          gsap.set(fade, { clearProps: "transform,filter,opacity,visibility" });
          if (spGlass) {
            gsap.set(spGlass, { clearProps: "transform,opacity,visibility" });
          }
        };
      });

      mm.add("(max-width: 767px) and (prefers-reduced-motion: reduce)", () => {
        if (!fade) return;
        const spGlass = stack.querySelector<HTMLElement>("[data-sp-func-glass]");
        gsap.set(fade, {
          filter: "none",
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 1,
        });
        if (spGlass) gsap.set(spGlass, { autoAlpha: 0 });
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none relative z-30 mt-0 w-[236px] md:mt-0 md:w-[400px] lg:mt-[30px] lg:w-full lg:max-w-[620px]"
    >
      {/* pin 本体と分離し、フェード／移動が pin の transform と干渉しないようにする */}
      <div data-sticky-fade className="w-full will-change-transform">
        <Image
          src={glassFrontImg.src}
          alt="眼鏡の正面"
          width={glassFrontImg.width}
          height={glassFrontImg.height}
          sizes={glassFrontSizes}
          quality={70}
          priority
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
