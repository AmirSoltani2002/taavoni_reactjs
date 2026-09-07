import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { api_base_url } from '@/config'
import type { Project } from '@/pages/projects/columns'
import ProjectCreate from '@/pages/projects/newCreate'
import { server } from './mocks/server'

vi.mock('@/components/app/MapPicker', () => ({
  default: () => <div data-testid="map-picker" />,
}))

const initialProject: Project = {
  name: 'پروژه آزمایشی',
  address: '',
  landArea: 100,
  startDate: '2026-09-07',
}

async function chooseOption(
  user: ReturnType<typeof userEvent.setup>,
  selectName: string,
  optionName: string,
) {
  await user.click(screen.getByRole('combobox', { name: selectName }))
  await user.click(await screen.findByRole('option', { name: optionName }))
}

function renderCreate() {
  server.use(
    http.get(api_base_url + '/users/profile', () =>
      HttpResponse.json({ id: 3, type: 'admin' }),
    ),
  )
  return render(
    <MemoryRouter>
      <ProjectCreate initialValues={initialProject} />
    </MemoryRouter>,
  )
}

async function defineNegativeFloors(
  user: ReturnType<typeof userEvent.setup>,
  count: string,
) {
  await user.click(screen.getByText('اطلاعات بلوک ها'))
  await user.click(screen.getByRole('button', { name: 'افزودن بلوک جدید' }))
  const countInput = screen.getByLabelText('تعداد طبقات منفی *')
  expect(countInput).toHaveValue(null)
  await user.type(countInput, count)
  await user.click(screen.getByText('اطلاعات طبقات منفی'))
}

describe('Project negative floors', () => {
  it('adds the fifth styled step with previous and next navigation', async () => {
    const user = userEvent.setup()
    renderCreate()

    expect(screen.getByText('مرحله ۵')).toBeVisible()
    await user.click(screen.getByText('اطلاعات طبقات منفی'))

    expect(screen.getByRole('button', { name: 'قبلی' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'مرحله بعد' })).toBeVisible()
  })

  it('starts required counts blank and preserves values between generated floors', async () => {
    const user = userEvent.setup()
    renderCreate()
    await defineNegativeFloors(user, '2')

    expect(screen.getByText('تعداد پارکینگ الزامی است.')).toBeVisible()
    expect(screen.getByText('تعداد انباری الزامی است.')).toBeVisible()
    expect(screen.getByRole('button', { name: 'مرحله بعد' })).toBeDisabled()

    await user.type(screen.getByLabelText('تعداد پارکینگ *'), '-1')
    expect(screen.getByText('تعداد پارکینگ باید عدد صحیح و غیرمنفی باشد.')).toBeVisible()
    await user.clear(screen.getByLabelText('تعداد پارکینگ *'))

    await chooseOption(user, 'طبقه منفی', 'طبقه منفی 2')
    await user.type(screen.getByLabelText('تعداد پارکینگ *'), '3')
    await user.type(screen.getByLabelText('تعداد انباری *'), '4')
    await user.type(screen.getByLabelText('توضیحات طبقه منفی'), 'فضای تاسیسات')

    await chooseOption(user, 'طبقه منفی', 'طبقه منفی 1')
    await user.type(screen.getByLabelText('تعداد پارکینگ *'), '0')
    await user.type(screen.getByLabelText('تعداد انباری *'), '0')

    expect(screen.queryByText('تعداد پارکینگ الزامی است.')).not.toBeInTheDocument()
    expect(screen.queryByText('تعداد انباری الزامی است.')).not.toBeInTheDocument()

    await chooseOption(user, 'طبقه منفی', 'طبقه منفی 2')
    expect(screen.getByLabelText('تعداد پارکینگ *')).toHaveValue(3)
    expect(screen.getByLabelText('تعداد انباری *')).toHaveValue(4)
    expect(screen.getByLabelText('توضیحات طبقه منفی')).toHaveValue('فضای تاسیسات')
    expect(screen.getByRole('button', { name: 'مرحله بعد' })).toBeEnabled()
  })

  it('creates negative floors with persisted block IDs', async () => {
    const user = userEvent.setup()
    let blockRequest: Record<string, unknown> | undefined
    let floorRequests: Array<Record<string, unknown>> | undefined

    server.use(
      http.post(api_base_url + '/projects', () =>
        HttpResponse.json({ id: 50, ...initialProject }),
      ),
      http.post(api_base_url + '/blocks', async ({ request }) => {
        blockRequest = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: 70, ...blockRequest })
      }),
      http.post(api_base_url + '/negative-floors/multiple', async ({ request }) => {
        floorRequests = await request.json() as Array<Record<string, unknown>>
        return HttpResponse.json(floorRequests)
      }),
      http.post(api_base_url + '/subprojects/multiple', () => HttpResponse.json([])),
    )

    renderCreate()
    await defineNegativeFloors(user, '1')
    await user.type(screen.getByLabelText('تعداد پارکینگ *'), '0')
    await user.type(screen.getByLabelText('تعداد انباری *'), '2')
    await user.click(screen.getByText('بررسی و تایید نهایی'))
    await user.click(screen.getByRole('button', { name: 'ایجاد پروژه' }))

    await waitFor(() => {
      expect(blockRequest).toMatchObject({
        projectId: 50,
        negativeFloorCount: 1,
      })
      expect(floorRequests).toEqual([
        {
          floorNumber: 1,
          parkingCount: 0,
          storageCount: 2,
          description: '',
          blockId: 70,
        },
      ])
    })
  })

  it('supports editing and omits out-of-range floors after reducing the count', async () => {
    const user = userEvent.setup()
    const floorPatchIds: number[] = []
    let blockPatch: Record<string, unknown> | undefined
    const project = {
      id: 5,
      ...initialProject,
      blocks: [
        {
          id: 11,
          name: 'بلوک الف',
          floorCount: 2,
          negativeFloorCount: 2,
          shareArea: 20,
          buildingArea: 200,
          projectId: 5,
          subProjects: [],
          negativeFloors: [
            { id: 101, floorNumber: 1, parkingCount: 1, storageCount: 2, blockId: 11 },
            { id: 102, floorNumber: 2, parkingCount: 3, storageCount: 4, blockId: 11 },
          ],
        },
      ],
    }

    server.use(
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({ id: 3, type: 'admin' }),
      ),
      http.get(api_base_url + '/projects/5', () => HttpResponse.json(project)),
      http.get(api_base_url + '/project-docs/project/5', () => HttpResponse.json([])),
      http.patch(api_base_url + '/projects/5', () => HttpResponse.json(project)),
      http.patch(api_base_url + '/blocks/11', async ({ request }) => {
        blockPatch = await request.json() as Record<string, unknown>
        return HttpResponse.json({ ...project.blocks[0], ...blockPatch })
      }),
      http.patch(api_base_url + '/negative-floors/:id', ({ params }) => {
        floorPatchIds.push(Number(params.id))
        return HttpResponse.json({ id: Number(params.id) })
      }),
    )

    render(
      <MemoryRouter initialEntries={['/projects/edit/5']}>
        <Routes>
          <Route path="/projects/edit/:projectId" element={<ProjectCreate />} />
          <Route path="/projects/list" element={<div>لیست پروژه‌ها</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(await screen.findByText('اطلاعات بلوک ها'))
    const countInput = screen.getByLabelText('تعداد طبقات منفی *')
    await user.clear(countInput)
    await user.type(countInput, '1')

    await user.click(screen.getByText('اطلاعات طبقات منفی'))
    await user.click(screen.getByRole('combobox', { name: 'طبقه منفی' }))
    expect(screen.queryByRole('option', { name: 'طبقه منفی 2' })).not.toBeInTheDocument()
    await user.keyboard('{Escape}')

    await user.click(screen.getByText('بررسی و تایید نهایی'))
    await user.click(screen.getByRole('button', { name: 'بروزرسانی پروژه' }))

    await waitFor(() => {
      expect(blockPatch).toMatchObject({ negativeFloorCount: 1 })
      expect(floorPatchIds).toEqual([101])
      expect(screen.getByText('لیست پروژه‌ها')).toBeVisible()
    })
  })
})
