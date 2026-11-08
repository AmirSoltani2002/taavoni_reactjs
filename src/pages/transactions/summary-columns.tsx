import type { ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router-dom'
import type { TransactionSummary } from './summary'

const userName = (row: TransactionSummary) => `${row.user?.name || ''} ${row.user?.lastName || ''}`.trim()
const collator = new Intl.Collator('fa-IR', { sensitivity: 'base' })
const formatDate = (value: number | null) => value === null ? '—' : new Date(value).toLocaleDateString('fa-IR')

export const summaryColumns: ColumnDef<TransactionSummary>[] = [
    {
        id: 'rowNumber',
        header: 'ردیف',
        enableSorting: false,
        cell: ({ row, table }) => (table.getRowModel().rows.findIndex(item => item.id === row.id) + 1).toLocaleString('fa-IR'),
    },
    {
        id: 'user',
        accessorFn: userName,
        header: 'کاربر',
        sortingFn: (a, b) => collator.compare(userName(a.original), userName(b.original)) || a.original.userId - b.original.userId,
        cell: ({ row }) => (
            <Link className="text-blue-600 hover:underline focus-visible:underline" to={`/users/${row.original.userId}#payments`}>
                {userName(row.original) || '—'}
            </Link>
        ),
    },
    { id: 'project', accessorFn: row => row.project.name, header: 'پروژه' },
    {
        accessorKey: 'firstPaymentDate', header: 'تاریخ اولین پرداخت',
        cell: ({ row }) => formatDate(row.original.firstPaymentDate),
    },
    {
        accessorKey: 'lastPaymentDate', header: 'تاریخ آخرین پرداخت',
        cell: ({ row }) => formatDate(row.original.lastPaymentDate),
    },
    {
        accessorKey: 'totalAmount', header: 'مجموع پرداختی‌ها',
        cell: ({ row }) => `${row.original.totalAmount.toLocaleString('fa-IR')} ریال`,
    },
]
