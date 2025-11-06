import { type ColumnDef } from "@tanstack/react-table"
import { getDirection } from "./general";
 
// Updated types to match new schema
export type Project = {
    id?: number;
    name: string;
    address: string;
    landArea: number;
    startDate: string;
    endDate?: string;
    createdAt?: string;
    updatedAt?: string;
    longitude: number;
    latitude: number;
    blocks?: Block[];
    projectDocs?: ProjectDoc[];
}

export type Block = {
    id?: number;
    name: string;
    floorCount: number;
    shareArea: number;
    buildingArea: number;
    description?: string;
    projectId?: number;
    createdAt?: string;
    updatedAt?: string;
    subProjects?: SubProject[];
    project?: Project;
}

export type SubProject = {
    id?: number;
    area: number;
    floor: number;
    point: number;
    roomCount: number;
    options?: string;
    direction: string;
    unitNumber: number;
    userId?: number;
    blockId?: number;
    createdAt?: string;
    updatedAt?: string;
    subProjectDocs?: SubProjectDoc[];
    block?: Block;
}

export type ProjectDoc = {
    id?: number;
    projectId: number;
    document: string;
    detail?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type SubProjectDoc = {
    id?: number;
    subProjectId: number;
    document: string;
    detail?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const columns: ColumnDef<Project>[] = [
    {
        accessorKey: "name",
        header: "نام پروژه",
    },
    {
        accessorKey: "address",
        header: "آدرس",
        cell: ({ cell }) => {
            const value = cell.getValue() as string;
            return value ? (value.length > 50 ? value.substring(0, 50) + "..." : value) : "-";
        }
    },
    {
        accessorKey: "landArea",
        header: "مساحت زمین",
        cell: ({ cell }) => {
            const value = cell.getValue() as number;
            return value ? `${value} متر مربع` : "0 متر مربع";
        }
    },
    {
        accessorKey: "startDate",
        header: "تاریخ شروع",
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
    {
        accessorKey: "endDate",
        header: "تاریخ پایان",
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
    {
        accessorKey: "blocks",
        header: "تعداد بلوک",
        cell: ({ row }) => {
            const blocks = row.original.blocks;
            return blocks ? `${blocks.length} بلوک` : "0 بلوک";
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

export const subProjectColumns: ColumnDef<SubProject>[] = [
    {
        header: "نام پروژه",
        cell: ({ row }) => {
            const project = row.original.block?.project;
            return project ? project.name : "-";
        }
    },
    {
        header: "نام بلوک",
        cell: ({ row }) => {
            const block = row.original.block;
            return block ? block.name : "-";
        }
    },
    {
        accessorKey: "unitNumber",
        header: "شماره واحد",
    },
    {
        accessorKey: "area",
        header: "مساحت",
    },
    {
        accessorFn: (row) => {
            return getDirection(row.direction);
        },
        header: "جهت",
    },
    {
        accessorKey: "floor",
        header: "طبقه",
    },
    {
        accessorKey: "roomCount",
        header: "تعداد اتاق",
    },
]