import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import FinalTransactionsList from '@/pages/transactions/final-list'
import PresellingTransactionsList from '@/pages/transactions/preselling-list'
import TransactionsList from '@/pages/transactions/list'
import { api_base_url } from '@/config'
import { server } from './mocks/server'

const transaction = {
  id: 1,
  userId: 3,
  presellingId: 5,
  amount: 1_000_000,
  bank: 'بانک مبدا',
  targetBank: 'بانک مقصد',
  number: 'transaction-1',
  isConfirmed: true,
  date: '2026-09-20T00:00:00.000Z',
  preselling: {
    id: 5,
    projectId: 7,
    project: { id: 7, name: 'پروژه آزمایشی' },
  },
  user: { id: 3, name: 'کاربر', lastName: 'آزمایشی' },
}

const finalTransaction = {
  id: 2,
  userId: 3,
  subProjectId: 11,
  amount: 1_000_000,
  bank: 'بانک مبدا',
  targetBank: 'بانک مقصد',
  number: 'transaction-2',
  isConfirmed: true,
  date: '2026-09-20T00:00:00.000Z',
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

function useCommonHandlers() {
  server.use(
    http.get(api_base_url + '/users/profile', () =>
      HttpResponse.json({ id: 1, type: 'admin', accepted: true }),
    ),
    http.get(api_base_url + '/users', () => HttpResponse.json([])),
    http.get(api_base_url + '/pre-selling/user/3', () =>
      HttpResponse.json([transaction.preselling]),
    ),
    http.get(api_base_url + '/subprojects/user/3', () =>
      HttpResponse.json([finalTransaction.subProject]),
    ),
  )
}

describe('Transaction currency labels', () => {
  it('uses rial for preselling transaction amounts', async () => {
    const user = userEvent.setup()
    useCommonHandlers()
    server.use(
      http.get(api_base_url + '/transaction', () =>
        HttpResponse.json([transaction]),
      ),
      http.get(api_base_url + '/projects/all/name', () =>
        HttpResponse.json([]),
      ),
    )

    render(<PresellingTransactionsList />)

    expect(await screen.findAllByText(/ریال/)).toHaveLength(3)
    expect(screen.queryByText(/تومان/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'عملیات' }))
    await user.click(
      screen.getByRole('button', { name: /ویرایش تراکنش/ }),
    )
    expect(
      await screen.findByRole('heading', { name: 'ویرایش تراکنش' }),
    ).toBeVisible()
  })

  it('uses rial for final transaction amounts', async () => {
    const user = userEvent.setup()
    useCommonHandlers()
    server.use(
      http.get(api_base_url + '/final-transaction', () =>
        HttpResponse.json([finalTransaction]),
      ),
    )

    render(<FinalTransactionsList />)

    expect(await screen.findAllByText(/ریال/)).toHaveLength(4)
    expect(screen.queryByText(/تومان/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'عملیات' }))
    await user.click(
      screen.getByRole('button', { name: /ویرایش تراکنش/ }),
    )
    expect(
      await screen.findByRole('heading', { name: 'ویرایش تراکنش' }),
    ).toBeVisible()
  })

  it('uses rial for legacy transaction summaries and table amounts', async () => {
    const user = userEvent.setup()
    useCommonHandlers()
    server.use(
      http.get(api_base_url + '/transaction', () =>
        HttpResponse.json([transaction]),
      ),
      http.get(api_base_url + '/projects/all', () => HttpResponse.json([])),
    )

    render(<TransactionsList />)

    expect(await screen.findAllByText(/ریال/)).toHaveLength(2)
    expect(screen.queryByText(/تومان/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'عملیات' }))
    await user.click(
      screen.getByRole('button', { name: /ویرایش تراکنش/ }),
    )
    expect(
      await screen.findByRole('heading', { name: 'ویرایش تراکنش' }),
    ).toBeVisible()
  })

  it('does not offer transaction editing to a regular user', async () => {
    server.use(
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({ id: 3, type: 'free', accepted: true }),
      ),
      http.get(api_base_url + '/transaction/profile', () =>
        HttpResponse.json([transaction]),
      ),
    )

    render(<PresellingTransactionsList />)

    expect(await screen.findByText('transaction-1')).toBeVisible()
    expect(screen.queryByText('ویرایش تراکنش')).not.toBeInTheDocument()
  })
})
