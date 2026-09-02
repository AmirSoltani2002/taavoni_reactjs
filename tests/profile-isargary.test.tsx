import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { api_base_url } from '@/config'
import { Toaster } from '@/components/ui/sonner'
import ProfilePage from '@/pages/users/profile'
import { server } from './mocks/server'

const profile = {
  id: 3,
  name: 'کاربر',
  lastName: 'آزمایشی',
  nationalNumber: '0012345678',
  sex: 'male',
  type: 'free',
  accepted: false,
  isargaryType: 'none',
}

function renderProfile(onPatch = vi.fn()) {
  server.use(
    http.get(api_base_url + '/users/profile', () => HttpResponse.json(profile)),
    http.get(api_base_url + '/user-doc/profile', () => HttpResponse.json([])),
    http.get(api_base_url + '/transaction/profile/score', () => HttpResponse.json({})),
    http.get(api_base_url + '/transaction/profile', () => HttpResponse.json([])),
    http.get(api_base_url + '/users/pre-selling', () => HttpResponse.json([])),
    http.get(api_base_url + '/subprojects/profile', () => HttpResponse.json([])),
    http.get(api_base_url + '/final-transaction/profile', () => HttpResponse.json([])),
    http.patch(api_base_url + '/users/profile', async ({ request }) => {
      const body = await request.json()
      onPatch(body)
      return HttpResponse.json({ ...profile, ...body })
    }),
  )

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <ProfilePage />
      <Toaster />
    </MemoryRouter>,
  )
}

async function openEditor(user: ReturnType<typeof userEvent.setup>) {
  const editButtons = await screen.findAllByRole('button', { name: 'ویرایش' })
  await user.click(editButtons[0])
  await screen.findByLabelText('نوع ایثارگری')
}

async function choose(
  user: ReturnType<typeof userEvent.setup>,
  field: string,
  option: string,
) {
  await user.click(screen.getByLabelText(field))
  await user.click(await screen.findByRole('option', { name: option }))
  await waitFor(() => {
    expect(screen.getByLabelText(field)).toHaveTextContent(option)
  })
}

describe('ProfilePage isargary information', () => {
  it('shows only the fields belonging to the selected type', async () => {
    const user = userEvent.setup()
    renderProfile()
    await openEditor(user)

    await user.click(screen.getByLabelText('نوع ایثارگری'))
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual([
      'هیچ کدام',
      'خانواده شهید',
      'جانباز',
      'آزاده',
      'ایثارگر',
    ])
    await user.click(screen.getByRole('option', { name: 'خانواده شهید' }))
    await waitFor(() => {
      expect(screen.getByLabelText('نوع ایثارگری')).toHaveTextContent('خانواده شهید')
    })
    expect(screen.getByLabelText('نسبت با شهید')).toBeVisible()
    expect(screen.queryByLabelText('نسبت با ایثارگر')).not.toBeInTheDocument()
    await user.click(screen.getByLabelText('نسبت با شهید'))
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual([
      'فرزند شهید',
      'برادر شهید',
      'پدر یا مادر شهید',
      'همسر شهید',
    ])
    await user.keyboard('{Escape}')

    await choose(user, 'نوع ایثارگری', 'جانباز')
    expect(screen.getByLabelText('نسبت با ایثارگر')).toBeVisible()
    await user.click(screen.getByLabelText('نسبت با ایثارگر'))
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual([
      'خود ایثارگر',
      'همسر ایثارگر',
      'فرزند ایثارگر',
    ])
    await user.keyboard('{Escape}')
    await user.click(screen.getByLabelText('درصد جانبازی'))
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(
      Array.from({ length: 16 }, (_, index) => `${(index + 1) * 5}%`),
    )
    await user.keyboard('{Escape}')

    await choose(user, 'نوع ایثارگری', 'آزاده')
    expect(screen.getByLabelText('مدت اسارت (به ماه)')).toHaveAttribute('min', '1')
    expect(screen.queryByLabelText('درصد جانبازی')).not.toBeInTheDocument()

    await choose(user, 'نوع ایثارگری', 'ایثارگر')
    expect(screen.getByRole('group', { name: 'نوع حضور در جبهه' })).toBeVisible()
    expect(screen.getByLabelText('مدت حضور در جبهه (به ماه)')).toHaveAttribute('step', '1')
    expect(screen.queryByLabelText('مدت اسارت (به ماه)')).not.toBeInTheDocument()

    await choose(user, 'نوع ایثارگری', 'هیچ کدام')
    expect(screen.queryByLabelText('نسبت با ایثارگر')).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'نوع حضور در جبهه' })).not.toBeInTheDocument()
  })

  it('warns about every required conditional field before saving', async () => {
    const onPatch = vi.fn()
    const user = userEvent.setup()
    renderProfile(onPatch)
    await openEditor(user)
    await choose(user, 'نوع ایثارگری', 'خانواده شهید')

    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))

    expect(await screen.findByText('لطفا نسبت با شهید را انتخاب کنید')).toBeVisible()

    await choose(user, 'نوع ایثارگری', 'جانباز')
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))
    expect(await screen.findByText('لطفا نسبت با ایثارگر را انتخاب کنید')).toBeVisible()
    await choose(user, 'نسبت با ایثارگر', 'خود ایثارگر')
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))
    expect(await screen.findByText('لطفا درصد جانبازی را انتخاب کنید')).toBeVisible()

    await choose(user, 'نوع ایثارگری', 'آزاده')
    await choose(user, 'نسبت با ایثارگر', 'فرزند ایثارگر')
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))
    expect(await screen.findByText('مدت اسارت باید یک عدد صحیح مثبت باشد')).toBeVisible()

    await choose(user, 'نوع ایثارگری', 'ایثارگر')
    await choose(user, 'نسبت با ایثارگر', 'همسر ایثارگر')
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))
    expect(await screen.findByText('لطفا نوع حضور در جبهه را انتخاب کنید')).toBeVisible()
    await user.click(screen.getByRole('radio', { name: 'اجباری' }))
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))
    expect(await screen.findByText('مدت حضور در جبهه باید یک عدد صحیح مثبت باشد')).toBeVisible()
    expect(onPatch).not.toHaveBeenCalled()
  }, 10_000)

  it('submits valid information and clears fields from other types', async () => {
    const onPatch = vi.fn()
    const user = userEvent.setup()
    renderProfile(onPatch)
    await openEditor(user)

    await choose(user, 'نوع ایثارگری', 'جانباز')
    await choose(user, 'نسبت با ایثارگر', 'خود ایثارگر')
    await choose(user, 'درصد جانبازی', '25%')
    await choose(user, 'نوع ایثارگری', 'ایثارگر')
    await choose(user, 'نسبت با ایثارگر', 'همسر ایثارگر')
    await user.click(screen.getByRole('radio', { name: 'اختیاری' }))
    await user.type(screen.getByLabelText('مدت حضور در جبهه (به ماه)'), '12')
    await user.click(screen.getByRole('button', { name: 'ذخیره تغییرات' }))

    await waitFor(() => {
      expect(onPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          isargaryType: 'isargar',
          martyrRelation: null,
          isargarRelation: 'spouse',
          janbaziPercent: null,
          captivityMonths: null,
          frontPresenceType: 'voluntary',
          frontPresenceMonths: 12,
        }),
      )
    })
  })
})
