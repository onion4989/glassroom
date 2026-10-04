"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

const letterY = 50;
const letterStep = 0.03;
const letterDur = 0.6;
const videoLag = 0.3;
const smokeRate = 1;
const letterLag = 0.5;
const upCount = 7;
const showLowCopy = false;
const showEdgeFade = true;
const edgeFade = 120;
/** 上帯テキストを下へずらす量（cqw）。0 で元位置に戻せる */
const upTextShift = 11.5;
const smokeSrc = "/assets/pages/top/titan/mv_smoke_loop.mp4";
const cellStep = 6;
const screenDeg = 22;
const inkTone = "210, 210, 220";
const backTone = "#070707";

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

function fitCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
  // 網点は解像度より密度が効くので 1x に固定する
  // 表示サイズは CSS（inset-0）に任せ、bitmap だけ合わせる
  const pxW = Math.max(1, Math.round(w));
  const pxH = Math.max(1, Math.round(h));
  if (canvas.width !== pxW || canvas.height !== pxH) {
    canvas.width = pxW;
    canvas.height = pxH;
  }
}

function paintScreen(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  samp: HTMLCanvasElement,
) {
  // inline 固定幅だとリサイズ後に clientWidth が古いままになるため親を測る
  const box = canvas.parentElement;
  if (!box) return;
  const w = box.clientWidth;
  const h = box.clientHeight;
  if (w < 2 || h < 2 || video.readyState < 2) return;

  fitCanvas(canvas, w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const step = cellStep;
  const cols = Math.max(1, Math.ceil(w / step));
  const rows = Math.max(1, Math.ceil(h / step));
  samp.width = cols;
  samp.height = rows;
  const sampCtx = samp.getContext("2d", { willReadFrequently: true });
  if (!sampCtx) return;

  sampCtx.drawImage(video, 0, 0, cols, rows);
  const pix = sampCtx.getImageData(0, 0, cols, rows).data;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = backTone;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rad = (screenDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const half = step * 0.5;

  for (let y = half, row = 0; y < canvas.height; y += step, row++) {
    for (let x = half, col = 0; x < canvas.width; x += step, col++) {
      const i = (Math.min(rows - 1, row) * cols + Math.min(cols - 1, col)) * 4;
      const lum = (pix[i] * 0.299 + pix[i + 1] * 0.587 + pix[i + 2] * 0.114) / 255;
      const size = lum * step * 0.92;
      if (size < 0.6) continue;
      ctx.setTransform(cos, sin, -sin, cos, x, y);
      ctx.fillStyle = `rgba(${inkTone},${0.35 + lum * 0.65})`;
      ctx.fillRect(-size / 2, -size / 2, size, size);
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function Titan() {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // GSAP / video / canvas を DOM へ同期する。useGSAP が解除時に戻す。
  useGSAP(
    () => {
      const root = rootRef.current;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!root || !video || !canvas) return;

      // 過去の固定 px 指定が残るとリサイズで右端が切れる
      canvas.style.width = "";
      canvas.style.height = "";

      const samp = document.createElement("canvas");
      let rafId = 0;
      const stopPaint = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
      };
      const tick = () => {
        paintScreen(canvas, video, samp);
        if (!video.paused && !video.ended) {
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = 0;
        }
      };
      const startPaint = () => {
        stopPaint();
        rafId = requestAnimationFrame(tick);
      };
      const resetVideo = () => {
        stopPaint();
        video.pause();
        try {
          video.currentTime = 0;
        } catch {
          /* ignore seek before ready */
        }
        paintScreen(canvas, video, samp);
      };
      const onResize = () => {
        paintScreen(canvas, video, samp);
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(root);

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        video.pause();
        const showStill = () => paintScreen(canvas, video, samp);
        if (video.readyState >= 2) showStill();
        else video.addEventListener("loadeddata", showStill, { once: true });
        return () => {
          video.removeEventListener("loadeddata", showStill);
        };
      });

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
              if (!(ch instanceof HTMLElement)) return;
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
        const videoWaits: gsap.core.Tween[] = [];
        const textWaits: gsap.core.Tween[] = [];
        let upDone = false;
        let lowSeen = false;
        let lowPlay = false;
        const stopVideoWaits = () => {
          videoWaits.forEach((tween) => tween.kill());
          videoWaits.length = 0;
        };
        const stopTextWaits = () => {
          textWaits.forEach((tween) => tween.kill());
          textWaits.length = 0;
        };
        const park = () => {
          stopVideoWaits();
          stopTextWaits();
          upDone = false;
          lowPlay = false;
          resetVideo();
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
        const beginVideo = () => {
          stopVideoWaits();
          const waitVideo = gsap.delayedCall(videoLag, () => {
            video.playbackRate = smokeRate;
            const play = video.play();
            startPaint();
            if (play) play.catch(() => undefined);
          });
          videoWaits.push(waitVideo);
        };
        const beginText = () => {
          stopTextWaits();
          upDone = false;
          lowPlay = false;
          lowSeen = lowIn();
          [...upParts, ...lowParts].forEach(({ rise }) => rise.pause(0));
          const waitText = gsap.delayedCall(letterLag, () => {
            upParts.forEach(({ rise }) => rise.play());
            const after = gsap.delayedCall(spanOf(upParts), () => {
              upDone = true;
              if (lowIn()) lowSeen = true;
              tryLow();
            });
            textWaits.push(after);
          });
          textWaits.push(waitText);
        };
        ScrollTrigger.create({
          trigger: root,
          start: "top 80%",
          end: "bottom top",
          onEnter: beginVideo,
          onEnterBack: beginVideo,
          onLeave: park,
          onLeaveBack: park,
        });
        ScrollTrigger.create({
          trigger: root,
          start: "center center",
          end: "bottom top",
          onEnter: beginText,
          onEnterBack: beginText,
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
        resetVideo();
        return () => {
          stopVideoWaits();
          stopTextWaits();
          held.forEach((tween) => tween.kill());
          [...upParts, ...lowParts].forEach(({ split }) => split.revert());
        };
      });

      return () => {
        ro.disconnect();
        stopPaint();
        video.pause();
      };
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-titan
      aria-labelledby="titan-title"
      className="relative z-10 w-full overflow-hidden bg-[#070707]"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-0"
          src={smokeSrc}
          muted
          playsInline
          loop
          preload="auto"
        />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {showEdgeFade ? (
          <>
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
          </>
        ) : null}
      </div>
      <div className="@container relative z-10 mx-auto h-[55.556cqw] w-full max-w-360">
        <div
          className="absolute inset-0"
          style={
            upTextShift
              ? { transform: `translateY(${upTextShift}cqw)` }
              : undefined
          }
        >
          {titanBits.slice(0, upCount).map((bit) => {
            const className = bitClass(bit);
            if (bit.head) {
              return (
                <h2
                  key={bit.text}
                  id="titan-title"
                  data-band="up"
                  className={className}
                >
                  {bit.text}
                </h2>
              );
            }
            return (
              <p key={bit.text} data-band="up" className={className}>
                {bit.text}
              </p>
            );
          })}
        </div>
        {showLowCopy
          ? titanBits.slice(upCount).map((bit) => (
              <p key={bit.text} data-band="low" className={bitClass(bit)}>
                {bit.text}
              </p>
            ))
          : null}
      </div>
    </section>
  );
}
