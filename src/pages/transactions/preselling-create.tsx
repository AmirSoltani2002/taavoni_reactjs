import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTable } from "@/general";
import { toast } from "sonner";
import { api_base_url } from "@/config";
import { Upload, X } from "lucide-react";
import type { User } from "../users/columns";
import { Checkbox } from "@/components/ui/checkbox";
import { UserSelect } from "@/components/user-select";
import type { PreSelling } from "../preselling/columns";
import type { Transaction } from "./columns";
import { Calendar22 } from "@/components/calendars/calendar";

type PresellingTransactionFormData = {
    amount: number | '';
    bank: string;
    targetBank: string;
    number: string;
    detail: string;
    date: string;
    presellingId: number | '';
    userId?: number | '';
    isConfirmed?: boolean;
    file: File | null;
    removeDocument: boolean;
};

const initialState: PresellingTransactionFormData = {
    amount: '',
    bank: '',
    targetBank: '',
    number: '',
    detail: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    presellingId: '',
    file: null,
    removeDocument: false,
};

interface PresellingTransactionCreateProps {
    onSubmit?: (data: PresellingTransactionFormData) => void;
    onCancel?: () => void;
    userInfo?: User;
    initialValues?: Transaction;
    isEdit?: boolean;
}

export default function PresellingTransactionCreate({
    onSubmit,
    onCancel,
    userInfo,
    initialValues,
    isEdit = false,
}: PresellingTransactionCreateProps) {
    const isAdmin = ['admin', 'system'].includes(userInfo?.type || '');
    const [form, setForm] = useState<PresellingTransactionFormData>(() => ({
        ...initialState,
        amount: initialValues?.amount ?? '',
        bank: initialValues?.bank ?? '',
        targetBank: initialValues?.targetBank ?? '',
        number: initialValues?.number ?? '',
        detail: initialValues?.detail ?? '',
        date: initialValues?.date?.split('T')[0] ?? new Date().toISOString().split('T')[0],
        presellingId: initialValues?.presellingId ?? '',
        userId: initialValues?.userId ?? '',
        isConfirmed: initialValues?.isConfirmed ?? (isAdmin ? true : undefined),
    }));
    const [preSellings, setPreSellings] = useState<PreSelling[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingPreSellings, setLoadingPreSellings] = useState(false);

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
        } else {
            // For normal users, fetch their pre-sellings immediately
            loadPreSellings(userInfo?.id);
        }
    }, [isAdmin, userInfo?.id]);

    useEffect(() => {
        // When user changes (admin only), load their pre-sellings
        if (isAdmin && form.userId) {
            loadPreSellings(form.userId);
        } else if (isAdmin && !form.userId) {
            setPreSellings([]);
            setForm((prev) => ({ ...prev, presellingId: '' }));
        }
    }, [form.userId, isAdmin]);

    const loadPreSellings = (userId?: number | '') => {
        if (!userId) {
            setPreSellings([]);
            return;
        }
        setLoadingPreSellings(true);
        const endpoint = isAdmin ? `pre-selling/user/${userId}` : 'users/pre-selling';
        getTable(endpoint, (data: PreSelling[] | { error: { error: string, status: number } }) => {
            if ('error' in data) {
                console.error('Error loading pre-sellings:', data.error);
                setPreSellings([]);
            } else {
                setPreSellings(data as PreSelling[]);
            }
            setLoadingPreSellings(false);
        }, false);
    };

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'amount') {
            // مبلغ: عدد با فرمت جداکننده سه‌رقمی
            const numericValue = parseNumberFromFormatted(value);
            setForm((prev) => ({ ...prev, [name]: numericValue }));
        } else if (name === 'presellingId' || name === 'userId') {
            // شناسه‌ها: عدد
            setForm((prev) => ({ ...prev, [name]: value ? Number(value) : '' }));
        } else {
            // سایر فیلدها مثل bank، targetBank، number، detail: رشته
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm((prev) => ({ ...prev, file }));
        }
    };

    const handleRemoveFile = () => {
        setForm((prev) => ({ ...prev, file: null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.amount || form.amount <= 0) {
            toast.error('لطفا مبلغ را وارد کنید');
            return;
        }

        if (!form.bank) {
            toast.error('لطفا نام بانک را وارد کنید');
            return;
        }

        if (!form.targetBank) {
            toast.error('لطفا بانک مقصد را وارد کنید');
            return;
        }

        if (!form.number) {
            toast.error('لطفا شماره تراکنش را وارد کنید');
            return;
        }

        if (!form.presellingId) {
            toast.error('لطفا پیش‌فروش را انتخاب کنید');
            return;
        }

        if (!form.date) {
            toast.error('لطفا تاریخ پرداخت را وارد کنید');
            return;
        }

        // For admin, require userId selection
        if (isAdmin && !form.userId) {
            toast.error('لطفا کاربر را انتخاب کنید');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            
            if (form.file) {
                formData.append('file', form.file);
            }
            const userId = isAdmin ? form.userId : userInfo?.id;
            formData.append('userId', userId?.toString() || '');
            formData.append('amount', form.amount.toString());
            formData.append('bank', form.bank);
            formData.append('targetBank', form.targetBank);
            formData.append('number', form.number);
            if (form.detail || isEdit) {
                formData.append('detail', form.detail);
            }
            formData.append('presellingId', form.presellingId.toString());
            formData.append('date', form.date);
            
            if (isAdmin) {
                formData.append('isConfirmed', (form.isConfirmed !== false).toString());
            }

            if (isEdit) {
                formData.append('removeDocument', form.removeDocument.toString());
            }

            const response = await fetch(`${api_base_url}/transaction${isEdit ? `/${initialValues?.id}` : ''}`, {
                credentials: 'include',
                method: isEdit ? 'PATCH' : 'POST',
                headers: {
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if(data && data.id){
                    toast.success(isEdit ? 'تراکنش با موفقیت ویرایش شد' : 'رسید پرداخت با موفقیت ثبت شد');
                    if (onSubmit) {
                        onSubmit(form);
                    }
                    if (!isEdit) {
                        setForm({
                            ...initialState,
                            isConfirmed: isAdmin ? true : undefined,
                            date: new Date().toISOString().split('T')[0]
                        });
                    }
                } else {
                    toast.error('خطایی رخ داده است');
                }
            } else {
                const err = await response.json();
                if (err.message) {
                    const errors = typeof err.message === 'object' ? err.message : [err.message];
                    errors.forEach((m: any) => {
                        toast.error(m || 'خطایی رخ داده است');
                    });
                } else {
                    toast.error('خطایی رخ داده است');
                }
            }
        } catch (error: any) {
            console.error('Transaction creation error:', error);
            toast.error('خطا در ثبت رسید پرداخت');
        } finally {
            setIsLoading(false);
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
                            setForm((prev) => ({ ...prev, userId: userId || '', presellingId: '' }));
                        }}
                        label="کاربر"
                        required
                    />
                )}

                {/* PreSelling Selection */}
                <div className="space-y-2">
                    <Label htmlFor="presellingId">
                        پیش‌فروش <span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="presellingId"
                        name="presellingId"
                        value={form.presellingId}
                        onChange={handleChange}
                        disabled={loadingPreSellings || (isAdmin && !form.userId)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    >
                        <option value="">
                            {loadingPreSellings 
                                ? 'در حال بارگذاری...' 
                                : (isAdmin && !form.userId) 
                                    ? 'ابتدا کاربر را انتخاب کنید'
                                    : 'انتخاب پیش‌فروش'}
                        </option>
                        {preSellings.map((preSelling) => {
                            const projectName = preSelling.project?.name || 'بدون پروژه';
                            const area = preSelling.area || 0;
                            return (
                                <option key={preSelling.id} value={preSelling.id}>
                                    {projectName} - {area.toLocaleString('fa-IR')} متر مربع
                                </option>
                            );
                        })}
                    </select>
                    {!loadingPreSellings && preSellings.length === 0 && (isAdmin ? form.userId : true) && (
                        <p className="text-sm text-gray-500">هیچ پیش‌فروشی ثبت نشده است</p>
                    )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                    <Label htmlFor="amount">
                        مبلغ (ریال) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="amount"
                        name="amount"
                        type="text"
                        value={formatNumberWithSeparator(form.amount)}
                        onChange={handleChange}
                        placeholder="مثال: 1,000,000"
                        required
                        inputMode="numeric"
                    />
                </div>

                {/* Bank */}
                <div className="space-y-2">
                    <Label htmlFor="bank">
                        بانک مبدا <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="bank"
                        name="bank"
                        type="text"
                        value={form.bank}
                        onChange={handleChange}
                        placeholder="نام بانک مبدا"
                        required
                    />
                </div>

                {/* Target Bank */}
                <div className="space-y-2">
                    <Label htmlFor="targetBank">
                        بانک مقصد <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="targetBank"
                        name="targetBank"
                        type="text"
                        value={form.targetBank}
                        onChange={handleChange}
                        placeholder="نام بانک مقصد"
                        required
                    />
                </div>

                {/* Transaction Number */}
                <div className="space-y-2">
                    <Label htmlFor="number">
                        شماره تراکنش <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="number"
                        name="number"
                        type="text"
                        value={form.number}
                        onChange={handleChange}
                        placeholder="شماره تراکنش بانکی"
                        required
                    />
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <Label>
                        تاریخ پرداخت <span className="text-red-500">*</span>
                    </Label>
                    <Calendar22
                        title=""
                        date={form.date ? new Date(form.date) : new Date()}
                        setDate={(date) => {
                            // Format date in local timezone to avoid timezone conversion issues
                            const formatDateLocal = (d: Date): string => {
                                const year = d.getFullYear();
                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                const day = String(d.getDate()).padStart(2, '0');
                                return `${year}-${month}-${day}`;
                            };
                            const date2save = date ? formatDateLocal(date) : formatDateLocal(new Date());
                            setForm((prev) => ({
                                ...prev,
                                date: date2save,
                            }));
                        }}
                    />
                </div>

                {/* Detail */}
                <div className="space-y-2">
                    <Label htmlFor="detail">جزئیات (اختیاری)</Label>
                    <textarea
                        id="detail"
                        name="detail"
                        value={form.detail}
                        onChange={handleChange}
                        placeholder="توضیحات اضافی"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={3}
                    />
                </div>

                {/* Is Confirmed Checkbox for Admin */}
                {isAdmin && (
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                            id="isConfirmed"
                            checked={form.isConfirmed !== false}
                            onCheckedChange={(checked) => {
                                setForm((prev) => ({ ...prev, isConfirmed: checked as boolean }));
                            }}
                        />
                        <Label htmlFor="isConfirmed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            تایید شده
                        </Label>
                    </div>
                )}

                {/* File Upload */}
                <div className="space-y-2">
                    <Label htmlFor="file">
                        فایل رسید پرداخت
                    </Label>
                    {isEdit && initialValues?.document && !form.file && !form.removeDocument && (
                        <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                            <Upload className="w-4 h-4 text-gray-600" />
                            <span className="flex-1 text-sm text-gray-700 truncate">{initialValues.document}</span>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => setForm((prev) => ({ ...prev, removeDocument: true }))}
                            >
                                حذف سند
                            </Button>
                        </div>
                    )}
                    {isEdit && initialValues?.document && form.removeDocument && !form.file && (
                        <div className="flex items-center gap-2 p-3 border rounded-md bg-red-50 text-sm text-red-700">
                            <span className="flex-1">سند فعلی حذف خواهد شد.</span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setForm((prev) => ({ ...prev, removeDocument: false }))}
                            >
                                بازگردانی
                            </Button>
                        </div>
                    )}
                    {!form.file && (
                        <div className="flex items-center gap-2">
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                onChange={(event) => {
                                    handleFileChange(event);
                                    setForm((prev) => ({ ...prev, removeDocument: false }));
                                }}
                                accept="image/*,.pdf"
                                className="cursor-pointer"
                            />
                        </div>
                    )}
                    {form.file && (
                        <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                            <Upload className="w-4 h-4 text-gray-600" />
                            <span className="flex-1 text-sm text-gray-700">{form.file.name}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveFile}
                                className="h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    <p className="text-xs text-gray-500">فرمت‌های مجاز: تصویر یا PDF</p>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (isEdit ? 'در حال ذخیره...' : 'در حال ثبت...') : (isEdit ? 'ذخیره تغییرات' : 'ثبت رسید پرداخت')}
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
