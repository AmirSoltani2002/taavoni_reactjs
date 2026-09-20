import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import FinalTransactionCreate from '@/pages/transactions/final-create'
import PresellingTransactionCreate from '@/pages/transactions/preselling-create'
import { api_base_url } from '@/config'
import { server } from './mocks/server'

const transactionForms = [
  {
    name: 'preselling',
    Component: PresellingTransactionCreate,
  },
  {
    name: 'final',
    Component: FinalTransactionCreate,
  },
]

describe('Transaction creation forms', () => {
  it.each(transactionForms)(
    'uses rial and accepts free-text bank names in the $name form',
    async ({ Component }) => {
      server.use(
        http.get(api_base_url + '/users', () => HttpResponse.json([])),
      )
      const user = userEvent.setup()
      render(<Component userInfo={{ type: 'admin' }} />)

      expect(screen.getByLabelText(/مبلغ \(ریال\)/)).toBeInTheDocument()

      const bankInput = screen.getByRole('textbox', { name: /بانک مبدا/ })
      const targetBankInput = screen.getByRole('textbox', { name: /بانک مقصد/ })

      expect(bankInput).toHaveAttribute('name', 'bank')
      expect(bankInput).toBeRequired()
      expect(targetBankInput).toHaveAttribute('name', 'targetBank')
      expect(targetBankInput).toBeRequired()

      await user.type(bankInput, 'بانک سفارشی مبدا')
      await user.type(targetBankInput, 'بانک سفارشی مقصد')

      expect(bankInput).toHaveValue('بانک سفارشی مبدا')
      expect(targetBankInput).toHaveValue('بانک سفارشی مقصد')
    },
  )
})
