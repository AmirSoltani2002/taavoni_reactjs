import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import { getToken } from "@/general"
import { api_base_url } from "@/config"
import { toast } from "sonner"
import type { User } from "../users/columns"
import type { SubProject } from "../projects/columns"

export type Transaction = {
    id?: number;
    userId?: number;
    subProjectId?: number;
    amount?: number;
    bank?: string;
    number?: string;
    document?: string;
    detail?: string;
    createdAt?: string;
    updatedAt?: string;
    user?: User;
    subProject?: SubProject;
}

export const columns: ColumnDef<Transaction>[] = [
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
        accessorKey: "subProject",
        header: "واحد",
        cell: ({ row }) => {
            const subProject = row.original.subProject;
            if (!subProject) return "-";
            const projectName = subProject.block?.project?.name || "";
            const blockName = subProject.block?.name || "";
            const unitNumber = subProject.unitNumber || "";
            return `${projectName} - ${blockName} - واحد ${unitNumber}`.replace(/^ - | - $/g, "").trim() || "-";
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
        accessorKey: "document",
        header: "مستندات",
        cell: ({ row }) => {
            const documentFilename = row.original.document;
            const transactionId = row.original.id;
            if (!documentFilename || !transactionId) return "-";
            
            const handleDownload = async () => {
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

            const handleView = async () => {
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
            
            return (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleView}
                    >
                        <Eye className="w-4 h-4 ml-1" />
                        مشاهده
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownload}
                    >
                        <Download className="w-4 h-4 ml-1" />
                        دانلود
                    </Button>
                </div>
            );
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
]

