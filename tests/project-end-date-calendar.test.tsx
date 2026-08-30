import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Calendar22 } from '@/components/calendars/calendar'
import { PROJECT_END_DATE_MAX } from '@/pages/projects/dateLimits'

function getYearDropdown(dropdowns: HTMLElement[]) {
  return dropdowns.find((dropdown) =>
    within(dropdown).queryByRole('option', { name: '۱۴۵۰' }),
  )
}

describe('Project end date calendar', () => {
  it('keeps the month and weekday calendar while extending only the end year to 1450', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <Calendar22
        title="تاریخ شروع"
        date={undefined}
        setDate={vi.fn()}
      />,
    )

    const startDateButton = screen.getByRole('button', {
      name: 'تاریخ شروع',
    })

    await user.click(startDateButton)
    expect(
      getYearDropdown(screen.getAllByRole('combobox')),
    ).toBeUndefined()

    unmount()
    render(
      <Calendar22
        title="تاریخ پایان"
        date={undefined}
        setDate={vi.fn()}
        maxDate={PROJECT_END_DATE_MAX}
      />,
    )

    const endDateButton = screen.getByRole('button', { name: 'تاریخ پایان' })
    await user.click(endDateButton)

    const dropdowns = screen.getAllByRole('combobox')
    expect(dropdowns).toHaveLength(2)

    const yearDropdown = getYearDropdown(dropdowns)
    expect(yearDropdown).toBeDefined()
    const maxYearOption = within(yearDropdown!).getByRole('option', {
      name: '۱۴۵۰',
    })
    expect(maxYearOption).toBeInTheDocument()
    expect(
      within(yearDropdown!).queryByRole('option', { name: '۱۴۵۱' }),
    ).not.toBeInTheDocument()

    await user.selectOptions(yearDropdown!, maxYearOption)
    expect(yearDropdown).toHaveValue(
      (maxYearOption as HTMLOptionElement).value,
    )

    const calendarGrid = screen.getByRole('grid')
    expect(calendarGrid).toBeVisible()

    const weekdayHeaders = calendarGrid.querySelectorAll('thead th')
    expect(weekdayHeaders).toHaveLength(7)
    for (const weekdayHeader of weekdayHeaders) {
      expect(weekdayHeader).not.toBeEmptyDOMElement()
    }
  })
})
