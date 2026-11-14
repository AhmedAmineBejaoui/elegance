import { useState, type ImgHTMLAttributes } from "react";

/** Keep a failed remote image from leaving a broken icon or an empty card. */
export function StoreImage({ src, alt, loading = "lazy", onError, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSource, setFailedSource] = useState<string>();
  const source = src && src !== failedSource ? src : "/images/product-placeholder.svg";
  return <img {...props} src={source} alt={alt} loading={loading} decoding="async" onError={(event) => {
    if (source !== "/images/product-placeholder.svg") setFailedSource(src);
    onError?.(event);
  }} />;
}
