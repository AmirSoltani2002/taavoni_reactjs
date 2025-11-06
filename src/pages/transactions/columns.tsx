import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import { getDocumentDownloadUrl, downloadDocument } from "@/general"
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
            const document = row.original.document;
            if (!document) return "-";
            
            // Check if document is a numeric string (document ID) or a URL/path
            const isNumeric = /^\d+$/.test(document);
            
            if (isNumeric) {
                // Treat as document ID
                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                                const url = await getDocumentDownloadUrl(parseInt(document), 'user-doc', false);
                                if (url) {
                                    window.open(url, '_blank');
                                }
                            }}
                        >
                            <Eye className="w-4 h-4 ml-1" />
                            مشاهده
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                                await downloadDocument(parseInt(document), 'user-doc');
                            }}
                        >
                            <Download className="w-4 h-4 ml-1" />
                            دانلود
                        </Button>
                    </div>
                );
            } else {
                // Treat as URL or file path
                const isUrl = document.startsWith('http://') || document.startsWith('https://') || document.startsWith('/');
                if (isUrl) {
                    return (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(document, '_blank')}
                        >
                            <Eye className="w-4 h-4 ml-1" />
                            مشاهده
                        </Button>
                    );
                } else {
                    return <span className="text-sm text-gray-600">{document}</span>;
                }
            }
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

