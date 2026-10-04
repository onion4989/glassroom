import type { ReactNode } from "react";
import { DrawWord } from "@/features/home/components/DrawWord";

export function Hero({ glass }: { glass: ReactNode }) {
  return (
    <section className="hero-light relative flex min-h-svh w-full items-center justify-center px-4">
      <div className="flex w-full max-w-[620px] flex-col items-center text-center text-white">
        <h1 className="font-brand text-[28px] leading-none whitespace-nowrap md:text-[56px] lg:text-[96px]">
          <span className="sr-only">GLASSROOM</span>
          <span aria-hidden="true">
            <DrawWord />
          </span>
        </h1>
        <p className="rise-line mt-2 font-jp text-[16px] leading-none tracking-[0.16em] md:mt-4 md:text-[24px] md:tracking-[0.22em] lg:mt-[31px] lg:text-[32px] lg:tracking-[0.3em]">
          グラスルーム
        </p>
        <address className="rise-line rise-late mt-1.5 font-jp text-[12px] leading-none tracking-[0.1em] not-italic md:mt-3 md:text-[16px] md:tracking-[0.16em] lg:mt-[25px] lg:text-[20px] lg:tracking-[0.3em]">
          東京都〇〇〇区〇〇〇町1-1-2
        </address>
        {glass}
      </div>
    </section>
  );
}
