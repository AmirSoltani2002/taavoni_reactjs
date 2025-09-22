import { api_base_url } from "@/config";
import { type ColumnDef } from "@tanstack/react-table"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
    address: string;
    azadeEsaratMonths: null | number
    azadeMonths: null | number
    birthDay: string;
    createdAt: string;
    email: string;
    homePhone: string;
    id: number
    isargaryPercent: null | number
    lastName: string
    mobile: string;
    name: string;
    nationalCard: string;
    nationalNumber: string;
    password: string;
    sex: 'male' | 'female' | string;
    shahedFamilyNumber: null | number
    shahedRelation: null | 'azade_wife' | 'azade_child' | 'jan_wife' | 'jan_child';
    subProjects: any[];
    type: null | 'system' | 'admin' | 'tehranUni' | 'otherUni' | 'free' | 'employee';
    updatedAt: string;
    workPhone: string;
}
export type UserDoc = {
    id?: number;
    userId?: number;
    document?: string;
    detail?: null,
    createdAt?: string;
    updatedAt?: string;
}
export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: "نام",
        cell: ({row}) => {
            return row.original.name + ' ' + row.original.lastName
        }
    },
    {
        accessorKey: "email",
        header: "ایمیل",
    },
    {
        accessorKey: "type",
        header: "نوع اکانت",
        cell: ({ cell }) => {
            const v = cell.getValue();
            if(v === 'system') {
                return 'مدیر سیستم';
            } else if(v === 'admin') {
                return 'ادمین';
            } else if(v === 'tehranUni') {
                return 'عضو دانشگاه تهران';
            } else if(v === 'otherUni') {
                return 'عضو سایر دانشگاه ها';
            } else if(v === 'employee') {
                return ' کارمند غیر دانشگاهی';
            } else if(v === 'free') {
                return 'عضو آزاد';
            } else {
                return v;
            }
        }
    },
    {
        accessorKey: "mobile",
        header: "موبایل",
    },
    {
        accessorKey: "nationalNumber",
        header: "کد ملی",
    },
    {
        accessorKey: "birthDate",
        header: "تاریخ تولد",
    },
    {
        accessorKey: "sex",
        header: "جنسیت",
        cell: ({ cell }) => {
            const v = cell.getValue();
            if(v === 'male') {
                return 'مرد'
            } else if(v === 'female') {
                return 'خانم'
            } else {
                return 'نامشخص'
            }
        }
    },
    {
        accessorKey: "address",
        header: "آدرس"
    },
    {
        accessorKey: "isargary_percent",
        header: "درصد ایثارگری",
        cell: ({ cell }) => {
            const v = cell.getValue();
            return v ? `${v} %` : 'ندارد'
        }
    },
    {
        accessorKey: "azade_esarat_months",
        header: "ماه های اسارت",
        cell: ({ cell }) => {
            const v = cell.getValue();
            return v ? `${v} ماه` : 'ندارد'
        }
    },
    {
        accessorKey: "azade_months",
        header: "ماه های آزادگی",
        cell: ({ cell }) => {
            const v = cell.getValue();
            return v ? `${v} ماه` : 'ندارد'
        }
    },
    {
        accessorKey: "shahed_family_number",
        header: "تعداد اعضای خانواده شاهد",
        cell: ({ cell }) => {
            const v = cell.getValue();
            return v ? v : 'ندارد'
        }
    },
    {
        accessorKey: "isargari_relation",
        header: "ارتباط با ایثارگر",
        cell: ({ cell }) => {
            const v = cell.getValue();
            if(v === 'azade_wife') {
                return 'همسر آزاده'
            } else if(v === 'azade_child') {
                return 'فرزند آزاده'
            } else if(v === 'jan_wife') {
                return 'همسر جانباز'
            } else if(v === 'jan_child') {
                return 'فرزند جانباز'
            } else {
                return 'ندارد'
            }
        }
    },
]

export const docs_columns: ColumnDef<UserDoc>[] = [
    {
        header: 'موضوع عکس',
        accessorFn: (row) => row.detail || 'بدون موضوع',
    },
    {
        header: 'تاریخ آپلود',
        accessorFn: (row) => {
            if(row.updatedAt){
                return (new Date(row.updatedAt)).toLocaleDateString('fa-IR');
            } else {
                return 'بدون تاریخ'
            }
        }
    },
    {
        header: 'تصویر',
        accessorFn: row => row.document ?? row.document ?? '', // return string URL only
        // render JSX in `cell`
        cell: ({cell}) => {
            const src = cell.getValue() as string;
            const parts = src?.split('-') ?? [];
            const filename = parts.length ? parts[parts.length - 1] : 'img';
            if (!src) return 'بدون تصویر';
            return <img src={`${api_base_url.replace('/api', '')}${src}`} alt={filename} style={{ maxWidth: 120 }} />;
        }
    }
]