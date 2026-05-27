"use client"

import { getHeroVideoUrl } from "@/lib/site"

/** Video promocional home: autoplay silenciado, visible en móvil (playsInline). */
export function HomePromoVideo() {
  return (
    <video
      src={getHeroVideoUrl()}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      className="aspect-[4/5] w-full rounded-lg object-cover shadow-lg sm:aspect-[4/3]"
      style={{ pointerEvents: "none" }}
      aria-label="Video promocional Excusas Jeans"
    />
  )
}
