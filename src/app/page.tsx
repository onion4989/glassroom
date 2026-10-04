import { SmoothScroll } from "@/components/SmoothScroll";
import { Feature } from "@/features/home/components/Feature";
import { FitIntro } from "@/features/home/components/FitIntro";
import { FuncDesign } from "@/features/home/components/FuncDesign";
import { Hero } from "@/features/home/components/Hero";
import { LimitedModel } from "@/features/home/components/LimitedModel";
import { StickyGlass } from "@/features/home/components/StickyGlass";
import { Titan } from "@/features/home/components/Titan";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-1 flex-col">
      <SmoothScroll>
        <div data-page-stack className="relative">
          <Hero glass={<StickyGlass />} />
          <div className="mt-[150px] flex flex-col gap-[150px]">
            <FitIntro />
            <Titan />
            <Feature />
            <FuncDesign />
            <LimitedModel />
          </div>
        </div>
      </SmoothScroll>
    </main>
  );
}
