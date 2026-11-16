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

const shareAreaLabel = 'مساحت مشاعات (متر مربع)'
const buildingAreaLabel = 'مساحت زیربنا (متر مربع)'

function renderProject(type: 'admin' | 'system', edit = false) {
  server.use(
    http.get(api_base_url + '/users/profile', () =>
      HttpResponse.json({ id: 3, type }),
    ),
  )
  render(
    <MemoryRouter initialEntries={[edit ? '/projects/edit/5' : '/projects/create']}>
      <Routes>
        <Route path="/projects/create" element={<ProjectCreate initialValues={initialProject} />} />
        <Route path="/projects/edit/:projectId" element={<ProjectCreate />} />
        <Route path="/projects/list" element={<div>لیست پروژه‌ها</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function addBlock(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText('اطلاعات بلوک ها'))
  await user.click(screen.getByRole('button', { name: 'افزودن بلوک جدید' }))
  await user.type(screen.getByLabelText('تعداد طبقات منفی *'), '0')
}

describe('Project optional block areas', () => {
  it.each([
    { type: 'admin', shareArea: '', buildingArea: '' },
    { type: 'system', shareArea: '', buildingArea: '' },
    { type: 'admin', shareArea: '25', buildingArea: '' },
    { type: 'system', shareArea: '', buildingArea: '300' },
    { type: 'admin', shareArea: '25', buildingArea: '300' },
  ] as const)(
    'creates a project as $type with shared area "$shareArea" and building area "$buildingArea"',
    async ({ type, shareArea, buildingArea }) => {
      const user = userEvent.setup()
      let blockRequest: Record<string, unknown> | undefined
      server.use(
        http.post(api_base_url + '/projects', () =>
          HttpResponse.json({ id: 50, ...initialProject }),
        ),
        http.post(api_base_url + '/blocks', async ({ request }) => {
          blockRequest = await request.json() as Record<string, unknown>
          return HttpResponse.json({ id: 70, ...blockRequest })
        }),
        http.post(api_base_url + '/subprojects/multiple', () => HttpResponse.json([])),
      )

      renderProject(type)
      await addBlock(user)
      const shareInput = screen.getByRole('spinbutton', { name: shareAreaLabel })
      const buildingInput = screen.getByRole('spinbutton', { name: buildingAreaLabel })
      expect(shareInput).not.toBeRequired()
      expect(buildingInput).not.toBeRequired()
      expect(shareInput).toHaveValue(null)
      expect(buildingInput).toHaveValue(null)
      if (shareArea) await user.type(shareInput, shareArea)
      if (buildingArea) await user.type(buildingInput, buildingArea)

      await user.click(screen.getByRole('button', { name: 'مرحله بعد' }))
      expect(screen.getByText('مشخصات پارکینگ و انباری طبقات منفی را تعریف کنید')).toBeVisible()
      await user.click(screen.getByText('بررسی و تایید نهایی'))
      expect(screen.getByText(/0 متر مربع مشاعات|25 متر مربع مشاعات/)).toBeVisible()
      await user.click(screen.getByRole('button', { name: 'ایجاد پروژه' }))

      await waitFor(() => {
        expect(blockRequest).toMatchObject({
          projectId: 50,
          shareArea: Number(shareArea),
          buildingArea: Number(buildingArea),
        })
        expect(screen.getByText('لیست پروژه‌ها')).toBeVisible()
      })
    },
  )

  it.each([
    { type: 'admin', clearShare: true, clearBuilding: true },
    { type: 'system', clearShare: true, clearBuilding: false },
    { type: 'admin', clearShare: false, clearBuilding: true },
  ] as const)(
    'saves cleared areas as zero when editing as $type (shared: $clearShare, building: $clearBuilding)',
    async ({ type, clearShare, clearBuilding }) => {
      const user = userEvent.setup()
      let blockPatch: Record<string, unknown> | undefined
      const block = {
        id: 11,
        name: 'بلوک الف',
        floorCount: 2,
        negativeFloorCount: 0,
        shareArea: 25,
        buildingArea: 300,
        projectId: 5,
        subProjects: [],
        negativeFloors: [],
      }
      const project = { id: 5, ...initialProject, blocks: [block] }
      server.use(
        http.get(api_base_url + '/projects/5', () => HttpResponse.json(project)),
        http.get(api_base_url + '/project-docs/project/5', () => HttpResponse.json([])),
        http.patch(api_base_url + '/projects/5', () => HttpResponse.json(project)),
        http.patch(api_base_url + '/blocks/11', async ({ request }) => {
          blockPatch = await request.json() as Record<string, unknown>
          return HttpResponse.json({ ...block, ...blockPatch })
        }),
      )

      renderProject(type, true)
      await user.click(await screen.findByText('اطلاعات بلوک ها'))
      const shareInput = screen.getByRole('spinbutton', { name: shareAreaLabel })
      const buildingInput = screen.getByRole('spinbutton', { name: buildingAreaLabel })
      expect(shareInput).toHaveValue(25)
      expect(buildingInput).toHaveValue(300)
      if (clearShare) await user.clear(shareInput)
      if (clearBuilding) await user.clear(buildingInput)
      expect(shareInput).toHaveValue(clearShare ? null : 25)
      expect(buildingInput).toHaveValue(clearBuilding ? null : 300)

      await user.click(screen.getByRole('button', { name: 'مرحله بعد' }))
      expect(screen.getByText('مشخصات پارکینگ و انباری طبقات منفی را تعریف کنید')).toBeVisible()
      await user.click(screen.getByText('بررسی و تایید نهایی'))
      await user.click(screen.getByRole('button', { name: 'بروزرسانی پروژه' }))

      await waitFor(() => {
        expect(blockPatch).toMatchObject({
          projectId: 5,
          shareArea: clearShare ? 0 : 25,
          buildingArea: clearBuilding ? 0 : 300,
        })
        expect(screen.getByText('لیست پروژه‌ها')).toBeVisible()
      })
    },
  )

  it.each([shareAreaLabel, buildingAreaLabel])(
    'blocks negative values in %s and allows continuing after clearing them',
    async (label) => {
      const user = userEvent.setup()
      renderProject('admin')
      await addBlock(user)
      const input = screen.getByRole('spinbutton', { name: label })
      await user.type(input, '-1')
      expect(screen.getByRole('button', { name: 'مرحله بعد' })).toBeDisabled()
      await user.clear(input)
      expect(input).toHaveValue(null)
      expect(screen.getByRole('button', { name: 'مرحله بعد' })).toBeEnabled()
    },
  )

  it('still requires the negative-floor count when both areas are empty', async () => {
    const user = userEvent.setup()
    renderProject('admin')
    await addBlock(user)
    await user.clear(screen.getByLabelText('تعداد طبقات منفی *'))
    expect(screen.getByRole('button', { name: 'مرحله بعد' })).toBeDisabled()
  })
})
