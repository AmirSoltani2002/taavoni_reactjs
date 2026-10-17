import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { api_base_url } from '@/config'
import FinalTransactionsList from '@/pages/transactions/final-list'
import PresellingTransactionsList from '@/pages/transactions/preselling-list'
import { server } from './mocks/server'

const transaction = {
  id: 1,
  userId: 3,
  presellingId: 5,
  amount: 1_000_000,
  number: 'preselling-transaction',
  isConfirmed: true,
  preselling: {
    id: 5,
    project: { id: 7, name: 'پروژه آزمایشی' },
  },
  user: { id: 3, name: 'کاربر', lastName: 'آزمایشی' },
}

const finalTransaction = {
  id: 2,
  userId: 3,
  subProjectId: 11,
  amount: 1_000_000,
  number: 'final-transaction',
  isConfirmed: true,
  subProject: {
    id: 11,
    unitNumber: 4,
    block: {
      id: 9,
      name: 'بلوک آزمایشی',
      project: { id: 7, name: 'پروژه آزمایشی' },
    },
  },
  user: { id: 3, name: 'کاربر', lastName: 'آزمایشی' },
}

function CurrentLocation() {
  const location = useLocation()
  return <output aria-label="مسیر فعلی">{location.pathname}{location.hash}</output>
}

describe('Transaction user navigation', () => {
  it('opens the payment tab for a preselling transaction user when an admin clicks the row', async () => {
    server.use(
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({ id: 1, type: 'admin', accepted: true }),
      ),
      http.get(api_base_url + '/transaction', () =>
        HttpResponse.json([transaction]),
      ),
      http.get(api_base_url + '/projects/all/name', () => HttpResponse.json([])),
      http.get(api_base_url + '/users', () => HttpResponse.json([])),
    )
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/transactions/preselling/list']}>
        <CurrentLocation />
        <Routes>
          <Route path="/transactions/preselling/list" element={<PresellingTransactionsList />} />
          <Route path="/users/:userId" element={<div>پیشخوان کاربر</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(await screen.findByText('preselling-transaction'))

    expect(screen.getByLabelText('مسیر فعلی')).toHaveTextContent('/users/3#payments')
    expect(screen.getByText('پیشخوان کاربر')).toBeVisible()
  })

  it('opens the payment tab for a final transaction user when a system user clicks the row', async () => {
    server.use(
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({ id: 1, type: 'system', accepted: true }),
      ),
      http.get(api_base_url + '/final-transaction', () =>
        HttpResponse.json([finalTransaction]),
      ),
      http.get(api_base_url + '/users', () => HttpResponse.json([])),
    )
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/transactions/final/list']}>
        <CurrentLocation />
        <Routes>
          <Route path="/transactions/final/list" element={<FinalTransactionsList />} />
          <Route path="/users/:userId" element={<div>پیشخوان کاربر</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(await screen.findByText('final-transaction'))

    expect(screen.getByLabelText('مسیر فعلی')).toHaveTextContent('/users/3#payments')
    expect(screen.getByText('پیشخوان کاربر')).toBeVisible()
  })

  it('does not navigate from a regular user transaction row', async () => {
    server.use(
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({ id: 3, type: 'free', accepted: true }),
      ),
      http.get(api_base_url + '/transaction/profile', () =>
        HttpResponse.json([transaction]),
      ),
    )
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/transactions/preselling/list']}>
        <CurrentLocation />
        <Routes>
          <Route path="/transactions/preselling/list" element={<PresellingTransactionsList />} />
          <Route path="/users/:userId" element={<div>پیشخوان کاربر</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(await screen.findByText('preselling-transaction'))

    expect(screen.getByLabelText('مسیر فعلی')).toHaveTextContent('/transactions/preselling/list')
    expect(screen.queryByText('پیشخوان کاربر')).not.toBeInTheDocument()
  })
})
