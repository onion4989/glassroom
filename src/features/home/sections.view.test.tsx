import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Detail } from "@/features/home/components/Detail";
import { Feature } from "@/features/home/components/Feature";
import { FitIntro } from "@/features/home/components/FitIntro";
import { Footer } from "@/features/home/components/Footer";
import { FuncDesign } from "@/features/home/components/FuncDesign";
import { Hero } from "@/features/home/components/Hero";
import { Model } from "@/features/home/components/Model";
import { Sales } from "@/features/home/components/Sales";
import { Titan } from "@/features/home/components/Titan";
import {
  funcDockEvent,
  glassFrontImg,
  modelHandoffEvent,
  spGlassLine,
} from "@/features/home/components/StickyGlass";

const shopAddr = "東京都〇〇〇区〇〇〇町1-1-2";

describe("Hero", () => {
  it("ブランド名を出す", () => {
    render(<Hero glass={null} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "GLASSROOM" }),
    ).toBeInTheDocument();
  });
});

describe("Footer", () => {
  it("住所を出す", () => {
    render(<Footer />);
    expect(screen.getAllByText(shopAddr).length).toBeGreaterThan(0);
  });
});

describe("各セクション", () => {
  it("FREE FiT の見出しを出す", () => {
    render(<FitIntro />);
    expect(
      screen.getAllByRole("heading", { name: "FREE FiT" }).length,
    ).toBeGreaterThan(0);
  });

  it("チタンの見出しを出す", () => {
    render(<Titan />);
    expect(
      screen.getByRole("region", { name: "形状記憶チタンフレーム" }),
    ).toBeInTheDocument();
  });

  it("特徴の見出しを出す", () => {
    render(<Feature />);
    expect(
      screen.getByRole("heading", { name: /FREE FiTの特徴/ }),
    ).toBeInTheDocument();
  });

  it("機能性とデザインの見出しを出す", () => {
    render(<FuncDesign />);
    expect(
      screen.getAllByRole("heading", { name: /機能性/ }).length,
    ).toBeGreaterThan(0);
  });

  it("期間限定モデルの見出しを出す", () => {
    render(<Model />);
    expect(
      screen.getAllByRole("heading", { name: "FREE FiT" }).length,
    ).toBeGreaterThan(0);
  });

  it("製品詳細を出す", () => {
    render(<Detail />);
    expect(
      screen.getByRole("region", { name: "製品詳細" }),
    ).toBeInTheDocument();
  });

  it("累計販売の見出しを出す", () => {
    render(<Sales />);
    expect(
      screen.getAllByRole("heading", { name: "累計販売本数" }).length,
    ).toBeGreaterThan(0);
  });
});

describe("StickyGlass の定数", () => {
  it("受け渡しイベント名と正面画像の寸法を持つ", () => {
    expect(modelHandoffEvent).toBe("glassroom:model-handoff");
    expect(funcDockEvent).toBe("glassroom:func-dock");
    expect(glassFrontImg.width).toBe(620);
    expect(glassFrontImg.height).toBe(173);
  });

  it("対象が無いとき眼鏡位置は 0", () => {
    expect(spGlassLine("top")).toBe(0);
    expect(spGlassLine("center")).toBe(0);
  });
});
