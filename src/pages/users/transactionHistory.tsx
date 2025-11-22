import { type ColumnDef } from "@tanstack/react-table";
import type { SubProject } from "../projects/columns";
import type { User } from "./columns";

export type TransactionHistory = {
    id?: number;
    subProjectId?: number;
    userId?: number;
    createdAt?: string;
    updatedAt?: string;
    subProject?: SubProject;
    user?: User;
};

export const getTransactionHistoryColumns = (): ColumnDef<TransactionHistory>[] => [
    {
        accessorKey: "subProject",
        header: "واحد",
        cell: ({ row }) => {
            const subProject = row.original.subProject;
            if (!subProject) return "-";
            const project = subProject.block?.project;
            const block = subProject.block;
            return (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {project?.name || "-"} - {block?.name || "-"} - واحد {subProject.unitNumber || "-"}
                    </span>
                    <span className="text-sm text-gray-500">
                        {subProject.area ? `${subProject.area} متر مربع` : ""} {subProject.floor ? `• طبقه ${subProject.floor}` : ""}
                    </span>
                </div>
            );
        }
    },
    {
        accessorKey: "createdAt",
        header: "تاریخ واگذاری",
        cell: ({ cell }) => {
            const value = cell.getValue() as string;
            if (!value) return "-";
            try {
                return new Date(value).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch {
                return value;
            }
        }
    },
];

export const getSubProjectHistoryColumns = (): ColumnDef<TransactionHistory>[] => [
    {
        accessorKey: "user",
        header: "کاربر",
        cell: ({ row }) => {
            const user = row.original.user;
            if (!user) return "-";
            return (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {user.name || ""} {user.lastName || ""}
                    </span>
                    {user.email && (
                        <span className="text-sm text-gray-500">{user.email}</span>
                    )}
                    {user.mobile && (
                        <span className="text-sm text-gray-500">{user.mobile}</span>
                    )}
                </div>
            );
        }
    },
    {
        accessorKey: "createdAt",
        header: "تاریخ واگذاری",
        cell: ({ cell }) => {
            const value = cell.getValue() as string;
            if (!value) return "-";
            try {
                return new Date(value).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch {
                return value;
            }
        }
    },
];

