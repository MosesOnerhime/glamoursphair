const REVEAL_TARGETS = [
  '.catalog-header h2', '.catalog-subtitle', '.editorial-content > *',
  '.light-band h2', '.benefit', '.delivery-note', '.studio-details > *',
  '.personal-shopping > *', '.channel-band p', '.channel-band .luxury-button',
  '.luxury-footer > *',
].join(',')

interface MotionEnvironment {
  preference: MediaQueryList
  Observer?: typeof IntersectionObserver
  viewportHeight: number
}

export function setupScrollReveals(root: HTMLElement, environment: MotionEnvironment) {
  const { preference, Observer, viewportHeight } = environment
  if (preference.matches || !Observer) return () => {}

  const targets = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_TARGETS))
  const pending = new Set<HTMLElement>()
  let active = true
  const reveal = (target: HTMLElement) => {
    pending.delete(target)
    target.classList.remove('motion-pending')
    target.classList.add('motion-reveal')
    observer.unobserve(target)
  }
  const observer = new Observer(entries => {
    if (!active) return
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target as HTMLElement) })
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' })

  targets.forEach((target, index) => {
    target.style.setProperty('--reveal-delay', `${index % 4 * 45}ms`)
    // Only stage content below the initial viewport; visible content never disappears.
    if (target.getBoundingClientRect().top >= viewportHeight) {
      target.classList.add('motion-pending')
      pending.add(target)
    }
    observer.observe(target)
  })

  const restore = () => {
    active = false
    observer.disconnect()
    targets.forEach(target => {
      target.classList.remove('motion-pending', 'motion-reveal')
      target.style.removeProperty('--reveal-delay')
    })
    pending.clear()
  }
  const onPreferenceChange = () => { if (preference.matches) restore() }
  const onFocus = (event: FocusEvent) => {
    const source = event.target as Element | null
    const target = source?.closest?.('.motion-pending') as HTMLElement | null
    if (target && pending.has(target)) {
      reveal(target)
      target.classList.remove('motion-reveal')
    }
  }
  root.addEventListener('focusin', onFocus)
  preference.addEventListener('change', onPreferenceChange)
  return () => {
    restore()
    root.removeEventListener('focusin', onFocus)
    preference.removeEventListener('change', onPreferenceChange)
  }
}
