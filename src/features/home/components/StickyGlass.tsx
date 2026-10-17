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

/** FuncDesign 中央 box: スライド完了後の吸着 */
const dockHoldEnd = 0.72;
/** 抜け際のうち、box 内を下へ出す割合。残りで Sticky が戻る */
const exitDrop = 0.5;
/** イベント解除（入り込み途中まで戻ったら） */
const dockEventRelease = 0.12;
/** box 内眼鏡の静止 y（FuncDesign と揃える） */
const dockRestY = 50;
/** 透明になった位置から定位置までの進捗幅 */
const slideSpan = 0.2;
/** 眼鏡中心が box 上端からこの割合で透明。中央は 0.5 */
const fadeRel = 0.4;
/** 吸着維持の直前でスライドを終える */
const slideHoldGap = 0.04;
/** 中央吸着の短い pin（Titan と同型） */
const dockDwell = "+=40%";

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
      const funcDock = stack.querySelector<HTMLElement>("[data-func-dock]");
      const funcGlass = stack.querySelector<HTMLElement>("[data-func-glass]");

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
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

        // 眼鏡中心が box 高さの fadeRel に来る進捗（中央より少し上）。
        const fadeEndP = () => {
          const vh = window.innerHeight || 1;
          const boxH = funcDock?.offsetHeight ?? 0;
          const raw = (0.3 + (fadeRel - 0.5) * (boxH / vh)) / 0.6;
          const maxP = dockHoldEnd - slideHoldGap - slideSpan;
          return gsap.utils.clamp(0.05, Math.max(0.05, maxP), raw);
        };

        const slideEndP = () =>
          Math.min(fadeEndP() + slideSpan, dockHoldEnd - slideHoldGap);

        const fitScale = () => {
          if (!funcDock) return 1;
          const boxW = funcDock.offsetWidth || 1;
          const boxH = funcDock.offsetHeight || 1;
          const glassW = fade.offsetWidth || 1;
          const glassH = fade.offsetHeight || 1;
          return Math.min(1, boxW / glassW, boxH / glassH);
        };

        const slideFromY = () => {
          if (!funcDock || !funcGlass) return dockRestY;
          const boxH = funcDock.offsetHeight;
          const glassH = funcGlass.offsetHeight;
          return boxH / 2 + glassH / 2;
        };

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
        // Feature 通過中にぼかす。FuncDesign では覆いまで placeDock が維持する。
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
            .to({}, { duration: 6 });
          if (!funcDock) {
            blurTl.to(fade, { filter: "blur(0px)", duration: 1, ease: "none" });
          }
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

        const syncDockEvent = (p: number, latch: number) => {
          if (!funcDesign) return;
          if (!dockFired && p >= latch) {
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

          const fromY = slideFromY();
          const fadeEnd = fadeEndP();
          const slideEnd = slideEndP();
          const span = Math.max(slideEnd - fadeEnd, 0.001);
          const fit = fitScale();
          // 透明になるまでぼかす。上スクロールで p<=0 に戻ったら blurTl に返す。
          if (p > 0) {
            gsap.set(fade, {
              filter: p < fadeEnd ? coverBlur : "blur(0px)",
            });
          }

          if (p <= 0) {
            docked = false;
            syncDockEvent(0, slideEnd);
            gsap.set(funcGlass, {
              y: fromY,
              scale: 1,
              autoAlpha: 0,
            });
            if (!handed) {
              gsap.set(fade, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
            }
            return;
          }

          if (p < fadeEnd) {
            const t = p / Math.max(fadeEnd, 0.001);
            docked = true;
            syncDockEvent(p, slideEnd);
            gsap.set(funcGlass, {
              y: fromY,
              scale: 1,
              autoAlpha: 0,
            });
            if (!handed) {
              gsap.set(fade, {
                autoAlpha: 1 - t,
                x: 0,
                y: 0,
                scale: gsap.utils.interpolate(1, fit, t),
              });
            }
            return;
          }

          if (p < slideEnd) {
            const t = (p - fadeEnd) / span;
            const ease = gsap.parseEase("power2.out")(t);
            docked = true;
            syncDockEvent(p, slideEnd);
            gsap.set(funcGlass, {
              y: gsap.utils.interpolate(fromY, dockRestY, ease),
              scale: 1,
              autoAlpha: 1,
            });
            gsap.set(fade, {
              autoAlpha: 0,
              x: 0,
              y: 0,
              scale: fit,
            });
            return;
          }

          if (p < dockHoldEnd) {
            docked = true;
            syncDockEvent(p, slideEnd);
            gsap.set(funcGlass, {
              y: dockRestY,
              scale: 1,
              autoAlpha: 1,
            });
            gsap.set(fade, {
              autoAlpha: 0,
              x: 0,
              y: 0,
              scale: fit,
            });
            return;
          }

          const dropEnd = dockHoldEnd + (1 - dockHoldEnd) * exitDrop;
          syncDockEvent(p, slideEnd);
          if (p < dropEnd) {
            const t = (p - dockHoldEnd) / Math.max(dropEnd - dockHoldEnd, 0.001);
            const ease = gsap.parseEase("power2.in")(t);
            docked = true;
            gsap.set(funcGlass, {
              y: gsap.utils.interpolate(dockRestY, fromY, ease),
              scale: 1,
              autoAlpha: 1,
            });
            gsap.set(fade, {
              autoAlpha: 0,
              x: 0,
              y: 0,
              scale: fit,
            });
            return;
          }

          const t = (p - dropEnd) / Math.max(1 - dropEnd, 0.001);
          const ease = gsap.parseEase("power2.out")(Math.min(t, 1));
          docked = ease < 1;
          gsap.set(funcGlass, {
            y: fromY,
            scale: 1,
            autoAlpha: 0,
          });
          if (!handed) {
            gsap.set(fade, {
              autoAlpha: ease,
              x: 0,
              y: 0,
              scale: gsap.utils.interpolate(fit, 1, ease),
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

      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
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
      className="pointer-events-none relative z-30 mt-0 w-[236px] md:mt-[30px] md:w-full md:max-w-[620px]"
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
