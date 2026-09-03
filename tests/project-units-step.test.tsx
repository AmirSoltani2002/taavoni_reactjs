import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { api_base_url } from '@/config'
import type { Block, SubProject } from '@/pages/projects/columns'
import ProjectCreate from '@/pages/projects/newCreate'
import { Step3Units } from '@/pages/projects/steps/Step3Units'
import { server } from './mocks/server'

vi.mock('@/components/app/MapPicker', () => ({
  default: () => <div data-testid="map-picker" />,
}))

const blocks: Block[] = [
  {
    id: 11,
    name: 'بلوک الف',
    floorCount: 2,
    shareArea: 20,
    buildingArea: 200,
  },
  {
    id: 22,
    name: 'بلوک ب',
    floorCount: 2,
    shareArea: 30,
    buildingArea: 300,
  },
]

const units: SubProject[] = [
  {
    id: 101,
    area: 75,
    floor: 1,
    point: 7,
    roomCount: 1,
    direction: 'north',
    unitNumber: 1,
    blockId: 11,
  },
  {
    id: -1,
    area: 90,
    floor: 2,
    point: 7,
    roomCount: 2,
    direction: 'south',
    unitNumber: 2,
    blockId: 11,
  },
  {
    id: 103,
    area: 110,
    floor: 1,
    point: 7,
    roomCount: 3,
    direction: 'east',
    unitNumber: 3,
    blockId: 22,
  },
]

function UnitsHarness({ initialUnits = units }: { initialUnits?: SubProject[] }) {
  const [draftUnits, setDraftUnits] = useState(initialUnits)
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(11)
  const [selectedFloor, setSelectedFloor] = useState<number | null>(1)
  const [showStep, setShowStep] = useState(true)

  return (
    <>
      <button type="button" onClick={() => setShowStep(value => !value)}>
        تغییر مرحله
      </button>
      {showStep && (
        <Step3Units
          blocks={blocks}
          units={draftUnits}
          setUnits={setDraftUnits}
          selectedBlockId={selectedBlockId}
          setSelectedBlockId={setSelectedBlockId}
          selectedFloor={selectedFloor}
          setSelectedFloor={setSelectedFloor}
        />
      )}
    </>
  )
}

async function chooseOption(
  user: ReturnType<typeof userEvent.setup>,
  selectName: string,
  optionName: string,
) {
  await user.click(screen.getByRole('combobox', { name: selectName }))
  await user.click(await screen.findByRole('option', { name: optionName }))
}

describe('Project unit step', () => {
  it('shows one block and floor at a time and preserves edits across selections and steps', async () => {
    const user = userEvent.setup()
    render(<UnitsHarness />)

    expect(screen.getByDisplayValue('75')).toBeVisible()
    expect(screen.queryByDisplayValue('90')).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue('110')).not.toBeInTheDocument()

    await chooseOption(user, 'طبقه', 'طبقه 2')
    const areaInput = screen.getByDisplayValue('90')
    await user.clear(areaInput)
    await user.type(areaInput, '95')

    await chooseOption(user, 'بلوک', 'بلوک ب')
    expect(screen.getByDisplayValue('110')).toBeVisible()
    expect(screen.queryByDisplayValue('95')).not.toBeInTheDocument()

    await chooseOption(user, 'بلوک', 'بلوک الف')
    await chooseOption(user, 'طبقه', 'طبقه 2')
    expect(screen.getByDisplayValue('95')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'تغییر مرحله' }))
    expect(screen.queryByRole('combobox', { name: 'بلوک' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'تغییر مرحله' }))

    expect(screen.getByRole('combobox', { name: 'بلوک' })).toHaveTextContent('بلوک الف')
    expect(screen.getByRole('combobox', { name: 'طبقه' })).toHaveTextContent('طبقه 2')
    expect(screen.getByDisplayValue('95')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'افزودن واحد به طبقه 2' }))
    expect(screen.getByRole('button', { name: 'حذف واحد 2' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'حذف واحد 4' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'حذف واحد 2' }))
    expect(screen.queryByDisplayValue('95')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('50')).toBeVisible()
  })

  it('opens the block and floor containing a duplicate unit', async () => {
    const user = userEvent.setup()
    const duplicateUnits: SubProject[] = [
      { ...units[1], id: -1, blockId: 22, floor: 2, unitNumber: 8 },
      { ...units[2], id: -2, blockId: 22, floor: 1, unitNumber: 8 },
    ]
    render(<UnitsHarness initialUnits={duplicateUnits} />)

    await user.click(screen.getByRole('button', {
      name: 'برای شناسایی واحد مورد نظر اینجا کلیک کنید',
    }))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'بلوک' })).toHaveTextContent('بلوک ب')
      expect(screen.getByRole('combobox', { name: 'طبقه' })).toHaveTextContent('طبقه 2')
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    })
  })

  it('removes units whose floor is removed from the block definition', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({ id: 3, type: 'admin' }),
      ),
    )

    render(
      <MemoryRouter>
        <ProjectCreate />
      </MemoryRouter>,
    )

    await user.click(screen.getByText('اطلاعات بلوک ها'))
    await user.click(screen.getByRole('button', { name: 'افزودن بلوک جدید' }))

    const floorCountInput = screen.getAllByRole('spinbutton')[0]
    await user.clear(floorCountInput)
    await user.type(floorCountInput, '2')

    await user.click(screen.getByText('اطلاعات واحدهای مسکونی'))
    await chooseOption(user, 'طبقه', 'طبقه 2')
    await user.click(screen.getByRole('button', { name: 'افزودن واحد به طبقه 2' }))
    expect(screen.getByRole('button', { name: 'حذف واحد 1' })).toBeVisible()

    await user.click(screen.getByText('اطلاعات بلوک ها'))
    const updatedFloorCountInput = screen.getAllByRole('spinbutton')[0]
    await user.clear(updatedFloorCountInput)
    await user.type(updatedFloorCountInput, '1')
    await user.clear(updatedFloorCountInput)
    await user.type(updatedFloorCountInput, '2')

    await user.click(screen.getByText('اطلاعات واحدهای مسکونی'))
    await chooseOption(user, 'طبقه', 'طبقه 2')
    expect(screen.queryByRole('button', { name: 'حذف واحد 1' })).not.toBeInTheDocument()
  })

  it('removes a block units before a replacement draft block can reuse its id', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(api_base_url + '/users/profile', () =>
        HttpResponse.json({ id: 3, type: 'admin' }),
      ),
    )

    render(
      <MemoryRouter>
        <ProjectCreate />
      </MemoryRouter>,
    )

    await user.click(screen.getByText('اطلاعات بلوک ها'))
    await user.click(screen.getByRole('button', { name: 'افزودن بلوک جدید' }))
    await user.click(screen.getByText('اطلاعات واحدهای مسکونی'))
    await user.click(screen.getByRole('button', { name: 'افزودن واحد به طبقه 1' }))

    await user.click(screen.getByText('اطلاعات بلوک ها'))
    await user.click(screen.getByRole('button', { name: 'حذف بلوک 1' }))
    await user.click(screen.getByRole('button', { name: 'افزودن بلوک جدید' }))
    await user.click(screen.getByText('اطلاعات واحدهای مسکونی'))

    expect(screen.queryByRole('button', { name: 'حذف واحد 1' })).not.toBeInTheDocument()
  })
})
