import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import ts from 'typescript'

const code = ts.transpileModule(readFileSync(new URL('../src/lib/storefrontMotion.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText
const { setupScrollReveals } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)

function fixture(reduced = false) {
  const target = top => {
    const classes = new Set(), styles = new Map()
    const element = {
      classes, styles,
      classList: { add: (...values) => values.forEach(value => classes.add(value)), remove: (...values) => values.forEach(value => classes.delete(value)) },
      style: { setProperty: (key, value) => styles.set(key, value), removeProperty: key => styles.delete(key) },
      getBoundingClientRect: () => ({ top }),
      closest: () => classes.has('motion-pending') ? element : null,
    }
    return element
  }
  const targets = [target(100), target(1000)]
  const listeners = new Map(), preferenceListeners = new Map(), observers = []
  const root = {
    querySelectorAll: () => targets,
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: name => listeners.delete(name),
  }
  const preference = {
    matches: reduced,
    addEventListener: (name, callback) => preferenceListeners.set(name, callback),
    removeEventListener: name => preferenceListeners.delete(name),
  }
  class Observer {
    constructor(callback) { this.callback = callback; this.observed = new Set(); this.disconnected = false; observers.push(this) }
    observe(element) { this.observed.add(element) }
    unobserve(element) { this.observed.delete(element) }
    disconnect() { this.disconnected = true; this.observed.clear() }
    enter(element) { this.callback([{ target: element, isIntersecting: true }]) }
  }
  return { targets, listeners, preferenceListeners, observers, root, environment: { preference, Observer, viewportHeight: 800 } }
}

test('reduced motion never stages or observes text', () => {
  const f = fixture(true)
  setupScrollReveals(f.root, f.environment)()
  assert.equal(f.observers.length, 0)
  assert.ok(f.targets.every(element => element.classes.size === 0 && element.styles.size === 0))
})

test('missing IntersectionObserver leaves all text visible', () => {
  const f = fixture()
  setupScrollReveals(f.root, { ...f.environment, Observer: undefined })()
  assert.ok(f.targets.every(element => element.classes.size === 0))
  assert.equal(f.listeners.size, 0)
})

test('only below-fold text is staged and entering text is unobserved', () => {
  const f = fixture()
  const cleanup = setupScrollReveals(f.root, f.environment)
  assert.equal(f.targets[0].classes.has('motion-pending'), false)
  assert.equal(f.targets[1].classes.has('motion-pending'), true)
  f.observers[0].enter(f.targets[1])
  assert.equal(f.targets[1].classes.has('motion-pending'), false)
  assert.equal(f.targets[1].classes.has('motion-reveal'), true)
  assert.equal(f.observers[0].observed.has(f.targets[1]), false)
  cleanup()
})

test('keyboard focus reveals staged content without waiting for animation', () => {
  const f = fixture()
  const cleanup = setupScrollReveals(f.root, f.environment)
  f.listeners.get('focusin')({ target: { closest: () => f.targets[1] } })
  assert.equal(f.targets[1].classes.size, 0)
  assert.equal(f.observers[0].observed.has(f.targets[1]), false)
  cleanup()
})

test('switching to reduced motion restores visibility and ignores queued intersections', () => {
  const f = fixture()
  const cleanup = setupScrollReveals(f.root, f.environment)
  f.environment.preference.matches = true
  f.preferenceListeners.get('change')()
  f.observers[0].enter(f.targets[1])
  assert.ok(f.targets.every(element => element.classes.size === 0 && element.styles.size === 0))
  assert.equal(f.observers[0].disconnected, true)
  cleanup()
})

test('cleanup removes observers, focus listeners and motion styles', () => {
  const f = fixture()
  setupScrollReveals(f.root, f.environment)()
  assert.equal(f.listeners.size, 0)
  assert.equal(f.preferenceListeners.size, 0)
  assert.ok(f.targets.every(element => element.classes.size === 0 && element.styles.size === 0))
})
