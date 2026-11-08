import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { api_base_url } from '@/config'
import TransactionSummaryList from '@/pages/transactions/sum-list'
import type { ReceiptType } from '@/pages/transactions/summary'
import { server } from './mocks/server'

const cases: { type: ReceiptType; endpoint: string; label: string }[] = [
  { type: 'preselling', endpoint: '/transaction', label: 'پیش‌فروش' },
  { type: 'final', endpoint: '/final-transaction', label: 'نهایی' },
]
const users = [
  { id: 2, name: 'سارا', lastName: 'سلیمی' },
  { id: 3, name: 'پژمان', lastName: 'پارسا' },
]

function receipts(type: ReceiptType) {
  return [
    { userIndex: 0, projectId: 7, amount: 200, date: '2026-09-22', targetBank: 'بانک الف' },
    { userIndex: 0, projectId: 7, amount: 100, date: '2026-09-20', targetBank: 'بانک ب' },
    { userIndex: 0, projectId: 7, amount: 50, date: null, targetBank: 'بانک الف' },
    { userIndex: 1, projectId: 7, amount: 400, date: null, targetBank: 'بانک ب' },
    { userIndex: 0, projectId: 8, amount: 0, date: null, targetBank: 'بانک الف' },
  ].map((receipt, index) => ({
    ...receipt, id: index + 1, userId: users[receipt.userIndex].id,
    user: users[receipt.userIndex], isConfirmed: index % 2 === 0,
    // Different preselling records/units must still combine under the same project.
    ...(type === 'preselling'
      ? { presellingId: index + 10, preselling: { id: index + 10, project: { id: receipt.projectId, name: `پروژه ${receipt.projectId}` } } }
      : { subProjectId: index + 10, subProject: { id: index + 10, block: { project: { id: receipt.projectId, name: `پروژه ${receipt.projectId}` } } } }),
  }))
}

function profile(type = 'admin') {
  server.use(http.get(api_base_url + '/users/profile', () => HttpResponse.json({ id: 1, type })))
}

const rial = (amount: number) => `${amount.toLocaleString('fa-IR')} ریال`
const dateLabel = (date: string) => new Date(date).toLocaleDateString('fa-IR')
const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)

describe.each(cases)('$type receipt summaries', ({ type, endpoint, label }) => {
  it('combines receipts per user/project with earliest/latest dates, rial amounts, and no mutations', async () => {
    profile(type === 'preselling' ? 'admin' : 'system')
    server.use(http.get(api_base_url + endpoint, () => HttpResponse.json(receipts(type))))
    const user = userEvent.setup()
    render(<TransactionSummaryList type={type} />, { wrapper: MemoryRouter })

    expect(await screen.findByText(rial(350))).toBeVisible()
    expect(screen.getByRole('heading', { name: `جمع رسیدهای ${label}` })).toBeVisible()
    expect(screen.getByText(`مشاهده مجموع پرداختی‌های ${label} هر کاربر برای هر پروژه`)).toBeVisible()
    expect(screen.getAllByRole('columnheader').map(cell => cell.textContent)).toEqual([
      'ردیف', 'کاربر', 'پروژه', 'تاریخ اولین پرداخت', 'تاریخ آخرین پرداخت', 'مجموع پرداختی‌ها',
    ])
    expect(rows()).toHaveLength(3)
    expect(within(rows()[0]).getAllByRole('cell').map(cell => cell.textContent)).toEqual([
      '۱', 'سارا سلیمی', 'پروژه 7', dateLabel('2026-09-20'), dateLabel('2026-09-22'), rial(350),
    ])
    expect(within(rows()[1]).getAllByText('—')).toHaveLength(2)
    expect(within(rows()[2]).getByText(rial(0))).toBeVisible()
    const stats = screen.getByRole('region', { name: 'آمار تراکنش‌های فیلتر شده' })
    expect(within(stats).getByText('۵')).toBeVisible()
    expect(within(stats).getByText(rial(750))).toBeVisible()
    expect(within(stats).getByText(rial(150))).toBeVisible()
    expect(screen.queryByRole('button', { name: /ثبت رسید|عملیات/ })).not.toBeInTheDocument()
    await user.pointer({ target: within(rows()[0]).getByText(rial(350)), keys: '[MouseRight]' })
    expect(screen.queryByRole('menuitem', { name: /حذف|ویرایش/ })).not.toBeInTheDocument()
  })

  it('applies project and user filters across all banks before calculating rows and statistics', async () => {
    profile()
    server.use(http.get(api_base_url + endpoint, () => HttpResponse.json(receipts(type))))
    const user = userEvent.setup()
    render(<TransactionSummaryList type={type} />, { wrapper: MemoryRouter })
    await screen.findByText(rial(350))
    await user.selectOptions(screen.getByLabelText('فیلتر بر اساس پروژه'), '7')
    expect(rows()).toHaveLength(2)
    await user.click(screen.getByRole('combobox', { name: '' }))
    await user.click(screen.getByRole('option', { name: 'سارا سلیمی' }))
    expect(rows()).toHaveLength(1)
    expect(screen.queryByLabelText('فیلتر بر اساس بانک مقصد')).not.toBeInTheDocument()
    expect(within(rows()[0]).getByText(rial(350))).toBeVisible()
    expect(within(rows()[0]).getByText(dateLabel('2026-09-20'))).toBeVisible()
    expect(within(rows()[0]).getByText(dateLabel('2026-09-22'))).toBeVisible()
    const stats = screen.getByRole('region', { name: 'آمار تراکنش‌های فیلتر شده' })
    expect(within(stats).getByText('۳')).toBeVisible()
    expect(within(stats).getByText(rial(350))).toBeVisible()
    expect(within(stats).getByText(rial(117))).toBeVisible()
    await user.selectOptions(screen.getByLabelText('فیلتر بر اساس پروژه'), '8')
    expect(within(rows()[0]).getByText(rial(0))).toBeVisible()
    await user.click(screen.getByRole('combobox', { name: '' }))
    await user.click(screen.getByRole('option', { name: 'پژمان پارسا' }))
    expect(screen.getByText('نتیجه ای یافت نشد.')).toBeVisible()
  })

  it('sorts users by Persian name and amounts numerically', async () => {
    profile()
    server.use(http.get(api_base_url + endpoint, () => HttpResponse.json(receipts(type))))
    const user = userEvent.setup()
    render(<TransactionSummaryList type={type} />, { wrapper: MemoryRouter })
    await screen.findByText(rial(350))
    await user.click(screen.getByRole('columnheader', { name: 'کاربر' }))
    expect(within(rows()[0]).getByText('پژمان پارسا')).toBeVisible()
    await user.click(screen.getByRole('columnheader', { name: 'مجموع پرداختی‌ها' }))
    expect(within(rows()[0]).getByText(rial(0))).toBeVisible()
  })

  it('blocks regular users without fetching all receipts', async () => {
    profile('free')
    render(<TransactionSummaryList type={type} />, { wrapper: MemoryRouter })
    expect(await screen.findByRole('alert')).toHaveTextContent('شما اجازه دسترسی به این صفحه را ندارید')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows loading and the backend error without a table when loading fails', async () => {
    profile()
    let resolveRequest: () => void = () => undefined
    const pending = new Promise<void>(resolve => { resolveRequest = resolve })
    server.use(http.get(api_base_url + endpoint, async () => {
      await pending
      return HttpResponse.json({ message: 'خطای دریافت رسیدها' }, { status: 500 })
    }))
    render(<TransactionSummaryList type={type} />, { wrapper: MemoryRouter })
    expect(screen.getByText('لطفا کمی صبر کنید')).toBeVisible()
    resolveRequest()
    expect(await screen.findByRole('alert')).toHaveTextContent('خطای دریافت رسیدها')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByText('لطفا کمی صبر کنید')).not.toBeInTheDocument()
  })

  it('shows an empty table when there are no receipts', async () => {
    profile()
    server.use(http.get(api_base_url + endpoint, () => HttpResponse.json([])))
    render(<TransactionSummaryList type={type} />, { wrapper: MemoryRouter })
    expect(await screen.findByRole('table')).toBeVisible()
    expect(screen.getByText('نتیجه ای یافت نشد.')).toBeVisible()
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })

  it('reloads current source records on reopening after additions, edits, and deletions', async () => {
    profile()
    let current = receipts(type).slice(0, 1)
    server.use(http.get(api_base_url + endpoint, () => HttpResponse.json(current)))
    let view = render(<TransactionSummaryList type={type} />, { wrapper: MemoryRouter })
    await within(await screen.findByRole('table')).findByText(rial(200))
    view.unmount()
    current = receipts(type).slice(0, 2)
    view = render(<TransactionSummaryList type={type} />, { wrapper: MemoryRouter })
    await within(await screen.findByRole('table')).findByText(rial(300))
    view.unmount()
    current = current.map(receipt => ({ ...receipt, amount: 500, date: '2026-09-25' }))
    view = render(<TransactionSummaryList type={type} />, { wrapper: MemoryRouter })
    await within(await screen.findByRole('table')).findByText(rial(1000))
    expect(within(rows()[0]).getAllByText(dateLabel('2026-09-25'))).toHaveLength(2)
    view.unmount()
    current = []
    render(<TransactionSummaryList type={type} />, { wrapper: MemoryRouter })
    await waitFor(() => expect(screen.queryByText('لطفا کمی صبر کنید')).not.toBeInTheDocument())
    expect(screen.getByText('نتیجه ای یافت نشد.')).toBeVisible()
  })
})
