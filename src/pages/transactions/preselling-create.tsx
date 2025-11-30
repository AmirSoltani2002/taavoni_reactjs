import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTable, getToken } from "@/general";
import { toast } from "sonner";
import { api_base_url } from "@/config";
import { Upload, X } from "lucide-react";
import type { User } from "../users/columns";
import { Checkbox } from "@/components/ui/checkbox";
import { UserSelect } from "@/components/user-select";
import type { PreSelling } from "../preselling/columns";

type PresellingTransactionFormData = {
    amount: number | '';
    bank: string;
    targetBank: string;
    number: string;
    detail: string;
    preSellingId: number | '';
    userId?: number | '';
    isConfirmed?: boolean;
    file: File | null;
};

const initialState: PresellingTransactionFormData = {
    amount: '',
    bank: '',
    targetBank: '',
    number: '',
    detail: '',
    preSellingId: '',
    file: null,
};

interface PresellingTransactionCreateProps {
    onSubmit?: (data: PresellingTransactionFormData) => void;
    onCancel?: () => void;
    userInfo?: User;
}

export default function PresellingTransactionCreate({ onSubmit, onCancel, userInfo }: PresellingTransactionCreateProps) {
    const isAdmin = ['admin', 'system'].includes(userInfo?.type || '');
    const [form, setForm] = useState<PresellingTransactionFormData>(() => ({
        ...initialState,
        isConfirmed: isAdmin ? true : undefined
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
            setForm((prev) => ({ ...prev, preSellingId: '' }));
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
            const numericValue = parseNumberFromFormatted(value);
            setForm((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value ? Number(value) : '' }));
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

        if (!form.preSellingId) {
            toast.error('لطفا پیش‌فروش را انتخاب کنید');
            return;
        }

        // For admin, require userId selection
        if (isAdmin && !form.userId) {
            toast.error('لطفا کاربر را انتخاب کنید');
            return;
        }

        setIsLoading(true);

        try {
            const token = getToken();
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
            if (form.detail) {
                formData.append('detail', form.detail);
            }
            formData.append('preSellingId', form.preSellingId.toString());
            
            if (isAdmin) {
                formData.append('isConfirmed', (form.isConfirmed !== false).toString());
            }

            const response = await fetch(`${api_base_url}/transaction`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if(data && data.id){
                    toast.success('رسید پرداخت با موفقیت ثبت شد');
                    if (onSubmit) {
                        onSubmit(form);
                    }
                    setForm({
                        ...initialState,
                        isConfirmed: isAdmin ? true : undefined
                    });
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
                            setForm((prev) => ({ ...prev, userId: userId || '', preSellingId: '' }));
                        }}
                        label="کاربر"
                        required
                    />
                )}

                {/* PreSelling Selection */}
                <div className="space-y-2">
                    <Label htmlFor="preSellingId">
                        پیش‌فروش <span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="preSellingId"
                        name="preSellingId"
                        value={form.preSellingId}
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
                        مبلغ (تومان) <span className="text-red-500">*</span>
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
                    <select
                        id="bank"
                        name="bank"
                        value={form.bank}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    >
                        <option value="">انتخاب بانک</option>
                        <option value="بانک ملت">بانک ملت</option>
                        <option value="بانک پارسیان">بانک پارسیان</option>
                        <option value="بانک پاسارگاد">بانک پاسارگاد</option>
                        <option value="بانک سپه">بانک سپه</option>
                        <option value="بانک سامان">بانک سامان</option>
                        <option value="بانک اقتصاد نوین">بانک اقتصاد نوین</option>
                        <option value="بانک شهر">بانک شهر</option>
                        <option value="بانک سینا">بانک سینا</option>
                        <option value="بانک دی">بانک دی</option>
                        <option value="بانک مسکن">بانک مسکن</option>
                        <option value="موسسه اعتباری ملل">موسسه اعتباری ملل</option>
                        <option value="بانک قرض الحسنه رسالت">بانک قرض الحسنه رسالت</option>
                        <option value="بانک قرض الحسنه مهر ایران">بانک قرض الحسنه مهر ایران</option>
                        <option value="بانک سرمایه">بانک سرمایه</option>
                        <option value="بانک گردشگری">بانک گردشگری</option>
                        <option value="بانک رفاه کارگران">بانک رفاه کارگران</option>
                        <option value="بانک خاورمیانه">بانک خاورمیانه</option>
                        <option value="بانک کشاورزی ایران">بانک کشاورزی ایران</option>
                        <option value="بانک توسعه تعاون">بانک توسعه تعاون</option>
                    </select>
                </div>

                {/* Target Bank */}
                <div className="space-y-2">
                    <Label htmlFor="targetBank">
                        بانک مقصد <span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="targetBank"
                        name="targetBank"
                        value={form.targetBank}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    >
                        <option value="">انتخاب بانک مقصد</option>
                        <option value="بانک ملت">بانک ملت</option>
                        <option value="بانک پارسیان">بانک پارسیان</option>
                        <option value="بانک پاسارگاد">بانک پاسارگاد</option>
                        <option value="بانک سپه">بانک سپه</option>
                        <option value="بانک سامان">بانک سامان</option>
                        <option value="بانک اقتصاد نوین">بانک اقتصاد نوین</option>
                        <option value="بانک شهر">بانک شهر</option>
                        <option value="بانک سینا">بانک سینا</option>
                        <option value="بانک دی">بانک دی</option>
                        <option value="بانک مسکن">بانک مسکن</option>
                        <option value="موسسه اعتباری ملل">موسسه اعتباری ملل</option>
                        <option value="بانک قرض الحسنه رسالت">بانک قرض الحسنه رسالت</option>
                        <option value="بانک قرض الحسنه مهر ایران">بانک قرض الحسنه مهر ایران</option>
                        <option value="بانک سرمایه">بانک سرمایه</option>
                        <option value="بانک گردشگری">بانک گردشگری</option>
                        <option value="بانک رفاه کارگران">بانک رفاه کارگران</option>
                        <option value="بانک خاورمیانه">بانک خاورمیانه</option>
                        <option value="بانک کشاورزی ایران">بانک کشاورزی ایران</option>
                        <option value="بانک توسعه تعاون">بانک توسعه تعاون</option>
                    </select>
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
                    {!form.file ? (
                        <div className="flex items-center gap-2">
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                                className="cursor-pointer"
                            />
                        </div>
                    ) : (
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
                    {isLoading ? 'در حال ثبت...' : 'ثبت رسید پرداخت'}
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

