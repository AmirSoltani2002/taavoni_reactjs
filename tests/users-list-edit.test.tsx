import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { api_base_url } from '@/config'
import { updateTableRow } from '@/general'
import UserCreate from '@/pages/users/create'
import UsersList from '@/pages/users/userList'
import type { User } from '@/pages/users/columns'
import { server } from './mocks/server'

describe('UsersList edit identifier', () => {
  it('shows the selected user identifier as the sixth disabled field', async () => {
    const rows: User[] = [
      {
        id: 41, name: 'علی', lastName: 'رضایی', sex: 'male',
        nationalNumber: '0012345678', type: 'free',
      },
      {
        id: 73, name: 'مریم', lastName: 'احمدی', sex: 'female',
        nationalNumber: '0098765432', type: 'employee',
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
    expect(identifier).toHaveValue('73')
    expect(identifier).toBeDisabled()
    expect(screen.getAllByLabelText(/\*$|^کد شناسه$/)).toEqual([
      screen.getByLabelText('نام*'),
      screen.getByLabelText('نام خانوادگی*'),
      screen.getByLabelText('جنسیت*'),
      screen.getByLabelText('کد ملی*'),
      screen.getByLabelText('نوع عضویت*'),
      identifier,
    ])
    await user.type(identifier, '999')
    expect(identifier).toHaveValue('73')
  })

  it('saves editable fields through the existing API helper without sending the identifier', async () => {
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
      })
    })
  })

  it.each(['admin', 'system', 'other'])(
    'omits the identifier on the %s creation path',
    (type) => {
      render(
        <MemoryRouter initialEntries={['/users/create?type=' + type]}>
          <UserCreate />
        </MemoryRouter>,
      )

      expect(screen.getByLabelText('نام*')).toBeVisible()
      expect(screen.queryByLabelText('کد شناسه')).not.toBeInTheDocument()
    },
  )
})
