import type { Transaction, FinalTransaction } from './columns'
import type { User } from '../users/columns'
import type { Project } from '../projects/columns'

export type ReceiptType = 'preselling' | 'final'
export type Receipt = Transaction & FinalTransaction
export type TransactionSummary = {
    id?: number;
    userId: number;
    user?: User;
    project: Project;
    firstPaymentDate: number | null;
    lastPaymentDate: number | null;
    totalAmount: number;
}

export const getReceiptProject = (receipt: Receipt, type: ReceiptType) =>
    type === 'preselling' ? receipt.preselling?.project : receipt.subProject?.block?.project

export function summarizeReceipts(receipts: Receipt[], type: ReceiptType): TransactionSummary[] {
    const groups = new Map<string, TransactionSummary>()
    for (const receipt of receipts) {
        const project = getReceiptProject(receipt, type)
        const userId = receipt.userId ?? receipt.user?.id
        if (userId === undefined || project?.id === undefined) continue
        const key = `${userId}:${project.id}`
        const group = groups.get(key) ?? {
            userId, user: receipt.user, project,
            firstPaymentDate: null, lastPaymentDate: null, totalAmount: 0,
        }
        group.totalAmount += receipt.amount ?? 0
        const date = receipt.date ? new Date(receipt.date).getTime() : NaN
        if (Number.isFinite(date)) {
            group.firstPaymentDate = group.firstPaymentDate === null ? date : Math.min(group.firstPaymentDate, date)
            group.lastPaymentDate = group.lastPaymentDate === null ? date : Math.max(group.lastPaymentDate, date)
        }
        groups.set(key, group)
    }
    return Array.from(groups.values())
}
