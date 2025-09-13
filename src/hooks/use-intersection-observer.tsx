"use client"

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverProps {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  threshold = 0.1,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [node, setNode] = useState<Element | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
  }

  useEffect(() => {
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const currentObserver = new IntersectionObserver(updateEntry, observerParams)

    observer.current = currentObserver
    currentObserver.observe(node)

    return () => currentObserver.disconnect()
  }, [node, threshold, root, rootMargin, frozen])

  return [setNode, entry] as const
}

// Hook específico para animaciones
export function useAnimateOnScroll(threshold = 0.1) {
  const [ref, entry] = useIntersectionObserver({
    threshold,
    freezeOnceVisible: true,
  })

  const isVisible = !!entry?.isIntersecting

  return [ref, isVisible] as const
}
