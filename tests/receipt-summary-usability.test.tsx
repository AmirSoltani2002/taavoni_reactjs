import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { api_base_url } from '@/config'
import TransactionSummaryList from '@/pages/transactions/sum-list'
import PresellingTransactionsList from '@/pages/transactions/preselling-list'
import FinalTransactionsList from '@/pages/transactions/final-list'
import type { ReceiptType } from '@/pages/transactions/summary'
import { server } from './mocks/server'

const cases: { type: ReceiptType; endpoint: string; label: string }[] = [
  { type: 'preselling', endpoint: '/transaction', label: 'پیش‌فروش' },
  { type: 'final', endpoint: '/final-transaction', label: 'نهایی' },
]

function CurrentLocation() {
  const location = useLocation()
  return <output aria-label="مسیر فعلی">{location.pathname}{location.hash}</output>
}

const tableRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)
const rowNumbers = () => tableRows().map(row => within(row).getAllByRole('cell')[0].textContent)
const rial = (amount: number) => `${amount.toLocaleString('fa-IR')} ریال`

describe.each(cases)('$type receipt summary usability', ({ type, endpoint, label }) => {
  it('includes all banks, renumbers displayed rows after sorting and filtering, and opens user payments', async () => {
    const receipts = [
      { userId: 2, name: 'سارا', projectId: 7, amount: 200, targetBank: 'بانک الف' },
      { userId: 2, name: 'سارا', projectId: 7, amount: 100, targetBank: 'بانک ب' },
      { userId: 3, name: 'پژمان', projectId: 7, amount: 400, targetBank: 'بانک ب' },
      { userId: 2, name: 'سارا', projectId: 8, amount: 50, targetBank: null },
    ].map((receipt, index) => ({
      ...receipt, id: index + 1, user: { id: receipt.userId, name: receipt.name },
      ...(type === 'preselling'
        ? { preselling: { project: { id: receipt.projectId, name: `پروژه ${receipt.projectId}` } } }
        : { subProject: { block: { project: { id: receipt.projectId, name: `پروژه ${receipt.projectId}` } } } }),
    }))
    server.use(
      http.get(api_base_url + '/users/profile', () => HttpResponse.json({ id: 1, type: type === 'preselling' ? 'admin' : 'system' })),
      http.get(api_base_url + endpoint, () => HttpResponse.json(receipts)),
    )
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[`/transactions/${type}/sumlist`]}>
        <CurrentLocation />
        <Routes>
          <Route path={`/transactions/${type}/sumlist`} element={<TransactionSummaryList type={type} />} />
          <Route path="/users/:userId" element={<div>پیشخوان کاربر</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: `جمع رسیدهای ${label}` })).toBeVisible()
    await within(await screen.findByRole('table')).findByText(rial(300))
    expect(screen.queryByLabelText('فیلتر بر اساس بانک مقصد')).not.toBeInTheDocument()
    expect(screen.queryByText('فیلتر بر اساس بانک مقصد')).not.toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('ردیف')
    expect(rowNumbers()).toEqual(['۱', '۲', '۳'])
    expect(screen.getAllByRole('link', { name: 'سارا' })).toHaveLength(2)
    for (const link of screen.getAllByRole('link', { name: 'سارا' })) {
      expect(link).toHaveAttribute('href', '/users/2#payments')
    }

    await user.click(screen.getByRole('columnheader', { name: 'کاربر' }))
    expect(within(tableRows()[0]).getByRole('link', { name: 'پژمان' })).toHaveAttribute('href', '/users/3#payments')
    expect(rowNumbers()).toEqual(['۱', '۲', '۳'])
    await user.click(screen.getByRole('columnheader', { name: 'مجموع پرداختی‌ها' }))
    expect(within(tableRows()[0]).getByText(rial(50))).toBeVisible()
    expect(rowNumbers()).toEqual(['۱', '۲', '۳'])

    await user.selectOptions(screen.getByLabelText('فیلتر بر اساس پروژه'), '7')
    expect(rowNumbers()).toEqual(['۱', '۲'])
    await user.click(screen.getByRole('combobox', { name: '' }))
    await user.click(screen.getByRole('option', { name: 'سارا' }))
    expect(rowNumbers()).toEqual(['۱'])
    expect(within(tableRows()[0]).getByText(rial(300))).toBeVisible()
    const stats = screen.getByRole('region', { name: 'آمار تراکنش‌های فیلتر شده' })
    expect(within(stats).getByText('۲')).toBeVisible()
    expect(within(stats).getByText(rial(300))).toBeVisible()
    expect(within(stats).getByText(rial(150))).toBeVisible()

    const link = screen.getByRole('link', { name: 'سارا' })
    link.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('مسیر فعلی')).toHaveTextContent('/users/2#payments')
    expect(screen.getByText('پیشخوان کاربر')).toBeVisible()
  })

  it.each(['admin', 'system', 'free'])('uses the renamed receipt page heading for %s and keeps its bank filter', async userType => {
    const receipts = [{
      id: 1, userId: 2, amount: 100, targetBank: 'بانک الف',
      user: { id: 2, name: 'سارا' },
      ...(type === 'preselling'
        ? { preselling: { project: { id: 7, name: 'پروژه 7' } } }
        : { subProject: { block: { project: { id: 7, name: 'پروژه 7' } } } }),
    }]
    server.use(
      http.get(api_base_url + '/users/profile', () => HttpResponse.json({ id: 1, type: userType, accepted: true })),
      http.get(api_base_url + endpoint, () => HttpResponse.json(receipts)),
      http.get(api_base_url + endpoint + '/profile', () => HttpResponse.json(receipts)),
      http.get(api_base_url + '/projects/all/name', () => HttpResponse.json([])),
      http.get(api_base_url + '/users', () => HttpResponse.json([])),
    )
    render(<MemoryRouter>{type === 'preselling' ? <PresellingTransactionsList /> : <FinalTransactionsList />}</MemoryRouter>)
    await within(await screen.findByRole('table')).findByText(rial(100))
    expect(screen.getByRole('heading', { name: `رسیدهای ${label}` })).toBeVisible()
    if (userType !== 'free') expect(screen.getByLabelText('فیلتر بر اساس بانک مقصد')).toBeVisible()
  })
})
