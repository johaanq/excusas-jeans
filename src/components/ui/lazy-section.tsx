"use client"

import { Suspense, lazy, memo, ReactNode } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { Skeleton } from "./skeleton"

interface LazySectionProps {
  children: ReactNode
  fallback?: ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}

const DefaultFallback = memo(() => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4 animate-shimmer" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg animate-shimmer" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4 animate-shimmer" />
            <Skeleton className="h-4 w-1/2 animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  </div>
))

export function LazySection({ 
  children, 
  fallback = <DefaultFallback />, 
  threshold = 0.1,
  rootMargin = "50px",
  className = ""
}: LazySectionProps) {
  const [ref, entry] = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  })

  const isVisible = !!entry?.isIntersecting

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  )
}
