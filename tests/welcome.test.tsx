import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Welcome from '@/pages/welcome'

function CurrentLocation() {
  const location = useLocation()

  return <p>{location.pathname + location.search}</p>
}

describe('Welcome', () => {
  it('labels regular login as member and preserves its login route', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signin" element={<CurrentLocation />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getAllByText('ورود به عنوان عضو')).toHaveLength(2)
    expect(screen.queryByText('ورود به عنوان سرمایه‌گذار')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'ورود به عنوان عضو' }))

    expect(screen.getByText('/signin?type=investor')).toBeVisible()
  })
})
