"use client";
import { useState } from "react";
import Image, { ImageProps } from "next/image";

type FallbackImageProps = ImageProps & { fallbackSrc?: string };

export default function FallbackImage({ src, fallbackSrc = "/placeholder.png", ...props }: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const isExternal = typeof imgSrc === "string" && imgSrc.startsWith("http");
  return <Image {...props} src={imgSrc} unoptimized={isExternal} onError={() => setImgSrc(fallbackSrc)} />;
}
