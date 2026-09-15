import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/components/logins/login-form'
import { api_base_url } from '@/config'
import { server } from './mocks/server'

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: toastMocks,
}))

function renderLogin(type = 'admin') {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<LoginForm type={type} />} />
        <Route path="/dashboard" element={<h1>داشبورد</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginForm', () => {
  it.each(['admin', 'investor'])(
    'shows and hides the password on the %s login path',
    async (type) => {
      const user = userEvent.setup()
      renderLogin(type)
      const passwordInput = screen.getByLabelText('رمزعبور')

      await user.type(passwordInput, 'safe-password')
      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(screen.getByRole('button', { name: 'نمایش رمز عبور' }))
      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(passwordInput).toHaveValue('safe-password')

      await user.click(screen.getByRole('button', { name: 'پنهان کردن رمز عبور' }))
      expect(passwordInput).toHaveAttribute('type', 'password')
    },
  )

  it('logs in through the API and navigates when the role matches', async () => {
    let loginBody: unknown;
    server.use(
      http.post(api_base_url + '/auth/national/', async ({ request }) => {
        loginBody = await request.json()
        return HttpResponse.json({ authenticated: true })
      }),
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({ id: 1, name: 'Admin', type: 'admin' }),
      ),
    )
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('کد ملی'), '۱۲۳۴۵۶۷۸۹۰')
    await user.type(screen.getByLabelText('رمزعبور'), 'safe-password')
    await user.click(screen.getByRole('button', { name: 'ورود' }))

    expect(await screen.findByRole('heading', { name: 'داشبورد' })).toBeVisible()
    expect(loginBody).toEqual({
      nationalNumber: '1234567890',
      password: 'safe-password',
    })
  })

  it('navigates to the dashboard after confirming a role mismatch', async () => {
    server.use(
      http.post(api_base_url + '/auth/national/', () =>
        HttpResponse.json({ authenticated: true }),
      ),
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({ id: 2, name: 'User', type: 'free' }),
      ),
    )
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('کد ملی'), '1234567890')
    await user.type(screen.getByLabelText('رمزعبور'), 'safe-password')
    await user.click(screen.getByRole('button', { name: 'ورود' }))
    await user.click(
      await screen.findByRole('button', { name: 'بله، ادامه می‌دهم' }),
    )

    expect(await screen.findByRole('heading', { name: 'داشبورد' })).toBeVisible()
  })

  it('uses native required-field validation before calling the API', async () => {
    const loginRequest = vi.fn()
    server.use(
      http.post(api_base_url + '/auth/national/', () => {
        loginRequest()
        return HttpResponse.json({ authenticated: true })
      }),
    )
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: 'ورود' }))

    expect(screen.getByLabelText('کد ملی')).toBeInvalid()
    expect(screen.getByLabelText('رمزعبور')).toBeInvalid()
    expect(loginRequest).not.toHaveBeenCalled()
  })

  it('shows a backend login error to the user', async () => {
    server.use(
      http.post(api_base_url + '/auth/national/', () =>
        HttpResponse.json(
          { message: 'سرویس ورود در دسترس نیست' },
          { status: 503 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('کد ملی'), '1234567890')
    await user.type(screen.getByLabelText('رمزعبور'), 'safe-password')
    await user.click(screen.getByRole('button', { name: 'ورود' }))

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith(
        'سرویس ورود در دسترس نیست',
      )
    })
  })
})
