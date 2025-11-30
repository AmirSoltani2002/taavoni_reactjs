import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTable, postTable, updateTableRow } from "@/general";
import { toast } from "sonner";
import type { Project } from "../projects/columns";
import type { User } from "../users/columns";
import { UserSelect } from "@/components/user-select";

type PreSellingFormData = {
    userId: number | '';
    projectId: number | '';
    area: number | '';
};

const initialState: PreSellingFormData = {
    userId: '',
    projectId: '',
    area: '',
};

interface PreSellingCreateProps {
    initialValues?: PreSellingFormData & { id?: number };
    onSubmit?: (data: PreSellingFormData) => void;
    onCancel?: () => void;
    userInfo?: User;
    isEdit?: boolean;
}

export default function PreSellingCreate({ 
    initialValues, 
    onSubmit, 
    onCancel, 
    userInfo: propUserInfo,
    isEdit = false 
}: PreSellingCreateProps) {
    const [userInfo, setUserInfo] = useState<User | undefined>(propUserInfo);
    const [form, setForm] = useState<PreSellingFormData>(() => {
        if (initialValues) {
            return {
                userId: initialValues.userId || '',
                projectId: initialValues.projectId || '',
                area: initialValues.area || '',
            };
        }
        return initialState;
    });
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

    // Fetch userInfo if not provided (for edit mode from DataTable)
    useEffect(() => {
        if (!propUserInfo) {
            getTable('users/profile', (user) => {
                setUserInfo(user);
            });
        }
    }, [propUserInfo]);

    const isAdmin = ['admin', 'system'].includes(userInfo?.type || '');

    useEffect(() => {
        // Fetch all users if admin
        if (isAdmin) {
            getTable('users', (data: User[] | { error: { error: string, status: number } }) => {
                if ('error' in data) {
                    console.error('Error loading users:', data.error);
                } else {
                    setUsers(data as User[]);
                }
            }, false);
        }
    }, [isAdmin]);

    useEffect(() => {
        // Fetch all projects
        getTable('projects/all/name', (data: Project[] | { error: { error: string, status: number } }) => {
            if ('error' in data) {
                console.error('Error loading projects:', data.error);
                toast.error('خطا در بارگذاری پروژه‌ها');
                setProjects([]);
            } else {
                setProjects(data as Project[]);
            }
        }, false);
    }, []);

    const formatNumberWithSeparator = (value: number | ''): string => {
        if (value === '' || value === null || value === undefined) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const parseNumberFromFormatted = (value: string): number | '' => {
        const numericValue = value.replace(/[^\d]/g, '');
        if (numericValue === '') return '';
        const num = parseInt(numericValue, 10);
        return isNaN(num) ? '' : num;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'area') {
            const numericValue = parseNumberFromFormatted(value);
            setForm((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value ? Number(value) : '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.area || form.area <= 0) {
            toast.error('لطفا مساحت را وارد کنید');
            return;
        }

        if (!form.projectId) {
            toast.error('لطفا پروژه را انتخاب کنید');
            return;
        }

        // For admin, require userId selection
        if (isAdmin && !form.userId) {
            toast.error('لطفا کاربر را انتخاب کنید');
            return;
        }

        // For normal users, use their own userId
        const userId = isAdmin ? form.userId : userInfo?.id;
        if (!userId) {
            toast.error('کاربر مشخص نشده است');
            return;
        }

        setIsLoading(true);

        const payload = {
            userId: userId,
            projectId: form.projectId,
            area: form.area,
        };

        if (isEdit && initialValues?.id) {
            // Update existing preselling
            updateTableRow('pre-selling', initialValues.id, payload, (data) => {
                if (data && data.id) {
                    toast.success('پیش‌فروش با موفقیت بروزرسانی شد');
                    if (onSubmit) {
                        onSubmit(payload);
                    }
                }
                setIsLoading(false);
            });
        } else {
            // Create new preselling
            postTable('pre-selling', payload, (data) => {
                if (data && data.id) {
                    toast.success('پیش‌فروش با موفقیت ثبت شد');
                    if (onSubmit) {
                        onSubmit(payload);
                    }
                    setForm(initialState);
                }
                setIsLoading(false);
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {/* User Selection for Admin */}
                {isAdmin && (
                    <UserSelect
                        users={users}
                        selectedUserId={form.userId}
                        onUserSelect={(userId) => {
                            setForm((prev) => ({ ...prev, userId: userId || '', projectId: '' }));
                        }}
                        label="کاربر"
                        required
                    />
                )}

                {/* Project Selection */}
                <div className="space-y-2">
                    <Label htmlFor="projectId">
                        پروژه <span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="projectId"
                        name="projectId"
                        value={form.projectId}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    >
                        <option value="">انتخاب پروژه</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name || 'بدون نام'}
                            </option>
                        ))}
                    </select>
                    {projects.length === 0 && (
                        <p className="text-sm text-gray-500">هیچ پروژه‌ای ثبت نشده است</p>
                    )}
                </div>

                {/* Area */}
                <div className="space-y-2">
                    <Label htmlFor="area">
                        مساحت (متر مربع) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="area"
                        name="area"
                        type="text"
                        value={formatNumberWithSeparator(form.area)}
                        onChange={handleChange}
                        placeholder="مثال: 100"
                        required
                        inputMode="numeric"
                    />
                    <p className="text-xs text-gray-500">قیمت کل به صورت خودکار بر اساس قیمت هر متر مربع پروژه محاسبه می‌شود</p>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading 
                        ? (isEdit ? 'در حال بروزرسانی...' : 'در حال ثبت...') 
                        : (isEdit ? 'بروزرسانی پیش‌فروش' : 'ثبت پیش‌فروش')}
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        انصراف
                    </Button>
                )}
            </div>
        </form>
    );
}

