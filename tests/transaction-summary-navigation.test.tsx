import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { api_base_url } from '@/config'
import { server } from './mocks/server'

describe('Receipt summary navigation', () => {
  it.each(['admin', 'system'])('shows the four ordered receipt links for %s and loads each summary route', async type => {
    server.use(
      http.get(api_base_url + '/users/profile', () => HttpResponse.json({ id: 1, type, accepted: true })),
      http.get(api_base_url + '/transaction', () => HttpResponse.json([])),
      http.get(api_base_url + '/final-transaction', () => HttpResponse.json([])),
    )
    window.history.replaceState({}, '', '/transactions/preselling/sumlist')
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('table')
    const sidebar = await screen.findByRole('button', { name: 'رسیدهای پرداخت' })
    if (sidebar.getAttribute('aria-expanded') !== 'true') await user.click(sidebar)
    await waitFor(() => expect(screen.getAllByRole('link').filter(link => link.getAttribute('href')?.startsWith('/transactions/')).map(link => link.textContent)).toEqual([
      'رسیدهای پیش‌فروش', 'جمع رسیدهای پیش‌فروش', 'رسیدهای نهایی', 'جمع رسیدهای نهایی',
    ]))
    await user.click(screen.getByRole('link', { name: 'جمع رسیدهای نهایی' }))
    expect(await screen.findByRole('heading', { name: 'جمع رسیدهای نهایی' })).toBeVisible()
    expect(window.location.pathname).toBe('/transactions/final/sumlist')
    await user.click(screen.getByRole('link', { name: 'جمع رسیدهای پیش‌فروش' }))
    expect(await screen.findByRole('heading', { name: 'جمع رسیدهای پیش‌فروش' })).toBeVisible()
    expect(window.location.pathname).toBe('/transactions/preselling/sumlist')
  })

  it('keeps summary links hidden from regular users', async () => {
    server.use(http.get(api_base_url + '/users/profile', () => HttpResponse.json({ id: 1, type: 'free', accepted: true })))
    window.history.replaceState({}, '', '/transactions/preselling/sumlist')
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('alert')
    const menu = await screen.findByRole('button', { name: 'رسیدهای پرداخت' })
    if (menu.getAttribute('aria-expanded') !== 'true') await user.click(menu)
    expect(screen.queryByRole('link', { name: 'جمع رسیدهای پیش‌فروش' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'جمع رسیدهای نهایی' })).not.toBeInTheDocument()
    expect(within(document.body).getByRole('link', { name: 'رسیدهای پیش‌فروش' })).toBeVisible()
    expect(within(document.body).getByRole('link', { name: 'رسیدهای نهایی' })).toBeVisible()
  })
})
