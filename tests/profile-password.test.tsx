import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { api_base_url } from '@/config'
import ProfilePage from '@/pages/users/profile'
import type { UserType } from '@/pages/users/columns'
import { server } from './mocks/server'

const ACCOUNT_TYPES: UserType[] = [
  'system',
  'admin',
  'tehranUni',
  'universityFaculty',
  'otherUni',
  'otherUniversityFaculty',
  'free',
  'employee',
]

const baseProfile = {
  id: 7,
  name: 'کاربر',
  lastName: 'آزمایشی',
  nationalNumber: '0012345678',
  sex: 'male',
  accepted: true,
  isargaryType: 'none',
}

function setupProfileRequests(
  viewerType: UserType,
  targetType: UserType = viewerType,
  selected = false,
) {
  const target = { ...baseProfile, type: targetType }
  const viewer = selected
    ? { ...baseProfile, id: 1, type: viewerType }
    : { ...target, type: viewerType, accepted: false }
  let passwordRequest: { path: string; body: unknown } | null = null
  const selectedUserPath = selected ? '/7' : '/profile'
  const selectedDocumentPath = selected ? '/user/7' : '/profile'
  const selectedTransactionPath = selected ? '/users/7' : '/profile'
  const selectedPresellingPath = selected ? '/pre-selling/user/7' : '/users/pre-selling'
  const selectedSubprojectPath = selected ? '/subprojects/user/7' : '/subprojects/profile'

  server.use(
    http.get(api_base_url + '/users/profile', () => HttpResponse.json(viewer)),
    ...(selected
      ? [http.get(api_base_url + '/users/7', () => HttpResponse.json(target))]
      : []),
    http.get(api_base_url + '/user-doc' + selectedDocumentPath, () =>
      HttpResponse.json([]),
    ),
    http.get(api_base_url + '/transaction/score', () => HttpResponse.json({})),
    http.get(api_base_url + '/transaction/profile/score', () =>
      HttpResponse.json({}),
    ),
    http.get(api_base_url + '/transaction' + selectedTransactionPath, () =>
      HttpResponse.json([]),
    ),
    http.get(api_base_url + selectedPresellingPath, () => HttpResponse.json([])),
    http.get(api_base_url + selectedSubprojectPath, () => HttpResponse.json([])),
    http.get(api_base_url + '/final-transaction' + selectedTransactionPath, () =>
      HttpResponse.json([]),
    ),
    http.patch(api_base_url + '/users' + selectedUserPath, async ({ request }) => {
      passwordRequest = {
        path: new URL(request.url).pathname,
        body: await request.json(),
      }
      return HttpResponse.json(target)
    }),
  )

  return {
    getPasswordRequest: () => passwordRequest,
  }
}

function renderProfile(selected = false) {
  if (selected) {
    return render(
      <MemoryRouter initialEntries={['/users/7#personal']}>
        <Routes>
          <Route path="/users/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>,
    )
  }

  return render(
    <MemoryRouter initialEntries={['/dashboard#personal']}>
      <ProfilePage />
    </MemoryRouter>,
  )
}

async function openProfileEditor(user: ReturnType<typeof userEvent.setup>) {
  const editButtons = await screen.findAllByRole('button', { name: 'ویرایش' })
  await user.click(editButtons[0])
}

describe('ProfilePage password change', () => {
  it('controls new and confirmation password visibility independently', async () => {
    setupProfileRequests('free')
    const user = userEvent.setup()
    renderProfile()

    await openProfileEditor(user)
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

  it.each([
    ['admin', 'free'],
    ['system', 'tehranUni'],
  ] as const)(
    'lets a %s reset a %s investor password',
    async (viewerType, targetType) => {
      const requests = setupProfileRequests(viewerType, targetType, true)
      const user = userEvent.setup()
      renderProfile(true)

      await openProfileEditor(user)
      await user.click(screen.getByRole('button', { name: 'تغییر رمز عبور' }))
      await user.type(screen.getByLabelText('رمز عبور جدید'), 'new-password')
      await user.type(screen.getByLabelText('تأیید رمز عبور جدید'), 'new-password')
      await user.click(screen.getByRole('button', { name: 'تغییر رمز عبور' }))

      await waitFor(() => {
        expect(requests.getPasswordRequest()).toEqual({
          path: '/api/users/7',
          body: { password: 'new-password' },
        })
      })
    },
  )

  it.each([
    ['admin', 'admin'],
    ['admin', 'system'],
    ['system', 'admin'],
    ['system', 'system'],
  ] as const)(
    'hides a %s viewer password change for a %s target',
    async (viewerType, targetType) => {
      setupProfileRequests(viewerType, targetType, true)
      const user = userEvent.setup()
      renderProfile(true)

      await openProfileEditor(user)

      expect(
        screen.queryByRole('button', { name: 'تغییر رمز عبور' }),
      ).not.toBeInTheDocument()
    },
  )

  it('does not expose another user password change to an investor', async () => {
    setupProfileRequests('free', 'employee', true)
    renderProfile(true)

    expect((await screen.findAllByText('اطلاعات شخصی')).length).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', { name: 'تغییر رمز عبور' }),
    ).not.toBeInTheDocument()
  })

  it.each(ACCOUNT_TYPES)(
    'shows the password-preservation notice on a %s dashboard',
    async (accountType) => {
      setupProfileRequests(accountType)
      renderProfile()

      expect(await screen.findByRole('note')).toHaveTextContent(
        'کاربر گرامی، لطفا در حفظ و نگهداری رمز عبور خود کوشا باشید.',
      )
    },
  )

  it('does not show the dashboard notice on another user profile', async () => {
    setupProfileRequests('admin', 'free', true)
    renderProfile(true)

    expect((await screen.findAllByText('اطلاعات شخصی')).length).toBeGreaterThan(0)
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })
})
