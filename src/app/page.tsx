import { FitIntro } from "@/features/home/components/FitIntro";
import { Hero } from "@/features/home/components/Hero";
import { HeroCover } from "@/features/home/components/HeroCover";
import { Titan } from "@/features/home/components/Titan";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-1 flex-col">
      <HeroCover>
        <Hero />
        <FitIntro />
      </HeroCover>
      <Titan />
    </main>
  );
}
