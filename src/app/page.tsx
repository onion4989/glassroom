import { SmoothScroll } from "@/components/SmoothScroll";
import { FitIntro } from "@/features/home/components/FitIntro";
import { FuncDesign } from "@/features/home/components/FuncDesign";
import { Hero } from "@/features/home/components/Hero";
import { HeroCover } from "@/features/home/components/HeroCover";
import { LimitedModel } from "@/features/home/components/LimitedModel";
import { Titan } from "@/features/home/components/Titan";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-1 flex-col">
      <HeroCover>
        <Hero />
        <SmoothScroll>
          <div aria-hidden className="h-0 motion-safe:h-svh" />
          <FitIntro />
          <Titan />
          <FuncDesign />
          <LimitedModel />
        </SmoothScroll>
      </HeroCover>
    </main>
  );
}
