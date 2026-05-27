"use client"

import { useEffect, useRef, useState } from "react"
import { getHeroVideoUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

/** Video promocional home: solo visible al reproducir; si falla, no muestra nada. */
export function HomePromoVideo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<string | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { rootMargin: "80px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!inView || !video || failed) return
    video.play().catch(() => setFailed(true))
  }, [inView, failed])

  if (failed) return null

  return (
    <div className="w-full min-w-0 max-w-full">
      <div
        ref={containerRef}
        className={cn(
          "relative w-full max-w-full overflow-hidden rounded-lg shadow-lg bg-transparent",
          playing ? (aspectRatio ? "" : "aspect-[4/5] sm:aspect-[4/3]") : "h-0 overflow-hidden"
        )}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {inView ? (
          <video
            ref={videoRef}
            src={getHeroVideoUrl()}
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className={cn(
              "absolute left-0 top-0 block h-full w-full object-contain object-center",
              !playing && "opacity-0"
            )}
            style={{
              pointerEvents: "none",
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
            aria-label="Video promocional Excusas Jeans"
            onPlaying={() => setPlaying(true)}
            onLoadedMetadata={() => {
              const video = videoRef.current
              if (!video) return
              if (video.videoWidth > 0 && video.videoHeight > 0) {
                // CSS aspect-ratio expects: "width/height"
                setAspectRatio(`${video.videoWidth}/${video.videoHeight}`)
              }
            }}
            onError={() => setFailed(true)}
          />
        ) : null}
      </div>
      {playing ? (
        <p className="mt-3 px-4 text-right text-xs font-medium uppercase tracking-wider text-stone-500 sm:px-0 sm:text-sm">
          Stretch Semi Cadera
        </p>
      ) : null}
    </div>
  )
}
