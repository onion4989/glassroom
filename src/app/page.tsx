import { SmoothScroll } from "@/components/SmoothScroll";
import { Detail } from "@/features/home/components/Detail";
import { Feature } from "@/features/home/components/Feature";
import { FitIntro } from "@/features/home/components/FitIntro";
import { Footer } from "@/features/home/components/Footer";
import { FuncDesign } from "@/features/home/components/FuncDesign";
import { Hero } from "@/features/home/components/Hero";
import { Model } from "@/features/home/components/Model";
import { Sales } from "@/features/home/components/Sales";
import { SideBrand } from "@/features/home/components/SideBrand";
import { StickyGlass } from "@/features/home/components/StickyGlass";
import { Titan } from "@/features/home/components/Titan";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-1 flex-col">
      <SideBrand />
      <SmoothScroll>
        <div
          data-page-stack
          className="relative flex flex-col gap-[6px] md:block"
        >
          <Hero glass={<StickyGlass />} />
          <div className="flex flex-col gap-[6px] md:mt-0 md:gap-0 lg:mt-[150px]">
            <div className="lg:mb-[150px]">
              <FitIntro />
            </div>
            <div className="lg:mb-[150px]">
              <Titan />
            </div>
            <div className="lg:mb-[150px]">
              <Feature />
            </div>
            <div className="lg:mb-[150px]">
              <FuncDesign />
            </div>
            <div className="lg:mb-[150px]">
              <Model />
            </div>
            <div className="lg:mb-[150px]">
              <Detail />
            </div>
            <div className="lg:mb-[150px]">
              <Sales />
            </div>
            <Footer />
          </div>
        </div>
      </SmoothScroll>
    </main>
  );
}
