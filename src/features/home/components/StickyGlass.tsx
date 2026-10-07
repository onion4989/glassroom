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
/** FuncDesign 吸着完了／解除（detail.docked） */
export const funcDockEvent = "glassroom:func-dock";

/** FuncDesign 中央 box: 入り込み完了〜吸着の進捗帯 */
const dockEnterEnd = 0.28;
const dockHoldEnd = 0.72;
const dockLatch = 0.24;
const dockRelease = 0.76;
/** イベント解除（入り込み途中まで戻ったら） */
const dockEventRelease = 0.12;
/** box 内眼鏡の静止 y（FuncDesign と揃える） */
const dockRestY = 50;
const dockEnterScale = 1.22;
const dockEjectScale = 1.18;
const dockEjectY = -72;
/** 中央吸着の短い pin（Titan と同型） */
const dockDwell = "+=40%";

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
      const funcDock = stack.querySelector<HTMLElement>("[data-func-dock]");
      const funcGlass = stack.querySelector<HTMLElement>("[data-func-glass]");

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
        if (funcGlass) {
          gsap.set(funcGlass, {
            transformOrigin: "center center",
            y: dockRestY,
            scale: 1,
            autoAlpha: 0,
          });
        }

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
        // Feature 通過中にぼかし、FuncDesign 吸着の前に戻す（Model だけのときは従来）。
        if (feature && (funcDock || model)) {
          gsap.set(fade, { filter: "blur(0px)" });
          blurTl = gsap
            .timeline({
              scrollTrigger: {
                trigger: feature,
                endTrigger: funcDock ?? model ?? undefined,
                start: "top 70%",
                end: funcDock ? "center 80%" : "top 55%",
                scrub: true,
              },
            })
            .fromTo(
              fade,
              { filter: "blur(0px)" },
              { filter: coverBlur, duration: 1, ease: "none" },
            )
            .to({}, { duration: funcDock ? 3 : 6 })
            .to(fade, { filter: "blur(0px)", duration: 1, ease: "none" });
        } else if (feature && funcDesign) {
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

        let moveSt: ScrollTrigger | null = null;
        let dockSt: ScrollTrigger | null = null;
        let dockPin: ScrollTrigger | null = null;
        let handed = false;
        let docked = false;
        let dockFired = false;

        const showSticky = () => {
          gsap.set(fade, { autoAlpha: 1 });
          if (normalImg) gsap.set(normalImg, { autoAlpha: 0 });
        };

        const showNormal = () => {
          gsap.set(fade, { autoAlpha: 0 });
          if (normalImg) gsap.set(normalImg, { autoAlpha: 1 });
        };

        const syncDockEvent = (p: number) => {
          if (!funcDesign) return;
          if (!dockFired && p >= dockLatch) {
            dockFired = true;
            funcDesign.setAttribute("data-func-docked", "");
            funcDesign.dispatchEvent(
              new CustomEvent(funcDockEvent, {
                bubbles: false,
                detail: { docked: true },
              }),
            );
            return;
          }
          if (dockFired && p < dockEventRelease) {
            dockFired = false;
            funcDesign.removeAttribute("data-func-docked");
            funcDesign.dispatchEvent(
              new CustomEvent(funcDockEvent, {
                bubbles: false,
                detail: { docked: false },
              }),
            );
          }
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
            if (!docked) showSticky();
          }
        };

        const placeDock = (p: number) => {
          if (!funcGlass || handed) return;

          if (p <= 0) {
            docked = false;
            syncDockEvent(0);
            gsap.set(funcGlass, {
              y: dockRestY,
              scale: dockEnterScale,
              autoAlpha: 0,
            });
            if (!handed) {
              gsap.set(fade, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
            }
            return;
          }

          if (p < dockEnterEnd) {
            const t = p / dockEnterEnd;
            const ease = gsap.parseEase("power2.out")(t);
            docked = p >= dockLatch;
            syncDockEvent(p);
            gsap.set(funcGlass, {
              y: gsap.utils.interpolate(0, dockRestY, ease),
              scale: gsap.utils.interpolate(dockEnterScale, 1, ease),
              autoAlpha: ease,
            });
            // filter は blurTl 専任（ここだと上スクロール時にぼかしを潰す）
            gsap.set(fade, {
              autoAlpha: 1 - ease,
              x: 0,
              y: 0,
              scale: 1,
            });
            return;
          }

          if (p < dockHoldEnd) {
            docked = true;
            syncDockEvent(p);
            gsap.set(funcGlass, {
              y: dockRestY,
              scale: 1,
              autoAlpha: 1,
            });
            gsap.set(fade, {
              autoAlpha: 0,
              x: 0,
              y: 0,
              scale: 1,
            });
            return;
          }

          const t = (p - dockHoldEnd) / (1 - dockHoldEnd);
          const ease = gsap.parseEase("power2.in")(t);
          docked = p < dockRelease;
          // 弾き出し中も detail 入場は維持（解除は上スクロールで入り込み前に戻ったとき）
          syncDockEvent(p);
          gsap.set(funcGlass, {
            y: gsap.utils.interpolate(dockRestY, dockEjectY, ease),
            scale: gsap.utils.interpolate(1, dockEjectScale, ease),
            autoAlpha: 1 - ease,
          });
          if (!handed) {
            gsap.set(fade, {
              autoAlpha: ease,
              x: 0,
              y: 0,
              scale: 1,
            });
          }
        };

        if (funcDock && funcGlass) {
          // 中央 box が画面中央を通過する前後で、入り→吸着→弾き出し。
          dockSt = ScrollTrigger.create({
            trigger: funcDock,
            start: "center 80%",
            end: "center 20%",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              placeDock(self.progress);
            },
            onRefresh: (self) => {
              placeDock(self.progress);
            },
          });
        }

        // 吸着中は section を短く止め、見出しと box の相対位置を固定する。
        if (funcDock && funcDesign) {
          dockPin = ScrollTrigger.create({
            trigger: funcDock,
            start: "center center",
            end: dockDwell,
            pin: funcDesign,
            pinSpacing: true,
            anticipatePin: 1,
          });
        }

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
              if (docked && p < handoffRelease) {
                // FuncDesign 吸着中は Model 追従を始めない
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
              if (docked) return;
              placeAt(p);
              syncHandoff(p);
            },
          });
        }

        return () => {
          blurTl?.scrollTrigger?.kill();
          blurTl?.kill();
          dockPin?.kill();
          dockSt?.kill();
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
        if (funcGlass) {
          gsap.set(funcGlass, {
            y: dockRestY,
            scale: 1,
            autoAlpha: 1,
          });
        }
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
