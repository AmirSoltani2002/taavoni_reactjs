import { render, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
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
})
