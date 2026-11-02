import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { api_base_url } from '@/config'
import FinalTransactionsList from '@/pages/transactions/final-list'
import PresellingTransactionsList from '@/pages/transactions/preselling-list'
import { server } from './mocks/server'

const users = {
  pejman: { id: 2, name: 'پژمان', lastName: 'پارسا' },
  saraA: { id: 3, name: 'سارا', lastName: 'سلیمی' },
  saraB: { id: 4, name: 'سارا', lastName: 'سلیمی' },
}

const paymentUsers = [
  users.saraB,
  users.pejman,
  users.saraA,
  users.saraB,
  users.pejman,
  users.saraA,
]

const paymentNumbers = [
  'payment-sara-b-1',
  'payment-pejman-1',
  'payment-sara-a-1',
  'payment-sara-b-2',
  'payment-pejman-2',
  'payment-sara-a-2',
]

const ascendingPaymentNumbers = [
  'payment-pejman-1',
  'payment-pejman-2',
  'payment-sara-a-1',
  'payment-sara-a-2',
  'payment-sara-b-1',
  'payment-sara-b-2',
]

const descendingPaymentNumbers = [
  'payment-sara-b-1',
  'payment-sara-b-2',
  'payment-sara-a-1',
  'payment-sara-a-2',
  'payment-pejman-1',
  'payment-pejman-2',
]

const presellingTransactions = paymentUsers.map((user, index) => ({
  id: index + 1,
  userId: user.id,
  presellingId: 10,
  amount: 1_000,
  number: paymentNumbers[index],
  user,
  preselling: {
    id: 10,
    project: { id: 7, name: 'پروژه آزمایشی' },
  },
}))

const finalTransactions = paymentUsers.map((user, index) => ({
  id: index + 1,
  userId: user.id,
  subProjectId: 11,
  amount: 1_000,
  number: paymentNumbers[index],
  user,
  subProject: {
    id: 11,
    unitNumber: 4,
    block: {
      id: 9,
      name: 'بلوک آزمایشی',
      project: { id: 7, name: 'پروژه آزمایشی' },
    },
  },
}))

const pageCases = [
  {
    name: 'preselling transactions',
    endpoint: '/transaction',
    transactions: presellingTransactions,
    renderPage: () => <PresellingTransactionsList />,
  },
  {
    name: 'final transactions',
    endpoint: '/final-transaction',
    transactions: finalTransactions,
    renderPage: () => <FinalTransactionsList />,
  },
]

function getPaymentNumbersInTableOrder() {
  return screen.getAllByRole('row').slice(1).map((row) =>
    within(row).getByText(/^payment-/).textContent,
  )
}

describe.each(pageCases)('$name user sorting', (pageCase) => {
  it("sorts by Persian full name and keeps each user's records together", async () => {
    server.use(
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({ id: 1, type: 'admin', accepted: true }),
      ),
      http.get(api_base_url + '/users', () =>
        HttpResponse.json(Object.values(users)),
      ),
      http.get(api_base_url + pageCase.endpoint, () =>
        HttpResponse.json(pageCase.transactions),
      ),
      http.get(api_base_url + '/projects/all/name', () =>
        HttpResponse.json([]),
      ),
    )
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        {pageCase.renderPage()}
      </MemoryRouter>,
    )

    await screen.findByText(paymentNumbers[0])
    await user.click(screen.getByRole('columnheader', { name: /کاربر/ }))

    expect(getPaymentNumbersInTableOrder()).toEqual(ascendingPaymentNumbers)

    await user.click(screen.getByRole('columnheader', { name: /کاربر/ }))

    expect(getPaymentNumbersInTableOrder()).toEqual(descendingPaymentNumbers)
  })
})
