"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { IMAGE_FALLBACK } from "@/lib/constants";

/** <img> that swaps to a neutral placeholder if the remote photo fails to load. */
export function Img({ src, alt, className, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const [failed, setFailed] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={failed ? IMAGE_FALLBACK : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
