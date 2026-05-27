"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"

const VIDEO_SRC =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() || "/video-1-excusas.mp4"
const POSTER_SRC = "/contacto-denim.png"

export function HomePromoVideo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)
  const [failed, setFailed] = useState(false)

  const tryPlay = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    try {
      video.muted = true
      await video.play()
      setNeedsTap(false)
      setFailed(false)
    } catch {
      setNeedsTap(true)
    }
  }, [])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true)
      },
      { rootMargin: "120px", threshold: 0.15 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.setAttribute("playsinline", "true")
    video.setAttribute("webkit-playsinline", "true")
  }, [inView])

  useEffect(() => {
    if (!inView) return
    const video = videoRef.current
    if (!video) return

    const onCanPlay = () => {
      void tryPlay()
    }
    const onError = () => {
      setFailed(true)
      setNeedsTap(true)
    }

    video.addEventListener("canplay", onCanPlay)
    video.addEventListener("error", onError)
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      void tryPlay()
    }

    return () => {
      video.removeEventListener("canplay", onCanPlay)
      video.removeEventListener("error", onError)
    }
  }, [inView, tryPlay])

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-stone-200 shadow-lg sm:aspect-[4/3]"
    >
      <Image
        src={POSTER_SRC}
        alt=""
        fill
        className={`object-cover transition-opacity duration-300 ${
          inView && !needsTap && !failed ? "opacity-0" : "opacity-100"
        }`}
        sizes="(max-width: 768px) 100vw, 896px"
        priority={false}
      />

      {inView && !failed && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={VIDEO_SRC}
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER_SRC}
        />
      )}

      {(needsTap || failed) && (
        <button
          type="button"
          onClick={() => {
            setFailed(false)
            setInView(true)
            void tryPlay()
          }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-stone-900/35 text-white backdrop-blur-[1px]"
          aria-label="Reproducir video"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-md">
            <Play className="h-6 w-6 fill-current pl-0.5" aria-hidden />
          </span>
          <span className="text-sm font-medium drop-shadow">Toca para reproducir</span>
        </button>
      )}
    </div>
  )
}
