import { getImageProps } from "next/image";
import {
  glassFrontImg,
  glassFrontSizes,
} from "@/features/home/data/glass-front";

/** Preload the Mobile/Desktop LCP glasses image via next/image props. */
export function HeroLcpPreload() {
  const { props } = getImageProps({
    src: glassFrontImg.src,
    width: glassFrontImg.width,
    height: glassFrontImg.height,
    sizes: glassFrontSizes,
    quality: 70,
    alt: "",
    priority: true,
  });

  return (
    <link
      rel="preload"
      as="image"
      href={props.src}
      imageSrcSet={props.srcSet}
      imageSizes={props.sizes}
      fetchPriority="high"
    />
  );
}
