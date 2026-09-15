import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SignupForm } from '@/components/logins/_signup-form'

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
})
