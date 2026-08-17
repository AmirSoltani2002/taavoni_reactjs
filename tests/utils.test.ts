import { describe, expect, it } from 'vitest'

import { cn } from '../src/lib/utils'

describe('cn', () => {
  it('merges conditional classes and resolves Tailwind conflicts', () => {
    expect(cn('px-2', { hidden: false }, 'px-4')).toBe('px-4')
  })
})
