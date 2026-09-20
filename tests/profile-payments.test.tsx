import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { api_base_url } from '@/config'
import ProfilePage from '@/pages/users/profile'
import { server } from './mocks/server'

describe('ProfilePage payments', () => {
  it('labels final transactions as construction payments', async () => {
    server.use(
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({
          id: 3,
          name: 'کاربر',
          lastName: 'آزمایشی',
          sex: 'male',
          type: 'free',
          accepted: true,
        }),
      ),
      http.get(api_base_url + '/user-doc/profile', () =>
        HttpResponse.json([]),
      ),
      http.get(api_base_url + '/transaction/profile/score', () =>
        HttpResponse.json({}),
      ),
      http.get(api_base_url + '/transaction/profile', () =>
        HttpResponse.json([]),
      ),
      http.get(api_base_url + '/users/pre-selling', () =>
        HttpResponse.json([]),
      ),
      http.get(api_base_url + '/subprojects/profile', () =>
        HttpResponse.json([]),
      ),
      http.get(api_base_url + '/final-transaction/profile', () =>
        HttpResponse.json([
          {
            id: 7,
            userId: 3,
            subProjectId: 11,
            amount: 1_000_000,
            bank: 'بانک مبدا',
            targetBank: 'بانک مقصد',
            number: 'transaction-7',
            isConfirmed: true,
            date: '2026-08-29T00:00:00.000Z',
          },
        ]),
      ),
    )

    render(
      <MemoryRouter initialEntries={['/dashboard#payments']}>
        <ProfilePage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getAllByText('پرداخت‌های ساخت')).toHaveLength(2)
    })
    expect(screen.queryByText('پرداخت‌های ملک')).not.toBeInTheDocument()
    expect(await screen.findAllByText(/ریال/)).toHaveLength(4)
    expect(screen.queryByText(/تومان/)).not.toBeInTheDocument()
  })

  it('shows the full transaction actions when an administrator views a user', async () => {
    const targetUser = {
      id: 3,
      name: 'کاربر',
      lastName: 'آزمایشی',
      sex: 'male',
      type: 'free',
      accepted: true,
    }
    server.use(
      http.get(api_base_url + '/users/3', () => HttpResponse.json(targetUser)),
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({
          id: 1,
          name: 'مدیر',
          lastName: 'سامانه',
          type: 'admin',
          accepted: true,
        }),
      ),
      http.get(api_base_url + '/users', () =>
        HttpResponse.json([targetUser]),
      ),
      http.get(api_base_url + '/user-doc/user/3', () => HttpResponse.json([])),
      http.get(api_base_url + '/transaction/score', () => HttpResponse.json({})),
      http.get(api_base_url + '/transaction/users/3', () =>
        HttpResponse.json([
          {
            id: 6,
            userId: 3,
            presellingId: 10,
            amount: 2_000_000,
            bank: 'بانک مبدا',
            targetBank: 'بانک مقصد',
            number: 'transaction-6',
            document: 'receipt.pdf',
            isConfirmed: false,
            date: '2026-08-29T00:00:00.000Z',
            user: targetUser,
            preselling: {
              id: 10,
              userId: 3,
              area: 100,
              project: { id: 2, name: 'پروژه نمونه' },
            },
          },
        ]),
      ),
      http.get(api_base_url + '/pre-selling/user/3', () =>
        HttpResponse.json([
          {
            id: 10,
            userId: 3,
            area: 100,
            project: { id: 2, name: 'پروژه نمونه' },
          },
        ]),
      ),
      http.get(api_base_url + '/subprojects/user/3', () => HttpResponse.json([])),
      http.get(api_base_url + '/final-transaction/users/3', () =>
        HttpResponse.json([]),
      ),
    )
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/users/3#payments']}>
        <Routes>
          <Route path="/users/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'عملیات' }))
    expect(
      await screen.findByRole('button', { name: /مشاهده مستندات/ }),
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: /دانلود مستندات/ }),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: /تایید/ })).toBeVisible()
    expect(
      screen.getByRole('button', { name: /ویرایش تراکنش/ }),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'حذف' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: /ویرایش تراکنش/ }))
    expect(
      await screen.findByRole('heading', { name: 'ویرایش تراکنش' }),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'ذخیره تغییرات' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'انصراف' })).toBeVisible()
  })
})
