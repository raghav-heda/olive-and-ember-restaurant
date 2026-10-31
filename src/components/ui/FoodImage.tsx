"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface FoodImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

export function FoodImage({
  src,
  alt,
  fallbackSrc = "/images/dish-fallback.jpg",
  className,
  ...props
}: FoodImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}

export default FoodImage;
