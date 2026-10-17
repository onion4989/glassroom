import type { ReactNode } from "react";
import { DrawWord } from "@/features/home/components/DrawWord";

export function Hero({ glass }: { glass: ReactNode }) {
  return (
    <section className="hero-light relative flex w-full flex-col items-center px-11 py-10 md:h-[min(100svh,800px)] md:justify-center md:px-4 md:py-0">
      <div className="flex w-full max-w-[620px] flex-col items-center gap-[10px] text-center text-white md:gap-0">
        <h1
          data-hero-title
          className="font-brand text-[32px] leading-none tracking-[0.3em] whitespace-nowrap md:text-[56px] md:tracking-normal lg:text-[96px]"
        >
          <span className="sr-only">GLASSROOM</span>
          <span className="md:hidden" aria-hidden="true">
            GLASSROOM
          </span>
          <span className="hidden md:inline" aria-hidden="true">
            <DrawWord />
          </span>
        </h1>
        <p className="rise-line font-jp text-[24px] leading-none tracking-[0.3em] md:mt-4 md:text-[24px] md:tracking-[0.22em] lg:mt-[31px] lg:text-[32px] lg:tracking-[0.3em]">
          グラスルーム
        </p>
        <address className="rise-line rise-late font-jp text-[14px] leading-none tracking-[0.3em] not-italic md:mt-3 md:text-[16px] md:tracking-[0.16em] lg:mt-[25px] lg:text-[20px] lg:tracking-[0.3em]">
          東京都〇〇〇区〇〇〇町1-1-2
        </address>
        {glass}
      </div>
    </section>
  );
}
