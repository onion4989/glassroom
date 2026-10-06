import { SmoothScroll } from "@/components/SmoothScroll";
import { Detail } from "@/features/home/components/Detail";
import { Feature } from "@/features/home/components/Feature";
import { FitIntro } from "@/features/home/components/FitIntro";
import { Footer } from "@/features/home/components/Footer";
import { FuncDesign } from "@/features/home/components/FuncDesign";
import { Hero } from "@/features/home/components/Hero";
import { Model } from "@/features/home/components/Model";
import { Sales } from "@/features/home/components/Sales";
import { StickyGlass } from "@/features/home/components/StickyGlass";
import { Titan } from "@/features/home/components/Titan";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-1 flex-col">
      <SmoothScroll>
        <div data-page-stack className="relative">
          <Hero glass={<StickyGlass />} />
          <div className="mt-[150px] flex flex-col">
            <div className="mb-[150px]">
              <FitIntro />
            </div>
            <div className="mb-[150px]">
              <Titan />
            </div>
            <div className="mb-[150px]">
              <Feature />
            </div>
            <div className="mb-[150px]">
              <FuncDesign />
            </div>
            <div className="mb-[150px]">
              <Model />
            </div>
            <div className="mb-[150px]">
              <Detail />
            </div>
            <div className="mb-[150px]">
              <Sales />
            </div>
            <Footer />
          </div>
        </div>
      </SmoothScroll>
    </main>
  );
}
