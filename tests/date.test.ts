import { describe, expect, it } from 'vitest'
import { formatDateOnly } from '@/lib/date'

describe('formatDateOnly', () => {
  it('keeps the selected local calendar day instead of the UTC day', () => {
    const originalTimeZone = process.env.TZ
    process.env.TZ = 'Asia/Tehran'

    try {
      const localMidnight = new Date(2026, 8, 23)

      expect(localMidnight.toISOString().startsWith('2026-09-22')).toBe(true)
      expect(formatDateOnly(localMidnight)).toBe('2026-09-23')
    } finally {
      if (originalTimeZone === undefined) {
        delete process.env.TZ
      } else {
        process.env.TZ = originalTimeZone
      }
    }
  })
})
