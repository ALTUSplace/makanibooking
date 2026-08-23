import type { ImgHTMLAttributes } from "react";
import { imageSizes, imageSrcSet, optimizeImageUrl } from "@/lib/imageUrl";

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  widthHint?: number;
  sizes?: string;
};

export function OptimizedImage({
  src,
  widthHint,
  sizes = imageSizes.card,
  loading = "lazy",
  decoding = "async",
  ...props
}: OptimizedImageProps) {
  const optimizedSrc = optimizeImageUrl(src, { width: widthHint });
  const responsiveSrcSet = imageSrcSet(src);

  return (
    <img
      {...props}
      src={optimizedSrc}
      srcSet={responsiveSrcSet}
      sizes={responsiveSrcSet ? sizes : undefined}
      loading={loading}
      decoding={decoding}
    />
  );
}
