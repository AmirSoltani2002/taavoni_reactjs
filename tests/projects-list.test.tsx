import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ProjectsList from '@/pages/projects/list'
import { api_base_url } from '@/config'
import { server } from './mocks/server'

const projects = [
  {
    id: 11,
    name: 'پروژه آفتاب',
    address: 'تهران',
    landArea: 420,
    startDate: '2026-01-01T00:00:00.000Z',
    blocks: [{ id: 1 }, { id: 2 }],
  },
]

function renderProjects(role: string) {
  server.use(
    http.get(api_base_url + '/projects/all', () =>
      HttpResponse.json(projects),
    ),
    http.get(api_base_url + '/users/profile', () =>
      HttpResponse.json({ id: 3, name: 'User', type: role }),
    ),
  )

  return render(
    <MemoryRouter>
      <ProjectsList />
    </MemoryRouter>,
  )
}

describe('ProjectsList', () => {
  it('renders table data returned by GET /projects/all', async () => {
    renderProjects('admin')

    expect(await screen.findByText('پروژه آفتاب')).toBeVisible()
    expect(screen.getByText('تهران')).toBeVisible()
    expect(screen.getByText('420 متر مربع')).toBeVisible()
    expect(screen.getByText('2 بلوک')).toBeVisible()
  })

  it('shows management controls to administrators', async () => {
    renderProjects('admin')

    expect(
      await screen.findByRole('button', { name: /پروژه جدید/ }),
    ).toBeVisible()
    expect(screen.getByText('کل پروژه‌ها')).toBeVisible()
  })

  it('hides management controls from investors', async () => {
    renderProjects('free')

    expect(await screen.findByText('پروژه آفتاب')).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /پروژه جدید/ }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('کل پروژه‌ها')).not.toBeInTheDocument()
  })
})
