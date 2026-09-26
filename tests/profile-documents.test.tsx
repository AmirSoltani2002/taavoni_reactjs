import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { api_base_url } from '@/config'
import ProfilePage from '@/pages/users/profile'
import { server } from './mocks/server'

type AccountType = 'admin' | 'system' | 'free' | 'tehranUni'

const documentRecord = {
  id: 10,
  userId: 7,
  detail: 'کارت ملی',
  document: 'national-card.pdf',
  validation: false,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
}

function setupProfileRequests(
  viewerType: AccountType,
  targetType: AccountType,
  selected = true,
) {
  let documents = [{ ...documentRecord }]
  let uploadedUserId: string | null = null
  const deletedIds: string[] = []
  const verifiedIds: string[] = []
  const target = {
    id: 7,
    name: 'کاربر',
    lastName: 'آزمایشی',
    nationalNumber: '0012345678',
    sex: 'male',
    type: targetType,
    accepted: true,
    isargaryType: 'none',
  }
  const viewer = selected
    ? { ...target, id: 1, type: viewerType }
    : { ...target, type: viewerType }
  const documentPath = selected ? '/user-doc/user/7' : '/user-doc/profile'

  server.use(
    ...(selected
      ? [
          http.get(api_base_url + '/users/7', () => HttpResponse.json(target)),
          http.get(api_base_url + '/users/profile', () => HttpResponse.json(viewer)),
        ]
      : [
          http.get(api_base_url + '/users/profile', () => HttpResponse.json(viewer)),
        ]),
    http.get(api_base_url + documentPath, () => HttpResponse.json(documents)),
    http.get(api_base_url + '/transaction/score', () => HttpResponse.json({})),
    http.get(api_base_url + '/transaction/profile/score', () => HttpResponse.json({})),
    http.get(api_base_url + '/transaction/users/7', () => HttpResponse.json([])),
    http.get(api_base_url + '/transaction/profile', () => HttpResponse.json([])),
    http.get(api_base_url + '/pre-selling/user/7', () => HttpResponse.json([])),
    http.get(api_base_url + '/users/pre-selling', () => HttpResponse.json([])),
    http.get(api_base_url + '/subprojects/user/7', () => HttpResponse.json([])),
    http.get(api_base_url + '/subprojects/profile', () => HttpResponse.json([])),
    http.get(api_base_url + '/final-transaction/users/7', () => HttpResponse.json([])),
    http.get(api_base_url + '/final-transaction/profile', () => HttpResponse.json([])),
    http.post(api_base_url + '/user-doc', async ({ request }) => {
      const body = new TextDecoder().decode(await request.arrayBuffer())
      uploadedUserId = body.match(/name="userId"\r\n\r\n([^\r]+)/)?.[1] ?? null
      documents = [
        ...documents,
        {
          ...documentRecord,
          id: 11,
          detail: body.match(/name="detail"\r\n\r\n([^\r]+)/)?.[1] ?? '',
          document: 'new-document.pdf',
          validation: viewerType === 'admin' || viewerType === 'system',
        },
      ]
      return HttpResponse.json(documents[1], { status: 201 })
    }),
    http.delete(api_base_url + '/user-doc/:id', ({ params }) => {
      deletedIds.push(String(params.id))
      documents = documents.filter((document) => document.id !== Number(params.id))
      return HttpResponse.json({ id: Number(params.id) })
    }),
    http.patch(api_base_url + '/user-doc/:id/verify', ({ params }) => {
      verifiedIds.push(String(params.id))
      documents = documents.map((document) =>
        document.id === Number(params.id)
          ? { ...document, validation: true }
          : document,
      )
      return HttpResponse.json(
        documents.find((document) => document.id === Number(params.id)),
      )
    }),
  )

  return {
    deletedIds,
    verifiedIds,
    getUploadedUserId: () => uploadedUserId,
  }
}

function renderProfile(selected = true) {
  if (!selected) {
    return render(
      <MemoryRouter initialEntries={['/dashboard#documents']}>
        <ProfilePage />
      </MemoryRouter>,
    )
  }

  return render(
    <MemoryRouter initialEntries={['/users/7#documents']}>
      <Routes>
        <Route path="/users/:userId" element={<ProfilePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProfilePage documents access', () => {
  it('lets an administrator add and remove an investor document', async () => {
    const requests = setupProfileRequests('admin', 'free')
    const user = userEvent.setup()
    renderProfile()

    expect(await screen.findByText('کارت ملی')).toBeVisible()
    await user.type(screen.getByLabelText('موضوع مدرک'), 'فیش حقوقی')
    await user.upload(
      screen.getByLabelText('فایل مدرک'),
      new File(['document'], 'salary.pdf', { type: 'application/pdf' }),
    )
    await user.click(screen.getByRole('button', { name: 'افزودن مدرک' }))

    expect(await screen.findByText('فیش حقوقی')).toBeVisible()
    expect(requests.getUploadedUserId()).toBe('7')

    const originalDocumentRow = screen.getByText('کارت ملی').closest('tr')
    expect(originalDocumentRow).not.toBeNull()
    await user.click(
      within(originalDocumentRow as HTMLTableRowElement).getByRole('button', {
        name: 'عملیات',
      }),
    )
    await user.click(await screen.findByRole('button', { name: 'حذف' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'حذف' }))

    await waitFor(() => {
      expect(screen.queryByText('کارت ملی')).not.toBeInTheDocument()
    })
    expect(requests.deletedIds).toEqual(['10'])
  })

  it('gives system accounts the same investor-document controls', async () => {
    setupProfileRequests('system', 'tehranUni')
    renderProfile()

    expect(await screen.findByRole('button', { name: 'افزودن مدرک' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'عملیات' })).toBeVisible()
    expect(screen.getByTitle('دانلود فایل')).toBeVisible()
  })

  it.each([
    ['admin', 'admin'],
    ['system', 'system'],
    ['free', 'free'],
    ['free', 'admin'],
  ] as const)(
    'keeps document controls hidden for a %s viewing a %s account',
    async (viewerType, targetType) => {
      setupProfileRequests(viewerType, targetType)
      renderProfile()

      expect(await screen.findByText('کارت ملی')).toBeVisible()
      expect(screen.queryByRole('button', { name: 'افزودن مدرک' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'حذف' })).not.toBeInTheDocument()
      expect(screen.queryByTitle('دانلود فایل')).not.toBeInTheDocument()
    },
  )

  it('preserves document controls on an account owner’s profile', async () => {
    setupProfileRequests('free', 'free', false)
    renderProfile(false)

    expect(await screen.findByRole('button', { name: 'افزودن مدرک' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'حذف' })).toBeVisible()
    expect(screen.getByTitle('دانلود فایل')).toBeVisible()
    expect(screen.getByText('تاییدنشده')).toBeVisible()
  })

  it('lets an administrator verify a document and keeps verification idempotent', async () => {
    const requests = setupProfileRequests('admin', 'free')
    const user = userEvent.setup()
    renderProfile()

    expect(await screen.findByText('تاییدنشده')).toBeVisible()
    await user.type(screen.getByLabelText('موضوع مدرک'), 'مدرک مدیر')
    await user.upload(
      screen.getByLabelText('فایل مدرک'),
      new File(['document'], 'admin.pdf', { type: 'application/pdf' }),
    )
    await user.click(screen.getByRole('button', { name: 'افزودن مدرک' }))
    expect(await screen.findByText('مدرک مدیر')).toBeVisible()
    const documentRow = screen.getByText('کارت ملی').closest('tr')
    expect(documentRow).not.toBeNull()
    await user.click(
      within(documentRow as HTMLTableRowElement).getByRole('button', {
        name: 'عملیات',
      }),
    )
    await user.click(await screen.findByRole('button', { name: /تایید مدرک/ }))

    const refreshedDocumentRow = (await screen.findByText('کارت ملی')).closest('tr')
    expect(
      within(refreshedDocumentRow as HTMLTableRowElement).getByText('تاییدشده'),
    ).toBeVisible()
    expect(requests.verifiedIds).toEqual(['10'])

    const verifiedRow = screen.getByText('کارت ملی').closest('tr')
    await user.click(
      within(verifiedRow as HTMLTableRowElement).getByRole('button', {
        name: 'عملیات',
      }),
    )
    await user.click(await screen.findByRole('button', { name: /تایید مدرک/ }))
    expect(requests.verifiedIds).toEqual(['10'])
  })
})
