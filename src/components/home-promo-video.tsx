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
    <>
      <div ref={containerRef} className={cn(!playing && "h-0 overflow-hidden")}>
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
            "aspect-[4/5] w-full rounded-lg object-cover shadow-lg sm:aspect-[4/3]",
            !playing && "pointer-events-none invisible absolute h-0 w-0"
          )}
          style={{ pointerEvents: "none" }}
          aria-label="Video promocional Excusas Jeans"
          onPlaying={() => setPlaying(true)}
          onError={() => setFailed(true)}
          />
        ) : null}
      </div>
      {playing ? (
        <p className="mt-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500 sm:text-sm">
          Stretch Semi Cadera
        </p>
      ) : null}
    </>
  )
}
