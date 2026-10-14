import { useEffect, useRef } from 'react'
import { setupScrollReveals } from '../lib/storefrontMotion'

export function useStorefrontMotion() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    return setupScrollReveals(ref.current, {
      preference: window.matchMedia('(prefers-reduced-motion: reduce)'),
      Observer: window.IntersectionObserver,
      viewportHeight: window.innerHeight,
    })
  }, [])
  return ref
}
