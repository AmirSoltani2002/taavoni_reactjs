import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import UserCreate from '@/pages/users/create'
import { api_base_url } from '@/config'
import { Toaster } from '@/components/ui/sonner'
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

const MEMBERSHIP_LABELS = [
  'کارمند دانشگاه تهران',
  'هیئت علمی دانشگاه تهران',
  'کارمند سایر دانشگاه‌ها',
  'هیئت علمی سایر دانشگاه‌ها',
  'کارمند غیردانشگاهی',
  'عضو آزاد',
]

function renderUserForm(type: 'admin' | 'other') {
  return render(
    <MemoryRouter initialEntries={[`/users/create?type=${type}`]}>
      <UserCreate />
      <Toaster />
    </MemoryRouter>,
  )
}

function renderRegularUserForm() {
  return renderUserForm('other')
}

async function fillRequiredTextFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('نام*'), 'علی')
  await user.type(screen.getByLabelText('نام خانوادگی*'), 'رضایی')
  await user.type(screen.getByLabelText('کد ملی*'), '0012345678')
  await user.type(screen.getByLabelText('رمز عبور*'), 'safe-password')
}

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  selectName: string,
  optionName: string,
) {
  await user.click(screen.getByLabelText(selectName))
  await user.click(await screen.findByRole('option', { name: optionName }))
}

describe('UserCreate', () => {
  it.each(['admin', 'other'] as const)(
    'shows and hides the password on the %s creation path',
    async (type) => {
      const user = userEvent.setup()
      renderUserForm(type)
      const passwordInput = screen.getByLabelText('رمز عبور*')

      await user.type(passwordInput, 'safe-password')
      expect(passwordInput).toHaveAttribute('type', 'password')

      await user.click(screen.getByRole('button', { name: 'نمایش رمز عبور' }))
      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(passwordInput).toHaveValue('safe-password')
    },
  )

  it('shows the six regular membership types in the requested order', async () => {
    const user = userEvent.setup()
    renderRegularUserForm()

    await user.click(screen.getByLabelText('نوع عضویت*'))

    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(
      MEMBERSHIP_LABELS,
    )
  })

  it('requires a valid membership type instead of submitting the URL marker', async () => {
    const requestSpy = vi.fn()
    server.use(
      http.post(api_base_url + '/users', () => {
        requestSpy()
        return HttpResponse.json({ id: 1 })
      }),
    )
    const user = userEvent.setup()
    renderRegularUserForm()
    await fillRequiredTextFields(user)
    await selectOption(user, 'جنسیت*', 'مرد')

    const submitButton = screen.getByRole('button', { name: 'افزودن کاربر' })
    expect(screen.getByLabelText('نوع عضویت*')).toHaveTextContent('انتخاب کنید')

    await user.click(submitButton)

    expect(await screen.findByText('لطفا نوع عضویت را مشخص کنید')).toBeVisible()
    expect(requestSpy).not.toHaveBeenCalled()
  })

  it('posts a selected faculty membership type', async () => {
    let requestBody: Record<string, unknown> | undefined
    server.use(
      http.post(api_base_url + '/users', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: 1, ...requestBody })
      }),
    )
    const user = userEvent.setup()
    renderRegularUserForm()
    await fillRequiredTextFields(user)
    await selectOption(user, 'جنسیت*', 'مرد')
    await selectOption(user, 'نوع عضویت*', 'هیئت علمی دانشگاه تهران')

    await user.click(screen.getByRole('button', { name: 'افزودن کاربر' }))

    await waitFor(() => {
      expect(requestBody).toMatchObject({
        name: 'علی',
        lastName: 'رضایی',
        nationalNumber: '0012345678',
        sex: 'male',
        type: 'universityFaculty',
      })
    })
  })

  it('posts an administrator birthday as the selected local calendar day', async () => {
    let requestBody: Record<string, unknown> | undefined
    server.use(
      http.post(api_base_url + '/users', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: 1, ...requestBody })
      }),
    )
    const user = userEvent.setup()
    renderUserForm('admin')
    await fillRequiredTextFields(user)
    await user.type(screen.getByLabelText('تلفن همراه*'), '09120000000')
    await selectOption(user, 'جنسیت*', 'مرد')
    await user.click(screen.getByRole('button', { name: 'تاریخ تولد' }))

    await user.click(screen.getByRole('button', { name: 'افزودن ادمین' }))

    await waitFor(() => {
      expect(requestBody).toMatchObject({
        birthDay: '2026-09-23',
        type: 'admin',
      })
    })
  })
})
