import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, delay, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { UserSelectDialog } from '@/components/user-select-dialog'
import { api_base_url } from '@/config'
import { server } from './mocks/server'

function renderDialog() {
  return render(
    <MemoryRouter>
      <UserSelectDialog open onOpenChange={vi.fn()} />
    </MemoryRouter>,
  )
}

describe('UserSelectDialog', () => {
  it('shows a loading state while GET /users is pending', async () => {
    server.use(
      http.get(api_base_url + '/users', async () => {
        await delay('infinite')
        return HttpResponse.json([])
      }),
    )

    renderDialog()

    expect(await screen.findByText('لطفا کمی صبر کنید')).toBeVisible()
  })

  it('renders returned users and filters them from the search form', async () => {
    server.use(
      http.get(api_base_url + '/users', () =>
        HttpResponse.json([
          {
            id: 8,
            name: 'علی',
            lastName: 'رضایی',
            email: 'ali@example.test',
            mobile: '09120000000',
            nationalNumber: '0012345678',
            type: 'free',
          },
          {
            id: 9,
            name: 'مریم',
            lastName: 'احمدی',
            email: 'maryam@example.test',
            type: 'employee',
          },
        ]),
      ),
    )
    const user = userEvent.setup()
    renderDialog()

    expect(await screen.findByText('علی رضایی')).toBeVisible()
    expect(screen.getByText('مریم احمدی')).toBeVisible()

    await user.type(screen.getByLabelText('جستجوی کاربر'), 'مریم')

    expect(screen.queryByText('علی رضایی')).not.toBeInTheDocument()
    expect(screen.getByText('مریم احمدی')).toBeVisible()
  })
})
