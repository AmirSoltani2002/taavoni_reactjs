import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { SignupForm } from '@/components/logins/_signup-form'
import { api_base_url } from '@/config'
import { server } from './mocks/server'

vi.mock('@/components/calendars/calendar', () => ({
  Calendar22: ({
    title,
    setDate,
  }: {
    title?: string
    setDate: (date: Date | undefined) => void
  }) => (
    <button type="button" onClick={() => setDate(new Date(2026, 8, 23))}>
      {title}
    </button>
  ),
}))

describe('SignupForm', () => {
  it('controls password and confirmation visibility independently', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    const passwordInput = screen.getByLabelText('رمز عبور', { selector: 'input' })
    const confirmationInput = screen.getByLabelText('تکرار رمز عبور')

    await user.type(passwordInput, 'safe-password')
    await user.type(confirmationInput, 'safe-password')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmationInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'نمایش رمز عبور' }))
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(passwordInput).toHaveValue('safe-password')
    expect(confirmationInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'نمایش تکرار رمز عبور' }))
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(confirmationInput).toHaveAttribute('type', 'text')
    expect(confirmationInput).toHaveValue('safe-password')
  })

  it('posts a birthday as the selected local calendar day', async () => {
    let requestBody: Record<string, unknown> | undefined
    server.use(
      http.post(api_base_url + '/users', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: 1, ...requestBody })
      }),
    )
    const user = userEvent.setup()
    render(<SignupForm />)

    await user.type(screen.getByLabelText('نام'), 'علی')
    await user.type(screen.getByLabelText('نام خانوادگی'), 'رضایی')
    await user.type(screen.getByLabelText('کدملی'), '0012345678')
    await user.type(screen.getByLabelText('ایمیل'), 'ali@example.com')
    await user.type(screen.getByLabelText('شماره تلفن همراه'), '09120000000')
    await user.type(screen.getByLabelText('شماره تلفن منزل'), '02100000000')
    await user.type(screen.getByLabelText('شماره تلفن محل کار'), '02100000000')
    await user.type(screen.getByLabelText('آدرس'), 'تهران')
    const passwordInput = screen.getByLabelText('رمز عبور', { selector: 'input' })
    const passwordRepeatInput = screen.getByLabelText('تکرار رمز عبور')
    await user.type(passwordInput, 'safe-password')
    await user.type(passwordRepeatInput, 'safe-password')
    await user.click(screen.getByRole('button', { name: 'تاریخ تولد' }))

    const selects = screen.getAllByRole('combobox')
    await user.click(selects[0])
    await user.click(await screen.findByRole('option', { name: 'مرد' }))
    await user.click(selects[1])
    await user.click(await screen.findByRole('option', { name: 'عضو آزاد' }))
    const submitButton = screen.getByRole('button', { name: 'ثبت‌نام' })
    const form = submitButton.closest('form')
    if (!form) throw new Error('Signup form not found')
    Object.defineProperties(form, {
      password: { value: passwordInput },
      passwordRepeat: { value: passwordRepeatInput },
    })
    await user.click(submitButton)

    await waitFor(() => {
      expect(requestBody).toMatchObject({ birthDay: '2026-09-23' })
    })
  })
})
