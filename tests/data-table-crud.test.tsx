import { useCallback, useEffect, useState } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ColumnDef } from '@tanstack/react-table'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api_base_url } from '@/config'
import { getTable, postTable } from '@/general'
import { server } from './mocks/server'

type ProjectRow = { id?: number; name: string }

const columns: ColumnDef<ProjectRow>[] = [
  { accessorKey: 'name', header: 'نام پروژه' },
]

function EditProject({
  initialValues,
  onSubmit,
}: {
  initialValues: ProjectRow
  onSubmit: (values: ProjectRow) => void
}) {
  const [name, setName] = useState(initialValues.name)
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit({ name })
      }}
    >
      <Label htmlFor="project-name">نام پروژه</Label>
      <Input
        id="project-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Button type="submit">ذخیره</Button>
    </form>
  )
}

function CrudHarness() {
  const [rows, setRows] = useState<ProjectRow[]>([])
  const refresh = useCallback(() => {
    void getTable('projects', (data: ProjectRow[]) => setRows(data))
  }, [])

  useEffect(refresh, [refresh])

  return (
    <>
      <Button
        onClick={() => {
          void postTable('projects', { name: 'پروژه جدید' }, refresh)
        }}
      >
        ایجاد پروژه
      </Button>
      <DataTable
        columns={columns}
        data={rows}
        tableName="projects"
        editComponent={EditProject}
        onRefresh={refresh}
      />
    </>
  )
}

describe('DataTable CRUD refresh flow', () => {
  it('creates, edits, and deletes through the correct APIs and refreshes UI data', async () => {
    let rows: ProjectRow[] = [{ id: 1, name: 'پروژه اولیه' }]
    const requests: string[] = []
    server.use(
      http.get(api_base_url + '/projects', () => {
        requests.push('GET /projects')
        return HttpResponse.json(rows)
      }),
      http.post(api_base_url + '/projects', async ({ request }) => {
        requests.push('POST /projects')
        const body = (await request.json()) as { name: string }
        rows = [...rows, { id: 2, name: body.name }]
        return HttpResponse.json(rows[1], { status: 201 })
      }),
      http.patch(
        api_base_url + '/projects/:id',
        async ({ params, request }) => {
          requests.push('PATCH /projects/' + String(params.id))
          const body = (await request.json()) as { name: string }
          rows = rows.map((row) =>
            row.id === Number(params.id) ? { ...row, ...body } : row,
          )
          return HttpResponse.json(rows[0])
        },
      ),
      http.delete(api_base_url + '/projects/:id', ({ params }) => {
        requests.push('DELETE /projects/' + String(params.id))
        const removed = rows.find((row) => row.id === Number(params.id))
        rows = rows.filter((row) => row.id !== Number(params.id))
        return HttpResponse.json(removed)
      }),
    )
    const user = userEvent.setup()
    render(<CrudHarness />)

    expect(await screen.findByText('پروژه اولیه')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'ایجاد پروژه' }))
    expect(await screen.findByText('پروژه جدید')).toBeVisible()

    await user.click(screen.getAllByRole('button', { name: 'عملیات' })[0])
    await user.click(await screen.findByRole('button', { name: 'ویرایش' }))
    const nameInput = screen.getByLabelText('نام پروژه')
    await user.clear(nameInput)
    await user.type(nameInput, 'پروژه ویرایش‌شده')
    await user.click(screen.getByRole('button', { name: 'ذخیره' }))
    expect(await screen.findByText('پروژه ویرایش‌شده')).toBeVisible()

    await user.click(screen.getAllByRole('button', { name: 'عملیات' })[0])
    await user.click(await screen.findByRole('button', { name: 'حذف' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'حذف' }))

    await waitFor(() => {
      expect(screen.queryByText('پروژه ویرایش‌شده')).not.toBeInTheDocument()
    })
    expect(requests).toEqual([
      'GET /projects',
      'POST /projects',
      'GET /projects',
      'PATCH /projects/1',
      'GET /projects',
      'DELETE /projects/1',
      'GET /projects',
    ])
  })
})
