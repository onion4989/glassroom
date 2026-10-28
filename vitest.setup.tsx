import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("next/image", async () => {
  const { createElement } = await import("react");
  return {
    default: (props: { alt?: string }) =>
      createElement("img", { alt: props.alt ?? "" }),
    getImageProps: (opts: {
      src: string;
      sizes?: string;
    }) => ({
      props: {
        src: opts.src,
        srcSet: opts.src,
        sizes: opts.sizes ?? "",
      },
    }),
  };
});

vi.mock("@/lib/gsap", async () => {
  const React = await import("react");

  const chain = new Proxy(function sink() {}, {
    get: (_target, prop) => {
      if (prop === "then") return undefined;
      return () => chain;
    },
    apply: () => chain,
  });

  const gsap = {
    registerPlugin: () => {},
    set: () => chain,
    to: () => chain,
    from: () => chain,
    fromTo: () => chain,
    timeline: () => chain,
    context: (fn: () => void) => {
      fn();
      return { revert: () => {} };
    },
    matchMedia: () => ({
      add: (_query: string, fn: () => void) => {
        fn();
      },
      revert: () => {},
    }),
    ticker: { add: () => {}, remove: () => {}, lagSmoothing: () => {} },
    utils: {
      clamp: () => (value: number) => value,
      mapRange: () => (value: number) => value,
    },
    quickSetter: () => () => {},
  };

  const ScrollTrigger = {
    create: () => ({ kill: () => {} }),
    getAll: () => [],
    refresh: () => {},
    update: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    normalizeScroll: () => {},
  };

  function useGSAP(fn: () => void | (() => void)) {
    React.useEffect(() => {
      try {
        const done = fn();
        return typeof done === "function" ? done : undefined;
      } catch {
        return undefined;
      }
    }, [fn]);
  }

  return {
    gsap,
    ScrollTrigger,
    useGSAP,
  };
});

vi.mock("@/lib/gsap-smoother", () => ({
  ScrollSmoother: {
    create: () => ({ kill: () => {}, paused: () => {}, scrollTo: () => {} }),
    get: () => null,
  },
}));

vi.mock("@/lib/gsap-split", () => {
  class SplitText {
    chars: HTMLElement[] = [];
    words: HTMLElement[] = [];
    lines: HTMLElement[] = [];
    revert() {}
    static create() {
      return new SplitText();
    }
  }
  return { SplitText };
});

vi.mock("@/lib/gsap-scramble", () => ({
  ScrambleTextPlugin: {},
}));

function mediaList(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  };
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) => mediaList(query),
});

afterEach(() => {
  cleanup();
});
