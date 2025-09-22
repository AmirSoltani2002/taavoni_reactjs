import { type ColumnDef } from "@tanstack/react-table"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Project = {
    id: number;
    name: string;
    address: string;
    startDate: string;
    endDate: string;
    floorCount: number;
    unitCount: number;
    blockNumber: number;
    landArea: number;
    sharedArea: number;
    options: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
}
 
export const columns: ColumnDef<Project>[] = [
    {
        accessorKey: "image",
        header: "تصویر",
        cell: ({ cell }) => {
            const value = cell.getValue() as string;
            return value ? (
                <img 
                    src={value} 
                    alt="تصویر پروژه" 
                    className="w-12 h-12 object-cover rounded-lg border"
                />
            ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">بدون تصویر</span>
                </div>
            );
        }
    },
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
        accessorKey: "unitCount",
        header: "تعداد واحد",
        cell: ({ cell }) => {
            const value = cell.getValue() as number;
            return value ? `${value} واحد` : "0 واحد";
        }
    },
    {
        accessorKey: "floorCount",
        header: "تعداد طبقه",
        cell: ({ cell }) => {
            const value = cell.getValue() as number;
            return value ? `${value} طبقه` : "0 طبقه";
        }
    },
    {
        accessorKey: "blockNumber",
        header: "تعداد بلوک",
        cell: ({ cell }) => {
            const value = cell.getValue() as number;
            return value ? `${value} بلوک` : "1 بلوک";
        }
    },
    {
        accessorKey: "landArea",
        header: "مساحت زمین",
        cell: ({ cell }) => {
            const value = cell.getValue() as number;
            return value ? `${value} متر` : "0 متر";
        }
    },
    {
        accessorKey: "sharedArea",
        header: "مشاعات",
        cell: ({ cell }) => {
            const value = cell.getValue() as number;
            return value ? `${value} متر` : "0 متر";
        }
    },
    {
        accessorKey: "options",
        header: "توضیحات",
        cell: ({ cell }) => {
            const value = cell.getValue() as string;
            return value ? (value.length > 30 ? value.substring(0, 30) + "..." : value) : "-";
        }
    },
]
