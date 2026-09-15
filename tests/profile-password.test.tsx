import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { api_base_url } from '@/config'
import ProfilePage from '@/pages/users/profile'
import { server } from './mocks/server'

describe('ProfilePage password change', () => {
  it('controls new and confirmation password visibility independently', async () => {
    const profile = {
      id: 3,
      name: 'کاربر',
      lastName: 'آزمایشی',
      nationalNumber: '0012345678',
      sex: 'male',
      type: 'free',
      accepted: false,
      isargaryType: 'none',
    }
    server.use(
      http.get(api_base_url + '/users/profile', () => HttpResponse.json(profile)),
      http.get(api_base_url + '/user-doc/profile', () => HttpResponse.json([])),
      http.get(api_base_url + '/transaction/profile/score', () => HttpResponse.json({})),
      http.get(api_base_url + '/transaction/profile', () => HttpResponse.json([])),
      http.get(api_base_url + '/users/pre-selling', () => HttpResponse.json([])),
      http.get(api_base_url + '/subprojects/profile', () => HttpResponse.json([])),
      http.get(api_base_url + '/final-transaction/profile', () => HttpResponse.json([])),
    )
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProfilePage />
      </MemoryRouter>,
    )

    const editButtons = await screen.findAllByRole('button', { name: 'ویرایش' })
    await user.click(editButtons[0])
    await user.click(screen.getByRole('button', { name: 'تغییر رمز عبور' }))

    const newPasswordInput = screen.getByLabelText('رمز عبور جدید')
    const confirmationInput = screen.getByLabelText('تأیید رمز عبور جدید')
    expect(newPasswordInput).toHaveAttribute('type', 'password')
    expect(confirmationInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'نمایش رمز عبور جدید' }))
    expect(newPasswordInput).toHaveAttribute('type', 'text')
    expect(confirmationInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'نمایش تأیید رمز عبور جدید' }))
    expect(newPasswordInput).toHaveAttribute('type', 'text')
    expect(confirmationInput).toHaveAttribute('type', 'text')
  })
})
