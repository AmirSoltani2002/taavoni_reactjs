import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  cleanup()
  globalThis.localStorage?.clear()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
})

Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  writable: true,
  value: vi.fn(() => false),
})

Object.defineProperty(Element.prototype, 'setPointerCapture', {
  writable: true,
  value: vi.fn(),
})

Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  writable: true,
  value: vi.fn(),
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock
