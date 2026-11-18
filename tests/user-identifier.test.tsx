import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Toaster } from '@/components/ui/sonner'
import { api_base_url } from '@/config'
import { updateTableRow } from '@/general'
import { USER_IDENTIFIER_ERROR } from '@/lib/user-identifier'
import type { User, UserType } from '@/pages/users/columns'
import UserCreate from '@/pages/users/create'
import ProfilePage from '@/pages/users/profile'
import UsersList from '@/pages/users/userList'
import { server } from './mocks/server'

const target: User = {
  id: 7, name: 'علی', lastName: 'رضایی', sex: 'male',
  nationalNumber: '0012345678', type: 'free', isargaryType: 'none',
  accepted: true, identifier: 456,
}

function viewer(type: UserType) {
  server.use(http.get(api_base_url + '/users/profile', () =>
    HttpResponse.json({ ...target, id: 1, type }),
  ))
}

function renderUserForm(isEdit = true, identifier: number | null = 456) {
  return render(
    <MemoryRouter initialEntries={['/users/' + (isEdit ? 'list' : 'create')]}>
      <UserCreate isEdit={isEdit} initialValues={{ ...target, identifier, password: isEdit ? undefined : 'safe-password' }}
        onSubmit={isEdit ? values => { void updateTableRow('users', 7, values) } : undefined} />
      <Toaster />
    </MemoryRouter>,
  )
}

function profileRequests(type: UserType, selected: boolean, identifier: number | null = 456) {
  const record = { ...target, identifier }
  const onPatch = vi.fn()
  server.use(
    http.get(api_base_url + '/users/profile', () => HttpResponse.json(
      selected ? { ...record, id: 1, type } : { ...record, type },
    )),
    http.get(api_base_url + '/users/7', () => HttpResponse.json(record)),
    http.get(api_base_url + (selected ? '/user-doc/user/7' : '/user-doc/profile'), () => HttpResponse.json([])),
    http.get(api_base_url + (selected ? '/transaction/score' : '/transaction/profile/score'), () => HttpResponse.json({})),
    http.get(api_base_url + (selected ? '/transaction/users/7' : '/transaction/profile'), () => HttpResponse.json([])),
    http.get(api_base_url + (selected ? '/pre-selling/user/7' : '/users/pre-selling'), () => HttpResponse.json([])),
    http.get(api_base_url + (selected ? '/subprojects/user/7' : '/subprojects/profile'), () => HttpResponse.json([])),
    http.get(api_base_url + (selected ? '/final-transaction/users/7' : '/final-transaction/profile'), () => HttpResponse.json([])),
    http.patch(api_base_url + (selected ? '/users/7' : '/users/profile'), async ({ request }) => {
      const body = await request.json() as Record<string, unknown>
      onPatch(body)
      return HttpResponse.json({ ...record, ...body })
    }),
  )
  return onPatch
}

function renderProfile(selected: boolean) {
  render(
    <MemoryRouter initialEntries={[selected ? '/users/7#personal' : '/dashboard#personal']}>
      <Routes>
        <Route path={selected ? '/users/:userId' : '/dashboard'} element={<ProfilePage />} />
      </Routes>
      <Toaster />
    </MemoryRouter>,
  )
}

async function openProfileEditor() {
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: 'ویرایش' }))
  return user
}

describe('User identifier', () => {
  it.each(['admin', 'system'] as const)('lets a %s create a user with identifier zero', async type => {
    viewer(type)
    let requestBody: Record<string, unknown> | undefined
    server.use(http.post(api_base_url + '/users/admin', async ({ request }) => {
      requestBody = await request.json() as Record<string, unknown>
      return HttpResponse.json({ id: 8, ...requestBody })
    }))
    const user = userEvent.setup()
    renderUserForm(false, null)
    const input = await screen.findByLabelText('کد شناسه')
    expect(input).not.toBeRequired()
    await user.type(input, '0')
    await user.click(screen.getByRole('button', { name: 'افزودن کاربر' }))
    await waitFor(() => expect(requestBody).toMatchObject({ identifier: 0, name: 'علی' }))
    expect(await screen.findByText('کاربر با موفقیت ایجاد شد')).toBeVisible()
    expect(input).toHaveValue('')
  })

  it('does not grant identifier editing from an admin URL marker', async () => {
    viewer('free')
    render(<MemoryRouter initialEntries={['/users/create?type=admin']}><UserCreate /></MemoryRouter>)
    await screen.findByLabelText('نام*')
    expect(screen.queryByLabelText('کد شناسه')).not.toBeInTheDocument()
  })

  it('creates a user with an empty identifier', async () => {
    viewer('admin')
    const onPost = vi.fn()
    server.use(http.post(api_base_url + '/users/admin', async ({ request }) => {
      onPost(await request.json())
      return HttpResponse.json({ id: 8, identifier: null })
    }))
    const user = userEvent.setup()
    renderUserForm(false, null)
    await screen.findByLabelText('کد شناسه')
    await user.click(screen.getByRole('button', { name: 'افزودن کاربر' }))
    await waitFor(() => expect(onPost).toHaveBeenCalledWith(expect.objectContaining({ identifier: null })))
  })

  it.each(['admin', 'system'] as const)('lets a %s edit the list identifier and refreshes the table', async type => {
    viewer(type)
    let record = { ...target }
    const onPatch = vi.fn()
    server.use(
      http.get(api_base_url + '/users', () => HttpResponse.json([record])),
      http.patch(api_base_url + '/users/7', async ({ request }) => {
        const body = await request.json() as Partial<User>
        onPatch(body)
        record = { ...record, ...body }
        return HttpResponse.json(record)
      }),
    )
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/users/list']}><UsersList /></MemoryRouter>)
    const table = await screen.findByRole('table')
    expect(await within(table).findByText('456')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'عملیات' }))
    await user.click(await screen.findByRole('button', { name: 'ویرایش' }))
    const input = await screen.findByLabelText('کد شناسه')
    await waitFor(() => expect(input).not.toHaveAttribute('readonly'))
    expect(input).toHaveValue('456')
    await user.clear(input)
    await user.type(input, '۱۲۳')
    await user.click(screen.getByRole('button', { name: 'تغییر کاربر' }))
    await waitFor(() => expect(onPatch).toHaveBeenCalledWith(expect.objectContaining({ identifier: 123 })))
    expect(onPatch.mock.calls[0][0]).not.toHaveProperty('id')
    expect(await within(table).findByText('123')).toBeVisible()
    expect(screen.queryByLabelText('کد شناسه')).not.toBeInTheDocument()
  })

  it('clears the list identifier with null', async () => {
    viewer('admin')
    const onPatch = vi.fn()
    server.use(http.patch(api_base_url + '/users/7', async ({ request }) => {
      onPatch(await request.json())
      return HttpResponse.json({ ...target, identifier: null })
    }))
    const user = userEvent.setup()
    renderUserForm()
    const input = screen.getByLabelText('کد شناسه')
    await waitFor(() => expect(input).not.toHaveAttribute('readonly'))
    await user.clear(input)
    await user.click(screen.getByRole('button', { name: 'تغییر کاربر' }))
    await waitFor(() => expect(onPatch).toHaveBeenCalledWith(expect.objectContaining({ identifier: null })))
  })

  it.each(['abc', '1.5', '-1', '1e3', '2147483648'])(
    'warns and blocks invalid input %s in the list editor', async value => {
      viewer('admin')
      const onPatch = vi.fn()
      server.use(http.patch(api_base_url + '/users/7', () => { onPatch(); return HttpResponse.json(target) }))
      const user = userEvent.setup()
      renderUserForm()
      const input = screen.getByLabelText('کد شناسه')
      await waitFor(() => expect(input).not.toHaveAttribute('readonly'))
      await user.clear(input)
      await user.type(input, value)
      await user.click(screen.getByRole('button', { name: 'تغییر کاربر' }))
      expect(await screen.findByText(USER_IDENTIFIER_ERROR)).toBeVisible()
      expect(onPatch).not.toHaveBeenCalled()
    },
  )

  it('shows an unset table identifier as a placeholder, preserving zero', async () => {
    server.use(http.get(api_base_url + '/users', () => HttpResponse.json([
      { ...target, identifier: null }, { ...target, id: 8, identifier: 0 },
    ])))
    render(<MemoryRouter initialEntries={['/users/list']}><UsersList /></MemoryRouter>)
    const table = await screen.findByRole('table')
    expect(await within(table).findByText('-')).toBeVisible()
    expect(within(table).getByText('0')).toBeVisible()
  })

  it.each([
    { type: 'admin', selected: true }, { type: 'system', selected: true },
    { type: 'admin', selected: false }, { type: 'system', selected: false },
  ] as const)('lets a $type edit and clear the profile identifier (selected=$selected)', async ({ type, selected }) => {
    const onPatch = profileRequests(type, selected)
    renderProfile(selected)
    expect(await screen.findByText('456')).toBeVisible()
    const user = await openProfileEditor()
    const input = screen.getByLabelText('شناسه')
    expect(input).not.toBeRequired()
    await user.clear(input)
    await user.type(input, '0')
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))
    await waitFor(() => expect(onPatch).toHaveBeenLastCalledWith(expect.objectContaining({ identifier: 0 })))
    expect(await screen.findByText('0')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'ویرایش' }))
    await user.clear(screen.getByLabelText('شناسه'))
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))
    await waitFor(() => expect(onPatch).toHaveBeenLastCalledWith(expect.objectContaining({ identifier: null })))
  })

  it.each(['free', 'employee', 'tehranUni', 'universityFaculty', 'otherUni', 'otherUniversityFaculty'] as const)(
    'lets a %s see their own identifier without sending it on unrelated saves', async type => {
      const onPatch = profileRequests(type, false)
      renderProfile(false)
      expect(await screen.findByText('456')).toBeVisible()
      const user = await openProfileEditor()
      const input = screen.getByLabelText('شناسه')
      expect(input).toHaveAttribute('readonly')
      await user.type(input, '999')
      expect(input).toHaveValue('456')
      await user.clear(screen.getByLabelText('نشانی محل کار'))
      await user.type(screen.getByLabelText('نشانی محل کار'), 'تهران')
      await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))
      await waitFor(() => expect(onPatch).toHaveBeenCalled())
      expect(onPatch.mock.calls[0][0]).not.toHaveProperty('identifier')
      expect(onPatch.mock.calls[0][0]).toHaveProperty('workAddress', 'تهران')
    },
  )

  it('keeps an unset regular user identifier read-only', async () => {
    profileRequests('free', false, null)
    renderProfile(false)
    await openProfileEditor()
    expect(screen.getByLabelText('شناسه')).toHaveValue('')
    expect(screen.getByLabelText('شناسه')).toHaveAttribute('readonly')
  })

  it('warns before submitting an invalid profile identifier', async () => {
    const onPatch = profileRequests('admin', true)
    renderProfile(true)
    const user = await openProfileEditor()
    await user.clear(screen.getByLabelText('شناسه'))
    await user.type(screen.getByLabelText('شناسه'), '1.5')
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))
    expect(await screen.findByText(USER_IDENTIFIER_ERROR)).toBeVisible()
    expect(onPatch).not.toHaveBeenCalled()
  })

  it('restores the saved identifier after cancelling profile edits', async () => {
    const onPatch = profileRequests('admin', true)
    renderProfile(true)
    const user = await openProfileEditor()
    await user.clear(screen.getByLabelText('شناسه'))
    await user.type(screen.getByLabelText('شناسه'), '999')
    await user.click(screen.getByRole('button', { name: 'انصراف' }))
    expect(await screen.findByText('456')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'ویرایش' }))
    expect(screen.getByLabelText('شناسه')).toHaveValue('456')
    expect(onPatch).not.toHaveBeenCalled()
  })

  it('keeps the profile editor open and displays duplicate identifier errors', async () => {
    profileRequests('admin', true)
    server.use(http.patch(api_base_url + '/users/7', () => HttpResponse.json(
      { message: 'شناسه تکراری است' }, { status: 409 },
    )))
    renderProfile(true)
    const user = await openProfileEditor()
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))
    expect(await screen.findByText('شناسه تکراری است')).toBeVisible()
    expect(screen.getByLabelText('شناسه')).toBeVisible()
  })
})
