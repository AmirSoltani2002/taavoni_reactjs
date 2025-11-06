import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTable, getToken } from "@/general";
import { toast } from "sonner";
import type { SubProject } from "../projects/columns";
import { api_base_url } from "@/config";
import { Upload, X } from "lucide-react";
import type { User } from "../users/columns";

type TransactionFormData = {
    amount: number | '';
    bank: string;
    number: string;
    detail: string;
    subProjectId: number | '';
    file: File | null;
};

const initialState: TransactionFormData = {
    amount: '',
    bank: '',
    number: '',
    detail: '',
    subProjectId: '',
    file: null,
};

interface TransactionCreateProps {
    onSubmit?: (data: TransactionFormData) => void;
    onCancel?: () => void;
    userSubProjects?: SubProject[];
    userInfo?: User;
}

export default function TransactionCreate({ onSubmit, onCancel, userSubProjects: initialSubProjects, userInfo }: TransactionCreateProps) {
    const [form, setForm] = useState<TransactionFormData>(initialState);
    const [subProjects, setSubProjects] = useState<SubProject[]>(initialSubProjects || []);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!initialSubProjects) {
            // Fetch user's subProjects
            getTable('subprojects/profile', (data: SubProject[] | { error: { error: string, status: number } }) => {
                if ('error' in data) {
                    console.error('Error loading subProjects:', data.error);
                    toast.error('خطا در بارگذاری واحدها');
                } else {
                    setSubProjects(data as SubProject[]);
                }
            }, false);
        }
    }, [initialSubProjects]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
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
        
        if (!form.file) {
            toast.error('لطفا فایل رسید پرداخت را آپلود کنید');
            return;
        }

        if (!form.amount || form.amount <= 0) {
            toast.error('لطفا مبلغ را وارد کنید');
            return;
        }

        if (!form.bank) {
            toast.error('لطفا نام بانک را وارد کنید');
            return;
        }

        if (!form.number) {
            toast.error('لطفا شماره تراکنش را وارد کنید');
            return;
        }

        if (!form.subProjectId) {
            toast.error('لطفا واحد را انتخاب کنید');
            return;
        }

        setIsLoading(true);

        try {
            const token = getToken();
            const formData = new FormData();
            
            // Append file
            formData.append('file', form.file);
            formData.append('document', form.file.name);
            formData.append('userId', userInfo?.id?.toString() || '');
            // Append other fields
            formData.append('amount', form.amount.toString());
            
            formData.append('bank', form.bank);
            formData.append('number', form.number);
            if (form.detail) {
                formData.append('detail', form.detail);
            }
            formData.append('subProjectId', form.subProjectId.toString());

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
                    setForm(initialState);
                } else {
                    toast.error('خطایی رخ داده است');
                    if (onSubmit) {
                        onSubmit(form);
                    }
                    setForm(initialState);
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

    const getSubProjectLabel = (subProject: SubProject) => {
        const projectName = subProject.block?.project?.name || '';
        const blockName = subProject.block?.name || '';
        const unitNumber = subProject.unitNumber || '';
        return `${projectName}${blockName ? ` - ${blockName}` : ''} - واحد ${unitNumber}`.trim();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {/* SubProject Selection */}
                <div className="space-y-2">
                    <Label htmlFor="subProjectId">
                        واحد <span className="text-red-500">*</span>
                    </Label>
                    <select
                        id="subProjectId"
                        name="subProjectId"
                        value={form.subProjectId}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                    >
                        <option value="">انتخاب واحد</option>
                        {subProjects.map((subProject) => (
                            <option key={subProject.id} value={subProject.id}>
                                {getSubProjectLabel(subProject)}
                            </option>
                        ))}
                    </select>
                    {subProjects.length === 0 && (
                        <p className="text-sm text-gray-500">هیچ واحدی برای شما ثبت نشده است</p>
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
                        type="number"
                        value={form.amount}
                        onChange={handleChange}
                        placeholder="مثال: 1000000"
                        required
                        min="0"
                        step="1000"
                    />
                </div>

                {/* Bank */}
                <div className="space-y-2">
                    <Label htmlFor="bank">
                        بانک <span className="text-red-500">*</span>
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

                {/* File Upload */}
                <div className="space-y-2">
                    <Label htmlFor="file">
                        فایل رسید پرداخت <span className="text-red-500">*</span>
                    </Label>
                    {!form.file ? (
                        <div className="flex items-center gap-2">
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                                required
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

