import type { ReactNode } from "react";
import { DrawWord } from "@/features/home/components/DrawWord";
import { HeroLcpPreload } from "@/features/home/components/HeroLcpPreload";

export function Hero({ glass }: { glass: ReactNode }) {
  return (
    <section className="hero-light relative flex w-full flex-col items-center px-11 py-10 md:h-[600px] md:justify-center md:px-[68px] md:py-0 lg:h-[min(100svh,800px)] lg:px-4">
      <HeroLcpPreload />
      <div className="flex w-full max-w-[620px] flex-col items-center gap-[10px] text-center text-white md:max-w-[631px] md:gap-[19px] lg:max-w-[620px] lg:gap-0">
        <h1
          data-hero-title
          className="font-brand text-[32px] leading-none tracking-[0.3em] whitespace-nowrap md:text-[64px] md:tracking-[0.3em] lg:text-[96px] lg:tracking-normal"
        >
          <span className="sr-only">GLASSROOM</span>
          <span className="md:hidden" aria-hidden="true">
            GLASSROOM
          </span>
          <span className="hidden md:inline" aria-hidden="true">
            <DrawWord />
          </span>
        </h1>
        <p className="rise-line font-jp text-[24px] leading-none tracking-[0.3em] md:text-[32px] md:tracking-[0.3em] lg:mt-[31px] lg:text-[32px] lg:tracking-[0.3em]">
          グラスルーム
        </p>
        <address className="rise-line rise-late font-jp text-[14px] leading-none tracking-[0.3em] not-italic md:text-[20px] md:tracking-[0.3em] lg:mt-[25px] lg:text-[20px] lg:tracking-[0.3em]">
          東京都〇〇〇区〇〇〇町1-1-2
        </address>
        {glass}
      </div>
    </section>
  );
}
