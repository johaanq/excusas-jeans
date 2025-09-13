"use client"

import Image from 'next/image'
import { useState } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
}

export function SafeImage({ 
  src, 
  alt, 
  fill = false, 
  width, 
  height, 
  className = '', 
  priority = false,
  sizes 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('/placeholder.svg')
    }
  }

  const imageProps = {
    src: imgSrc,
    alt,
    className,
    priority,
    onError: handleError,
    ...(fill ? { fill: true } : { width, height }),
    ...(sizes && { sizes })
  }

  return <Image {...imageProps} />
}
