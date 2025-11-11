import { type ColumnDef } from "@tanstack/react-table"
import { CircleCheckBig, Crown, Download } from "lucide-react";
import { getDocumentDownloadUrl, downloadDocument } from "@/general";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
 
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
    isargaryPercent?: null | number
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
    type?: null | 'system' | 'admin' | 'tehranUni' | 'otherUni' | 'free' | 'employee';
    workPhone?: string;
    accepted?: boolean;
}
export type UserDoc = {
    id?: number;
    userId?: number;
    document?: string;
    detail?: null,
    createdAt?: string;
    updatedAt?: string;
}

export const getUserType = (type: any) => {
    if(type === 'system') {
        return 'مدیر سیستم';
    } else if(type === 'admin') {
        return 'ادمین';
    } else if(type === 'tehranUni') {
        return 'عضو دانشگاه تهران';
    } else if(type === 'otherUni') {
        return 'عضو سایر دانشگاه ها';
    } else if(type === 'employee') {
        return ' کارمند غیر دانشگاهی';
    } else if(type === 'free') {
        return 'عضو آزاد';
    } else {
        return type;
    }
}
export const columns: ColumnDef<User>[] = [
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
            const v = cell.getValue();
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
            const v = cell.getValue();
            return v ? `${v} %` : 'ندارد'
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
        cell: ({row}) => {
            const docId = row.original.id;
            if (!docId) return 'بدون تصویر';
            
            // Component to handle async image loading
            const ImageCell = () => {
                const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
                const [loading, setLoading] = useState(true);
                
                useEffect(() => {
                    let isMounted = true;
                    
                    getDocumentDownloadUrl(docId, 'user-doc', false).then((url: string | undefined) => {
                        if (isMounted) {
                            setImageUrl(url);
                            setLoading(false);
                        }
                    }).catch(() => {
                        if (isMounted) {
                            setLoading(false);
                        }
                    });
                    
                    return () => {
                        isMounted = false;
                    };
                }, [docId]);
                
                if (loading) {
                    return <div style={{ maxWidth: 120, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>در حال بارگذاری...</div>;
                }
                
                if (!imageUrl) {
                    return 'بدون تصویر';
                }
                
                const parts = imageUrl?.split('-') ?? [];
                const filename = parts.length ? parts[parts.length - 1] : 'img';
                return <img src={imageUrl} alt={filename} style={{ maxWidth: 120 }} />;
            };
            
            return <ImageCell />;
        }
    },
    {
        header: 'دانلود',
        accessorFn: row => row.id,
        cell: ({row}) => {
            const docId = row.original.id;
            if (!docId) return null;
            
            return (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadDocument(docId, 'user-doc', row.original.detail || 'document', true)}
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                    title="دانلود فایل"
                >
                    <Download className="h-4 w-4" />
                </Button>
            );
        }
    }
]