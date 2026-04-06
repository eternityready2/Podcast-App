"use client";
import { useState } from "react";
import Image, { ImageProps } from "next/image";

type FallbackImageProps = ImageProps & { fallbackSrc?: string };

export default function FallbackImage({ src, fallbackSrc = "/placeholder.png", ...props }: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  return <Image {...props} src={imgSrc} onError={() => setImgSrc(fallbackSrc)} />;
}
