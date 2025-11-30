import { type ColumnDef } from "@tanstack/react-table"
import { Download, Eye, CheckCircle2, XCircle } from "lucide-react"
import { getToken, updateTableRow } from "@/general"
import { api_base_url } from "@/config"
import { toast } from "sonner"
import type { User } from "../users/columns"
import type { Project } from "../projects/columns"
import type { SubProject } from "../projects/columns"
import { Badge } from "@/components/ui/badge"
import type { ReactNode } from "react"

export type Transaction = {
    id?: number;
    userId?: number;
    projectId?: number;
    amount?: number;
    bank?: string;
    targetBank?: string;
    number?: string;
    document?: string;
    detail?: string;
    isConfirmed?: boolean;
    createdAt?: string;
    updatedAt?: string;
    user?: User;
    project?: Project;
}

export type FinalTransaction = {
    id?: number;
    userId?: number;
    subProjectId?: number;
    amount?: number;
    bank?: string;
    targetBank?: string;
    number?: string;
    document?: string;
    detail?: string;
    date?: string;
    createdAt?: string;
    updatedAt?: string;
    user?: User;
    subProject?: SubProject;
}

export const getColumns = (): ColumnDef<Transaction>[] => {
    const baseColumns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "isConfirmed",
        header: "وضعیت",
        cell: ({ row }) => {
            const isConfirmed = row.original.isConfirmed ?? false;
            return (
                <Badge 
                    variant={isConfirmed ? "default" : "destructive"}
                    className={isConfirmed ? "bg-green-500 text-white" : "bg-red-500 text-white"}
                >
                    {isConfirmed ? (
                        <>
                            <CheckCircle2 className="w-3 h-3 ml-1" />
                            تایید شده
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3 h-3 ml-1" />
                            تایید نشده
                        </>
                    )}
                </Badge>
            );
        }
    },
    {
        accessorKey: "user",
        header: "کاربر",
        cell: ({ row }) => {
            const user = row.original.user;
            if (!user) return "-";
            return `${user.name || ''} ${user.lastName || ''}`.trim() || "-";
        }
    },
    {
        header: "پروژه",
        cell: ({ row }) => {
            const project = row.original.project;
            if (!project) return "-";
            return project.name || "-";
        }
    },
    {
        accessorKey: "amount",
        header: "مبلغ",
        cell: ({ cell }) => {
            const value = cell.getValue() as number;
            return value ? `${value.toLocaleString('fa-IR')} تومان` : "-";
        }
    },
    {
        accessorKey: "bank",
        header: "بانک",
    },
    {
        accessorKey: "targetBank",
        header: "بانک مقصد",
    },
    {
        accessorKey: "number",
        header: "شماره تراکنش",
    },
    {
        accessorKey: "detail",
        header: "جزئیات",
        cell: ({ cell }) => {
            const value = cell.getValue() as string;
            return value ? (value.length > 50 ? value.substring(0, 50) + "..." : value) : "-";
        }
    },
    {
        accessorKey: "createdAt",
        header: "تاریخ ایجاد",
        cell: ({ cell }) => {
            const value = cell.getValue() as string;
            if (!value) return "-";
            try {
                return new Date(value).toLocaleDateString('fa-IR');
            } catch {
                return value;
            }
        }
    },
    ];

    return baseColumns;
};

export const getTransactionOptions = (onRefresh?: () => void, userInfo?: User): ((transaction: Transaction) => { title: string | ReactNode; onClick: () => void }[]) => {
    const handleToggleConfirmation = async (transaction: Transaction, confirm: boolean) => {
        if (!transaction.id) return;
        
        updateTableRow('transaction', transaction.id, { isConfirmed: confirm }, (data) => {
            if (data && data.id) {
                toast.success(confirm ? 'تراکنش تایید شد' : 'تراکنش رد شد');
                if (onRefresh) {
                    onRefresh();
                }
            }
        });
    };

    const handleDownload = async (transaction: Transaction) => {
        const documentFilename = transaction.document;
        const transactionId = transaction.id;
        if (!documentFilename || !transactionId) {
            toast.error('فایل موجود نیست');
            return;
        }

        try {
            const token = getToken();
            const resp = await fetch(`${api_base_url}/transaction/download/${transactionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            if (resp.ok) {
                const blob = await resp.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                
                // Get filename from Content-Disposition header or use document filename
                const contentDisposition = resp.headers.get('Content-Disposition');
                let downloadFilename = documentFilename;
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch && filenameMatch[1]) {
                        downloadFilename = filenameMatch[1].replace(/['"]/g, '');
                    }
                }
                
                a.download = downloadFilename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const err = await resp.json();
                toast.error(err.message || 'خطا در دانلود فایل');
            }
        } catch (error: any) {
            console.error('Download error:', error);
            toast.error('خطا در دانلود فایل');
        }
    };

    const handleView = async (transaction: Transaction) => {
        const transactionId = transaction.id;
        if (!transactionId) {
            toast.error('فایل موجود نیست');
            return;
        }

        try {
            const token = getToken();
            const resp = await fetch(`${api_base_url}/transaction/download/${transactionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            if (resp.ok) {
                const blob = await resp.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                // Clean up the URL after a delay
                setTimeout(() => window.URL.revokeObjectURL(url), 100);
            } else {
                const err = await resp.json();
                toast.error(err.message || 'خطا در مشاهده فایل');
            }
        } catch (error: any) {
            console.error('View error:', error);
            toast.error('خطا در مشاهده فایل');
        }
    };

    return (transaction: Transaction) => {
        const isConfirmed = transaction.isConfirmed ?? false;
        const hasDocument = transaction.document && transaction.id;
        const options: { title: string | ReactNode; onClick: () => void }[] = [];
        
        // Add document view/download options if document exists
        if (hasDocument) {
            options.push({
                title: (
                    <>
                        <Eye className="w-4 h-4 ml-1 inline" />
                        مشاهده مستندات
                    </>
                ),
                onClick: () => handleView(transaction)
            });
            options.push({
                title: (
                    <>
                        <Download className="w-4 h-4 ml-1 inline" />
                        دانلود مستندات
                    </>
                ),
                onClick: () => handleDownload(transaction)
            });
        }
        
        // Add confirmation options for admins
        const isAdmin = ['admin', 'system'].includes(userInfo?.type || '');
        if (isAdmin) {
            if (!isConfirmed) {
                options.push({
                    title: (
                        <>
                            <CheckCircle2 className="w-4 h-4 ml-1 inline" />
                            تایید
                        </>
                    ),
                    onClick: () => handleToggleConfirmation(transaction, true)
                });
            } else {
                options.push({
                    title: (
                        <>
                            <XCircle className="w-4 h-4 ml-1 inline" />
                            رد تایید
                        </>
                    ),
                    onClick: () => handleToggleConfirmation(transaction, false)
                });
            }
        }
        
        return options;
    };
};

// Export default columns for backward compatibility (non-admin)
export const columns: ColumnDef<Transaction>[] = getColumns();

export const getFinalTransactionColumns = (): ColumnDef<FinalTransaction>[] => {
    return [
        {
            accessorKey: "user",
            header: "کاربر",
            cell: ({ row }) => {
                const user = row.original.user;
                if (!user) return "-";
                return `${user.name || ''} ${user.lastName || ''}`.trim() || "-";
            }
        },
        {
            header: "واحد",
            cell: ({ row }) => {
                const subProject = row.original.subProject;
                if (!subProject) return "-";
                const block = subProject.block;
                const project = block?.project;
                return project && block 
                    ? `${project.name} - ${block.name} - واحد ${subProject.unitNumber || '-'}`
                    : `واحد ${subProject.unitNumber || '-'}`;
            }
        },
        {
            accessorKey: "amount",
            header: "مبلغ",
            cell: ({ cell }) => {
                const value = cell.getValue() as number;
                return value ? `${value.toLocaleString('fa-IR')} تومان` : "-";
            }
        },
        {
            accessorKey: "bank",
            header: "بانک",
        },
        {
            accessorKey: "targetBank",
            header: "بانک مقصد",
        },
        {
            accessorKey: "number",
            header: "شماره تراکنش",
        },
        {
            accessorKey: "detail",
            header: "جزئیات",
            cell: ({ cell }) => {
                const value = cell.getValue() as string;
                return value ? (value.length > 50 ? value.substring(0, 50) + "..." : value) : "-";
            }
        },
        {
            accessorKey: "date",
            header: "تاریخ",
            cell: ({ cell }) => {
                const value = cell.getValue() as string;
                if (!value) return "-";
                try {
                    return new Date(value).toLocaleDateString('fa-IR');
                } catch {
                    return value;
                }
            }
        },
    ];
};

export const getFinalTransactionOptions = (): ((transaction: FinalTransaction) => { title: string | ReactNode; onClick: () => void }[]) => {
    const handleDownload = async (transaction: FinalTransaction) => {
        const documentFilename = transaction.document;
        const transactionId = transaction.id;
        if (!documentFilename || !transactionId) {
            toast.error('فایل موجود نیست');
            return;
        }

        try {
            const token = getToken();
            const resp = await fetch(`${api_base_url}/final-transaction/download/${transactionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            if (resp.ok) {
                const blob = await resp.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                
                const contentDisposition = resp.headers.get('Content-Disposition');
                let downloadFilename = documentFilename;
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch && filenameMatch[1]) {
                        downloadFilename = filenameMatch[1].replace(/['"]/g, '');
                    }
                }
                
                a.download = downloadFilename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const err = await resp.json();
                toast.error(err.message || 'خطا در دانلود فایل');
            }
        } catch (error: any) {
            console.error('Download error:', error);
            toast.error('خطا در دانلود فایل');
        }
    };

    const handleView = async (transaction: FinalTransaction) => {
        const transactionId = transaction.id;
        if (!transactionId) {
            toast.error('فایل موجود نیست');
            return;
        }

        try {
            const token = getToken();
            const resp = await fetch(`${api_base_url}/final-transaction/download/${transactionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            
            if (resp.ok) {
                const blob = await resp.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                setTimeout(() => window.URL.revokeObjectURL(url), 100);
            } else {
                const err = await resp.json();
                toast.error(err.message || 'خطا در مشاهده فایل');
            }
        } catch (error: any) {
            console.error('View error:', error);
            toast.error('خطا در مشاهده فایل');
        }
    };

    return (transaction: FinalTransaction) => {
        const hasDocument = transaction.document && transaction.id;
        const options: { title: string | ReactNode; onClick: () => void }[] = [];
        
        if (hasDocument) {
            options.push({
                title: (
                    <>
                        <Eye className="w-4 h-4 ml-1 inline" />
                        مشاهده مستندات
                    </>
                ),
                onClick: () => handleView(transaction)
            });
            options.push({
                title: (
                    <>
                        <Download className="w-4 h-4 ml-1 inline" />
                        دانلود مستندات
                    </>
                ),
                onClick: () => handleDownload(transaction)
            });
        }
        
        return options;
    };
};

