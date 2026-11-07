import { useEffect, useMemo, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { getTable } from '@/general'
import { DataTable } from '@/components/ui/data-table'
import { PageLoader } from '@/components/ui/loader'
import { Label } from '@/components/ui/label'
import { UserSelect } from '@/components/user-select'
import { getReceiptProject, summarizeReceipts, type Receipt, type ReceiptType } from './summary'
import { summaryColumns } from './summary-columns'

function apiError(value: unknown): string {
    if (typeof value === 'string') return value
    if (Array.isArray(value)) return value.filter(item => typeof item === 'string').join('، ') || 'خطا در بارگذاری رسیدهای پرداخت'
    if (value && typeof value === 'object' && 'error' in value) return apiError(value.error)
    return 'خطا در بارگذاری رسیدهای پرداخت'
}

const selectClassName = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export default function TransactionSummaryList({ type }: { type: ReceiptType }) {
    const [data, setData] = useState<Receipt[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [allowed, setAllowed] = useState(false)
    const [projectId, setProjectId] = useState<number | ''>('')
    const [userId, setUserId] = useState<number | ''>('')
    const [targetBank, setTargetBank] = useState('')

    useEffect(() => {
        let active = true
        async function load() {
            try {
                const profile: unknown = await getTable('users/profile')
                if (!active) return
                if (!profile || typeof profile !== 'object' || !('type' in profile)) throw new Error(apiError(profile))
                if (profile.type !== 'admin' && profile.type !== 'system') {
                    setError('شما اجازه دسترسی به این صفحه را ندارید')
                    return
                }
                setAllowed(true)
                const receipts: unknown = await getTable(type === 'preselling' ? 'transaction' : 'final-transaction')
                if (!active) return
                if (!Array.isArray(receipts)) throw new Error(apiError(receipts))
                setData(receipts)
            } catch (cause) {
                if (active) setError(cause instanceof Error ? cause.message : 'خطا در بارگذاری رسیدهای پرداخت')
            } finally {
                if (active) setIsLoading(false)
            }
        }
        void load()
        return () => { active = false }
    }, [type])

    const projects = useMemo(() => Array.from(new Map(data.flatMap(receipt => {
        const project = getReceiptProject(receipt, type)
        return project?.id === undefined ? [] : [[project.id, project] as const]
    })).values()), [data, type])
    const users = useMemo(() => Array.from(new Map(data.flatMap(receipt =>
        receipt.user?.id === undefined ? [] : [[receipt.user.id, receipt.user] as const]
    )).values()), [data])
    const banks = useMemo(() => Array.from(new Set(data.flatMap(receipt => receipt.targetBank ? [receipt.targetBank] : []))).sort(), [data])
    const filtered = useMemo(() => data.filter(receipt =>
        (!projectId || getReceiptProject(receipt, type)?.id === projectId) &&
        (!userId || (receipt.userId ?? receipt.user?.id) === userId) &&
        (!targetBank || receipt.targetBank === targetBank)
    ), [data, type, projectId, userId, targetBank])
    const summaries = useMemo(() => summarizeReceipts(filtered, type), [filtered, type])
    const totalAmount = filtered.reduce((sum, receipt) => sum + (receipt.amount ?? 0), 0)
    const label = type === 'preselling' ? 'پیش‌فروش' : 'نهایی'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto py-8 px-4 space-y-6">
                <div className="mb-8 space-y-1">
                    <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                        <CreditCard className="w-10 h-10 text-blue-600" />جمع رسیدهای {label}
                    </h1>
                    <p className="text-slate-600 text-lg">مشاهده مجموع پرداختی‌های {label} هر کاربر برای هر پروژه</p>
                </div>
                {error && <p role="alert" className="text-destructive">{error}</p>}
                {allowed && !error && <>
                    <div className="bg-white rounded-xl shadow-sm border p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectFilter">فیلتر بر اساس پروژه</Label>
                            <select id="projectFilter" className={selectClassName} value={projectId} onChange={event => setProjectId(event.target.value ? Number(event.target.value) : '')}>
                                <option value="">همه پروژه‌ها</option>
                                {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
                            </select>
                        </div>
                        <UserSelect users={users} selectedUserId={userId} onUserSelect={setUserId} placeholder="همه کاربران" label="فیلتر بر اساس کاربر" showAllOption />
                        <div className="space-y-2">
                            <Label htmlFor="targetBankFilter">فیلتر بر اساس بانک مقصد</Label>
                            <select id="targetBankFilter" className={selectClassName} value={targetBank} onChange={event => setTargetBank(event.target.value)}>
                                <option value="">همه بانک‌ها</option>
                                {banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                            </select>
                        </div>
                    </div>
                    {filtered.length > 0 && <section aria-label="آمار تراکنش‌های فیلتر شده" className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">آمار تراکنش‌های فیلتر شده</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                                <div className="text-sm text-slate-600 mb-1">تعداد تراکنش‌ها</div>
                                <div className="text-2xl font-bold text-blue-700">{filtered.length.toLocaleString('fa-IR')}</div>
                            </div>
                            <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100">
                                <div className="text-sm text-slate-600 mb-1">مجموع مبلغ پرداختی</div>
                                <div className="text-2xl font-bold text-green-700">{totalAmount.toLocaleString('fa-IR')} ریال</div>
                            </div>
                            <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                                <div className="text-sm text-slate-600 mb-1">میانگین مبلغ هر تراکنش</div>
                                <div className="text-2xl font-bold text-purple-700">{Math.round(totalAmount / filtered.length).toLocaleString('fa-IR')} ریال</div>
                            </div>
                        </div>
                    </section>}
                    <div className="bg-white rounded-xl shadow-sm border">
                        <DataTable columns={summaryColumns} data={summaries} _showDeleteButton={false} />
                    </div>
                </>}
                {isLoading && <PageLoader />}
            </div>
        </div>
    )
}
