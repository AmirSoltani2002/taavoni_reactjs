import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { api_base_url } from '@/config'
import ProfilePage from '@/pages/users/profile'
import { server } from './mocks/server'

const target = {
  id: 7,
  name: 'کاربر',
  lastName: 'آزمایشی',
  nationalNumber: '0012345678',
  sex: 'male',
  type: 'free',
  accepted: true,
  isargaryType: 'none',
  address: 'تهران، محل سکونت',
  workAddress: 'تهران، محل کار',
  homePhone: '02100000000',
  workPhone: '02111111111',
}

function setupRequests(selected: boolean, onPatch = vi.fn()) {
  const profile = selected
    ? { ...target, id: 1, type: 'admin', accepted: true }
    : target

  server.use(
    http.get(api_base_url + '/users/profile', () => HttpResponse.json(profile)),
    ...(selected
      ? [http.get(api_base_url + '/users/7', () => HttpResponse.json(target))]
      : []),
    http.get(
      api_base_url + (selected ? '/user-doc/user/7' : '/user-doc/profile'),
      () => HttpResponse.json([]),
    ),
    http.get(
      api_base_url + (selected ? '/transaction/score' : '/transaction/profile/score'),
      () => HttpResponse.json({}),
    ),
    http.get(
      api_base_url + (selected ? '/transaction/users/7' : '/transaction/profile'),
      () => HttpResponse.json([]),
    ),
    http.get(
      api_base_url + (selected ? '/pre-selling/user/7' : '/users/pre-selling'),
      () => HttpResponse.json([]),
    ),
    http.get(
      api_base_url + (selected ? '/subprojects/user/7' : '/subprojects/profile'),
      () => HttpResponse.json([]),
    ),
    http.get(
      api_base_url + (selected ? '/final-transaction/users/7' : '/final-transaction/profile'),
      () => HttpResponse.json([]),
    ),
    http.patch(
      api_base_url + (selected ? '/users/7' : '/users/profile'),
      async ({ request }) => {
        const body = await request.json()
        onPatch(body)
        return HttpResponse.json({ ...target, ...body })
      },
    ),
  )
}

function renderProfile(selected: boolean) {
  if (!selected) {
    return render(
      <MemoryRouter initialEntries={['/dashboard#personal']}>
        <ProfilePage />
      </MemoryRouter>,
    )
  }

  return render(
    <MemoryRouter initialEntries={['/users/7#personal']}>
      <Routes>
        <Route path="/users/:userId" element={<ProfilePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProfilePage contact information', () => {
  it('shows direct personal and contact edit controls to an accepted user', async () => {
    const user = userEvent.setup()
    setupRequests(false)
    renderProfile(false)

    expect(await screen.findByText('نشانی محل سکونت')).toBeVisible()
    expect(screen.getByText('نشانی محل کار')).toBeVisible()
    expect(screen.getByRole('button', { name: 'ویرایش' })).toBeVisible()

    await user.click(screen.getByRole('tab', { name: /^اطلاعات تماس/ }))

    expect(screen.getByRole('button', { name: 'ویرایش' })).toBeVisible()
  })

  it.each([
    { selected: false, description: 'self profile' },
    { selected: true, description: 'administrator-selected profile' },
  ])(
    'submits optional phones and the work address for the $description',
    async ({ selected }) => {
      const onPatch = vi.fn()
      const user = userEvent.setup()
      setupRequests(selected, onPatch)
      renderProfile(selected)

      await user.click(await screen.findByRole('button', { name: 'ویرایش' }))
      await user.clear(screen.getByLabelText('تلفن منزل'))
      await user.clear(screen.getByLabelText('تلفن محل کار'))
      await user.clear(screen.getByLabelText('نشانی محل کار'))
      await user.type(
        screen.getByLabelText('نشانی محل کار'),
        'تهران، دفتر جدید',
      )
      await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))

      await waitFor(() => {
        expect(onPatch).toHaveBeenCalledWith(
          expect.objectContaining({
            homePhone: '',
            workPhone: '',
            workAddress: 'تهران، دفتر جدید',
          }),
        )
      })
    },
  )
})
