import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { api_base_url } from '@/config'
import { updateTableRow } from '@/general'
import UserCreate from '@/pages/users/create'
import UsersList from '@/pages/users/userList'
import type { User } from '@/pages/users/columns'
import { server } from './mocks/server'

describe('UsersList edit identifier', () => {
  beforeEach(() => {
    server.use(http.get(api_base_url + '/users/profile', () => HttpResponse.json({ id: 1, type: 'admin' })))
  })
  it('shows the selected user identifier as the sixth optional editable field', async () => {
    const rows: User[] = [
      {
        id: 41, name: 'علی', lastName: 'رضایی', sex: 'male',
        nationalNumber: '0012345678', type: 'free',
      },
      {
        id: 73, name: 'مریم', lastName: 'احمدی', sex: 'female',
        nationalNumber: '0098765432', type: 'employee', identifier: 120,
      },
    ]
    server.use(
      http.get(api_base_url + '/users', () => HttpResponse.json(rows)),
    )
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/users/list']}>
        <UsersList />
      </MemoryRouter>,
    )

    await screen.findByText('مریم')
    await user.click(screen.getAllByRole('button', { name: 'عملیات' })[1])
    await user.click(await screen.findByRole('button', { name: 'ویرایش' }))

    const identifier = screen.getByRole('textbox', { name: 'کد شناسه' })
    expect(identifier).toBeVisible()
    expect(identifier).toHaveValue('120')
    await waitFor(() => expect(identifier).not.toHaveAttribute('readonly'))
    expect(identifier).not.toBeRequired()
    expect(screen.getAllByLabelText(/\*$|^کد شناسه$/)).toEqual([
      screen.getByLabelText('نام*'),
      screen.getByLabelText('نام خانوادگی*'),
      screen.getByLabelText('جنسیت*'),
      screen.getByLabelText('کد ملی*'),
      screen.getByLabelText('نوع عضویت*'),
      identifier,
    ])
    await user.clear(identifier)
    await user.type(identifier, '999')
    expect(identifier).toHaveValue('999')
  })

  it('saves editable fields through the existing API helper without sending the primary key', async () => {
    let requestBody: Record<string, unknown> | undefined
    server.use(
      http.patch(api_base_url + '/users/73', async ({ request }) => {
        requestBody = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: 73, ...requestBody })
      }),
    )
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/users/list']}>
        <UserCreate
          isEdit
          initialValues={{
            id: 73, name: 'مریم', lastName: 'احمدی', sex: 'female',
            nationalNumber: '0098765432', type: 'employee',
          }}
          onSubmit={values => { void updateTableRow('users', 73, values) }}
        />
      </MemoryRouter>,
    )

    await user.clear(screen.getByLabelText('نام*'))
    await user.type(screen.getByLabelText('نام*'), 'سارا')
    await user.click(screen.getByRole('button', { name: 'تغییر کاربر' }))

    await waitFor(() => {
      expect(requestBody).toEqual({
        name: 'سارا',
        lastName: 'احمدی',
        sex: 'female',
        nationalNumber: '0098765432',
        type: 'employee',
        identifier: null,
      })
    })
  })

  it.each(['admin', 'system', 'other'])(
    'shows an optional identifier to the admin on the %s creation path',
    async (type) => {
      render(
        <MemoryRouter initialEntries={['/users/create?type=' + type]}>
          <UserCreate />
        </MemoryRouter>,
      )

      expect(screen.getByLabelText('نام*')).toBeVisible()
      expect(await screen.findByLabelText('کد شناسه')).not.toBeRequired()
    },
  )
})
