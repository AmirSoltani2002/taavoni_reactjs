import { type ColumnDef } from "@tanstack/react-table"
import { CircleCheckBig, Crown, Download } from "lucide-react";
import { downloadDocument } from "@/general";
import { Button } from "@/components/ui/button";

export type UserType =
    | 'system'
    | 'admin'
    | 'tehranUni'
    | 'universityFaculty'
    | 'otherUni'
    | 'otherUniversityFaculty'
    | 'free'
    | 'employee';

export type RegularUserType = Exclude<UserType, 'system' | 'admin'>;

export const REGULAR_USER_TYPE_OPTIONS: { label: string; value: RegularUserType }[] = [
    { label: 'کارمند دانشگاهی', value: 'tehranUni' },
    { label: 'هیئت علمی دانشگاهی', value: 'universityFaculty' },
    { label: 'کارمند سایر دانشگاه‌ها', value: 'otherUni' },
    { label: 'هیئت علمی سایر دانشگاه‌ها', value: 'otherUniversityFaculty' },
    { label: 'کارمند غیردانشگاهی', value: 'employee' },
    { label: 'عضو آزاد', value: 'free' },
];
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
    id?: number
    updatedAt?: string;
    createdAt?: string;
    address?: string;
    azadeEsaratMonths?: null | number
    azadeMonths?: null | number
    birthDay?: string;
    email?: string;
    homePhone?: string;
    isargaryPercent?: 'val10_15' | 'val15_20' | 'val20_plus';
    lastName?: string
    mobile?: string;
    name?: string;
    nationalCard?: string;
    nationalNumber?: string;
    password?: string;
    sex?: 'male' | 'female' | string;
    shahedFamilyNumber?: null | number
    shahedRelation?: null | 'azade_wife' | 'azade_child' | 'jan_wife' | 'jan_child';
    subProjects?: any[];
    type?: null | UserType;
    workPhone?: string;
    accepted?: boolean;
}
export type UserDoc = {
    id?: number;
    userId?: number;
    document?: string;
    detail?: string,
    createdAt?: string;
    updatedAt?: string;
}

export const getUserType = (type: User['type'] | string): string => {
    if(type === 'system') {
        return 'مدیر سیستم';
    } else if(type === 'admin') {
        return 'ادمین';
    } else {
        return REGULAR_USER_TYPE_OPTIONS.find(option => option.value === type)?.label || type || '';
    }
}

export const getIsargaryPercentLabel = (value: User['isargaryPercent']) => {
    if(value === 'val10_15') {
        return '۱۰−۱۵%';
    } else if(value === 'val15_20') {
        return '۱۵−۲۰%';
    } else if(value === 'val20_plus') {
        return '۲۰%+';
    } else {
        return null;
    }
}
export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "id",
        header: "شناسه",
    },
    {
        accessorKey: "name",
        header: "نام",
        cell: ({row}) => {
            const u = row.original;
            const Badge = (u.type === 'system' || u.type === 'admin') ? Crown : u.accepted ? CircleCheckBig : null;
            const badgeColor = Badge === Crown ? 'purple' : 'green'
            return <span>
                {row.original.name}
                {Badge && <Badge className="m-1" size={15} style={{display: 'inline', color: `var(--color-${badgeColor}-500)`}} />}
            </span>
        }
    },
    {
        accessorKey: "lastName",
        header: "نام خانوادگی",
    },
    {
        accessorKey: "nationalNumber",
        header: "کد ملی",
    },
    {
        accessorKey: "mobile",
        header: "موبایل",
    },
    {
        accessorKey: "type",
        header: "نوع اکانت",
        cell: ({ cell }) => {
            const v = cell.getValue() as User['type'];
            return getUserType(v);
        }
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
        accessorKey: "isargary_percent",
        header: "درصد ایثارگری",
        cell: ({ cell }) => {
            const v = cell.getValue() as User['isargaryPercent'];
            const label = getIsargaryPercentLabel(v);
            return label || 'ندارد';
        }
    },
]

export const getDocsColumns = (downloadingDocs: Set<number>, setDownloadingDocs: (updater: (prev: Set<number>) => Set<number>) => void): ColumnDef<UserDoc>[] => [
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
        header: 'دانلود',
        accessorFn: row => row.id,
        cell: ({row}) => {
            const docId = row.original.id;
            if (!docId) return null;
            const isDownloading = downloadingDocs.has(docId);
            
            return (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                        setDownloadingDocs(prev => new Set(prev).add(docId));
                        try {
                            await downloadDocument(docId, 'user-doc', row.original.detail || 'document', true);
                        } finally {
                            setDownloadingDocs(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(docId);
                                return newSet;
                            });
                        }
                    }}
                    disabled={isDownloading}
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                    title="دانلود فایل"
                >
                    {isDownloading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                </Button>
            );
        }
    }
]

// Keep the old export for backward compatibility
export const docs_columns: ColumnDef<UserDoc>[] = getDocsColumns(new Set(), () => {});
