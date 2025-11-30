import { type ColumnDef } from "@tanstack/react-table"
import type { User } from "../users/columns"
import type { Project } from "../projects/columns"

export type PreSelling = {
    id?: number;
    userId?: number;
    projectId?: number;
    area?: number;
    totalPrice?: number;
    createdAt?: string;
    updatedAt?: string;
    user?: User;
    project?: Project;
}

export const columns: ColumnDef<PreSelling>[] = [
    {
        accessorKey: "id",
        header: "شناسه",
    },
    {
        accessorKey: "user",
        header: "کاربر",
        cell: ({ row }) => {
            const user = row.original.user;
            if (user) {
                return `${user.name || ''} ${user.lastName || ''}`.trim() || 'بدون نام';
            }
            return 'بدون کاربر';
        }
    },
    {
        accessorKey: "project",
        header: "پروژه",
        cell: ({ row }) => {
            const project = row.original.project;
            return project?.name || 'بدون پروژه';
        }
    },
    {
        accessorKey: "area",
        header: "مساحت (متر مربع)",
        cell: ({ cell }) => {
            const value = cell.getValue() as number | undefined;
            return value ? value.toLocaleString('fa-IR') : '0';
        }
    },
    {
        accessorKey: "totalPrice",
        header: "قیمت کل (تومان)",
        cell: ({ cell }) => {
            const value = cell.getValue() as number | undefined;
            return value ? value.toLocaleString('fa-IR') : '0';
        }
    },
]

