import Image from "next/image";

/** Thumbnail (428:634) · 리스트용 64 */
export function Thumbnail({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      unoptimized
      className="size-64 shrink-0 rounded-8 object-cover"
    />
  );
}
