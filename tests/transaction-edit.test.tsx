import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { api_base_url } from '@/config'
import FinalTransactionCreate from '@/pages/transactions/final-create'
import PresellingTransactionCreate from '@/pages/transactions/preselling-create'
import { server } from './mocks/server'

const admin = {
  id: 1,
  type: 'admin' as const,
}

describe('Transaction edit forms', () => {
  it('prefills and edits every preselling transaction field while removing its document', async () => {
    let submittedForm: FormData | undefined
    server.use(
      http.get(api_base_url + '/users', () =>
        HttpResponse.json([
          { id: 7, name: 'کاربر', lastName: 'نمونه', type: 'free' },
        ]),
      ),
      http.get(api_base_url + '/pre-selling/user/7', () =>
        HttpResponse.json([
          {
            id: 15,
            userId: 7,
            area: 100,
            project: { id: 2, name: 'پروژه نمونه' },
          },
        ]),
      ),
      http.patch(api_base_url + '/transaction/12', async ({ request }) => {
        submittedForm = await request.formData()
        return HttpResponse.json({ id: 12 })
      }),
    )
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(
      <PresellingTransactionCreate
        isEdit
        userInfo={admin}
        onSubmit={onSubmit}
        initialValues={{
          id: 12,
          userId: 7,
          presellingId: 15,
          amount: 2_500_000,
          bank: 'بانک مبدا',
          targetBank: 'بانک مقصد',
          number: 'TR-12',
          detail: 'شرح اولیه',
          date: '2026-09-20T00:00:00.000Z',
          isConfirmed: false,
          document: 'receipt.pdf',
        }}
      />,
    )

    expect(screen.getByLabelText(/مبلغ \(ریال\)/)).toHaveValue('2,500,000')
    expect(screen.getByRole('textbox', { name: /بانک مبدا/ })).toHaveValue(
      'بانک مبدا',
    )
    expect(screen.getByText('receipt.pdf')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'حذف سند' }))
    await user.clear(screen.getByRole('textbox', { name: /جزئیات/ }))
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(submittedForm?.get('userId')).toBe('7')
    expect(submittedForm?.get('presellingId')).toBe('15')
    expect(submittedForm?.get('amount')).toBe('2500000')
    expect(submittedForm?.get('detail')).toBe('')
    expect(submittedForm?.get('isConfirmed')).toBe('false')
    expect(submittedForm?.get('removeDocument')).toBe('true')
    expect(submittedForm?.get('file')).toBeNull()
  })

  it('replaces a final transaction document and loads units for its owner', async () => {
    server.use(
      http.get(api_base_url + '/users', () =>
        HttpResponse.json([
          { id: 7, name: 'کاربر', lastName: 'نمونه', type: 'free' },
        ]),
      ),
      http.get(api_base_url + '/subprojects/user/7', () =>
        HttpResponse.json([
          {
            id: 22,
            userId: 7,
            unitNumber: 4,
            block: { name: 'بلوک الف', project: { name: 'پروژه نمونه' } },
          },
        ]),
      ),
    )
    const user = userEvent.setup()

    render(
      <FinalTransactionCreate
        isEdit
        userInfo={admin}
        initialValues={{
          id: 18,
          userId: 7,
          subProjectId: 22,
          amount: 4_000_000,
          bank: 'بانک اول',
          targetBank: 'بانک دوم',
          number: 'FINAL-18',
          detail: 'پرداخت ساخت',
          date: '2026-09-19T00:00:00.000Z',
          isConfirmed: false,
          document: 'old-receipt.pdf',
        }}
      />,
    )

    expect(
      await screen.findByRole('option', {
        name: 'پروژه نمونه - بلوک الف - واحد 4',
      }),
    ).toBeVisible()

    const replacement = new File(['replacement'], 'replacement.pdf', {
      type: 'application/pdf',
    })
    await user.upload(screen.getByLabelText('فایل رسید پرداخت'), replacement)
    expect(screen.getByText('replacement.pdf')).toBeVisible()
    expect(screen.queryByText('old-receipt.pdf')).not.toBeInTheDocument()
  })

  it('cancels without sending an update', async () => {
    server.use(
      http.get(api_base_url + '/users', () => HttpResponse.json([])),
      http.get(api_base_url + '/pre-selling/user/7', () =>
        HttpResponse.json([]),
      ),
    )
    const onCancel = vi.fn()
    const user = userEvent.setup()

    render(
      <PresellingTransactionCreate
        isEdit
        userInfo={admin}
        onCancel={onCancel}
        initialValues={{
          id: 12,
          userId: 7,
          presellingId: 15,
          amount: 1,
          bank: 'الف',
          targetBank: 'ب',
          number: '1',
          date: '2026-09-20T00:00:00.000Z',
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'انصراف' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
