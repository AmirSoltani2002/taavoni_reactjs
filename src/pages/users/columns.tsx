import { type ColumnDef } from "@tanstack/react-table"
import { CheckCircle2, CircleCheckBig, Crown, Download, XCircle } from "lucide-react";
import { downloadDocument } from "@/general";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    { label: 'کارمند دانشگاه تهران', value: 'tehranUni' },
    { label: 'هیئت علمی دانشگاه تهران', value: 'universityFaculty' },
    { label: 'کارمند سایر دانشگاه‌ها', value: 'otherUni' },
    { label: 'هیئت علمی سایر دانشگاه‌ها', value: 'otherUniversityFaculty' },
    { label: 'کارمند غیردانشگاهی', value: 'employee' },
    { label: 'عضو آزاد', value: 'free' },
];

export type IsargaryType = 'none' | 'martyrFamily' | 'janbaz' | 'azade' | 'isargar';
export type MartyrRelation = 'child' | 'brother' | 'parent' | 'spouse';
export type IsargarRelation = 'self' | 'spouse' | 'child';
export type FrontPresenceType = 'voluntary' | 'mandatory';

export const ISARGARY_TYPE_OPTIONS: { label: string; value: IsargaryType }[] = [
    { label: 'هیچ کدام', value: 'none' },
    { label: 'خانواده شهید', value: 'martyrFamily' },
    { label: 'جانباز', value: 'janbaz' },
    { label: 'آزاده', value: 'azade' },
    { label: 'ایثارگر', value: 'isargar' },
];

export const MARTYR_RELATION_OPTIONS: { label: string; value: MartyrRelation }[] = [
    { label: 'فرزند شهید', value: 'child' },
    { label: 'برادر شهید', value: 'brother' },
    { label: 'پدر یا مادر شهید', value: 'parent' },
    { label: 'همسر شهید', value: 'spouse' },
];

export const ISARGAR_RELATION_OPTIONS: { label: string; value: IsargarRelation }[] = [
    { label: 'خود ایثارگر', value: 'self' },
    { label: 'همسر ایثارگر', value: 'spouse' },
    { label: 'فرزند ایثارگر', value: 'child' },
];

export const FRONT_PRESENCE_TYPE_OPTIONS: { label: string; value: FrontPresenceType }[] = [
    { label: 'حضور داوطلبانه', value: 'voluntary' },
    { label: 'دوره ضرورت خدمت', value: 'mandatory' },
];

export const getIsargaryTypeLabel = (value: User['isargaryType']) =>
    ISARGARY_TYPE_OPTIONS.find(option => option.value === value)?.label ?? 'هیچ کدام';

export const getMartyrRelationLabel = (value: User['martyrRelation']) =>
    MARTYR_RELATION_OPTIONS.find(option => option.value === value)?.label ?? '-';

export const getIsargarRelationLabel = (value: User['isargarRelation']) =>
    ISARGAR_RELATION_OPTIONS.find(option => option.value === value)?.label ?? '-';

export const getFrontPresenceTypeLabel = (value: User['frontPresenceType']) =>
    FRONT_PRESENCE_TYPE_OPTIONS.find(option => option.value === value)?.label ?? '-';
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
    id?: number
    updatedAt?: string;
    createdAt?: string;
    address?: string;
    workAddress?: string;
    birthDay?: string;
    email?: string;
    homePhone?: string;
    isargaryType?: IsargaryType;
    martyrRelation?: MartyrRelation | null;
    isargarRelation?: IsargarRelation | null;
    janbaziPercent?: number | null;
    captivityMonths?: number | null;
    frontPresenceType?: FrontPresenceType | null;
    frontPresenceMonths?: number | null;
    lastName?: string
    mobile?: string;
    name?: string;
    nationalCard?: string;
    nationalNumber?: string;
    password?: string;
    sex?: 'male' | 'female' | string;
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
    validation: boolean;
    editedByInvestor: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const getUserType = (type: User['type'] | string): string => {
    if(type === 'system') {
        return 'مدیر سامانه';
    } else if(type === 'admin') {
        return 'ادمین';
    } else {
        return REGULAR_USER_TYPE_OPTIONS.find(option => option.value === type)?.label || type || '';
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
        header: "تلفن همراه",
    },
    {
        accessorKey: "type",
        header: "نوع حساب کاربری",
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
        accessorKey: "isargaryType",
        header: "نوع ایثارگری",
        cell: ({ cell }) => {
            const value = cell.getValue() as User['isargaryType'];
            return getIsargaryTypeLabel(value);
        }
    },
]

export const getDocsColumns = (
    downloadingDocs: Set<number>,
    setDownloadingDocs: (updater: (prev: Set<number>) => Set<number>) => void,
    canDownload: boolean = true,
): ColumnDef<UserDoc>[] => [
    {
        header: 'موضوع عکس',
        accessorFn: (row) => row.detail || 'بدون موضوع',
    },
    {
        header: 'تاریخ بارگذاری',
        accessorFn: (row) => {
            if(row.updatedAt){
                return (new Date(row.updatedAt)).toLocaleDateString('fa-IR');
            } else {
                return 'بدون تاریخ'
            }
        }
    },
    {
        header: 'دریافت',
        accessorFn: row => row.id,
        cell: ({row}) => {
            if (!canDownload) return null;
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
                    title="دریافت فایل"
                >
                    {isDownloading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                </Button>
            );
        }
    },
    {
        accessorKey: 'validation',
        header: 'وضعیت',
        cell: ({row}) => {
            const isVerified = row.original.validation === true;
            return (
                <Badge
                    variant={isVerified ? 'default' : 'destructive'}
                    className={isVerified ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                >
                    {isVerified ? (
                        <>
                            <CheckCircle2 className="w-3 h-3 ml-1" />
                            تاییدشده
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3 h-3 ml-1" />
                            تاییدنشده
                        </>
                    )}
                </Badge>
            );
        }
    }
]

// Keep the old export for backward compatibility
export const docs_columns: ColumnDef<UserDoc>[] = getDocsColumns(new Set(), () => {});
