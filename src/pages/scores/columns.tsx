import { type ColumnDef } from "@tanstack/react-table"
import type { User } from "../users/columns"
import type { Project } from "../projects/columns"

export type Score = {
    id?: number;
    userId?: number;
    projectId?: number;
    userName?: string;
    projectName?: string;
    area?: number;
    score?: string | number;
    user?: User;
    project?: Project;
}

export const columns: ColumnDef<Score>[] = [
    {
        accessorKey: "userName",
        header: "کاربر",
        cell: ({ row }) => {
            const userName = row.original.userName;
            return userName || "-";
        }
    },
    {
        accessorKey: "projectName",
        header: "پروژه",
        cell: ({ row }) => {
            const projectName = row.original.projectName;
            return projectName || "-";
        }
    },
    {
        accessorKey: "area",
        header: "مساحت (متر مربع)",
        cell: ({ row }) => {
            const area = row.original.area;
            return area ? area.toLocaleString('fa-IR') : "-";
        }
    },
    {
        accessorKey: "score",
        header: "امتیاز",
        cell: ({ row }) => {
            const score = row.original.score;
            return score ? String(score) : "-";
        }
    },
]

