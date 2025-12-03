import { Button } from "@/components/ui/button";
import { getColumns, type OtherTicket, type SubProjectTicket } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable, postTable, updateTableRow } from "@/general"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MessageSquare, Archive, Lock, Unlock } from "lucide-react"
import { getUserType, type User } from "../users/columns"

const PREDEFINED_TITLES = {
    'account-verification': {
        title: 'تایید حساب کاربری',
        content: 'با سلام و احترام\n\nدرخواست تایید حساب کاربری خود را دارم. لطفاً حساب کاربری من را بررسی و تایید فرمایید.\n\nبا تشکر'
    },
    'purchase-request': {
        title: 'درخواست خرید واحد مسکونی',
        content: 'با سلام و احترام\n\nدرخواست خرید واحد مسکونی دارم. لطفاً واحدهای موجود را بررسی و در صورت امکان، واحد مناسب را به من اختصاص دهید.\n\nبا تشکر'
    },
    'payment-verification': {
        title: 'تایید پرداخت',
        content: 'با سلام و احترام\n\nپرداخت مربوط به واحد مسکونی را انجام داده‌ام. لطفاً پرداخت را بررسی و تایید فرمایید.\n\nبا تشکر'
    },
    'transfer-request': {
        title: 'درخواست واگذاری واحد خریداری شده',
        content: 'با سلام و احترام\n\nدرخواست واگذاری واحد خریداری شده را دارم. لطفاً مراحل واگذاری را بررسی و راهنمایی فرمایید.\n\nبا تشکر'
    },
    'profile-info-change': {
        title: 'درخواست تغییر اطلاعات شخصی',
        content: 'با سلام و احترام\n\nدرخواست تغییر اطلاعات شخصی خود را دارم.\n\nبا تشکر'
    }
} as const;

type PredefinedTitleKey = keyof typeof PREDEFINED_TITLES;

const getAccountVerificationContent = (user: User | undefined): string => {
    if (!user) {
        return PREDEFINED_TITLES['account-verification'].content;
    }
    let content = `با سلام و احترام\n\n
    اینجانب ${user.name} ${user.lastName} با کد ملی ${user.nationalNumber} درخواست تایید حساب کاربری خود را  به عنوان ${getUserType(user.type)} دارم.`
    content += `\n\nبا تشکر`;
    return content;
}

const getPurchaseRequestContent = (user: User | undefined): string => {
    if (!user) {
        return PREDEFINED_TITLES['purchase-request'].content;
    }
    let content = `با سلام و احترام\n\n
    اینجانب ${user.name} ${user.lastName} با کد ملی ${user.nationalNumber} درخواست خرید واحد مسکونی با مشخصات زیر را دارم:\n\n`;
    content += `متراژ: حداقل ... متر مربع\n\n`;
    content += `تعداد خواب: حداقل ... خواب\n\n`;
    content += `قیمت: بین ... تا ... میلیون تومان\n\n`;
    content += `سایر مشخصات: ...\n\n`;
    content += `\n\nبا تشکر`;
    return content;
}

const getPaymentVerificationContent = (user: User | undefined): string => {
    if (!user) {
        return PREDEFINED_TITLES['payment-verification'].content;
    }
    let content = `با سلام و احترام\n\n
    اینجانب ${user.name} ${user.lastName} با کد ملی ${user.nationalNumber} پرداخت مربوط به واحد مسکونی را انجام داده‌ام. لطفاً پرداخت را بررسی و تایید فرمایید.`
    content += `\n\nبا تشکر`;
    return content;
}

const getTransferRequestContent = (user: User | undefined): string => {
    if (!user) {
        return PREDEFINED_TITLES['transfer-request'].content;
    }
    let content = `با سلام و احترام\n\n
    اینجانب ${user.name} ${user.lastName} با کد ملی ${user.nationalNumber} درخواست واگذاری واحد خریداری شده را دارم. لطفاً مراحل واگذاری را بررسی و راهنمایی فرمایید.`
    content += `\n\nبا تشکر`;
    return content;
}

const FIELD_LABELS: Record<string, string> = {
    'name': 'نام',
    'lastName': 'نام خانوادگی',
    'email': 'ایمیل',
    'mobile': 'موبایل',
    'homePhone': 'تلفن منزل',
    'workPhone': 'تلفن محل کار',
    'nationalNumber': 'کد ملی',
    'address': 'آدرس',
    'sex': 'جنسیت',
    'birthDay': 'تاریخ تولد',
    'isargaryPercent': 'درصد ایثارگری',
    'azadeEsaratMonths': 'ماه های اسارت',
    'azadeMonths': 'ماه های آزادگی',
    'shahedFamilyNumber': 'تعداد اعضای خانواده شاهد',
    'shahedRelation': 'ارتباط با ایثارگر'
};

const getProfileInfoChangeContent = (user: User | undefined, selectedFields: string[]): string => {
    if (!user) {
        return PREDEFINED_TITLES['profile-info-change'].content;
    }
    let content = `با سلام و احترام\n\n
    اینجانب ${user.name} ${user.lastName} با کد ملی ${user.nationalNumber} درخواست تغییر اطلاعات پروفایل خود را دارم.\n\n`;
    
    if (selectedFields.length > 0) {
        content += `مواردی که می‌خواهم تغییر دهم:\n\n`;
        selectedFields.forEach((field, index) => {
            content += `${index + 1}. ${FIELD_LABELS[field] || field} جدید: ...\n`;
        });
        content += `\n`;
    } else {
        content += `لطفاً اطلاعات پروفایل من را بررسی و در صورت نیاز تغییر دهید.\n\n`;
    }
    
    content += `با تشکر`;
    return content;
}

const getContentForTitle = (title: PredefinedTitleKey, user: User | undefined, selectedFields?: string[]): string => {
    switch (title) {
        case 'account-verification':
            return getAccountVerificationContent(user);
        case 'purchase-request':
            return getPurchaseRequestContent(user);
        case 'payment-verification':
            return getPaymentVerificationContent(user);
        case 'transfer-request':
            return getTransferRequestContent(user);
        case 'profile-info-change':
            return getProfileInfoChangeContent(user, selectedFields || []);
        default:
            return PREDEFINED_TITLES[title as keyof typeof PREDEFINED_TITLES].content;
    }
}

export default function TicketsList() {
    const [otherTickets, setOtherTickets] = useState<OtherTicket[]>([]);
    const [subProjectsTickets, setSubProjectsTickets] = useState<SubProjectTicket[]>([]);
    const [data, setData] = useState<(OtherTicket | SubProjectTicket)[]>([]);
    const [selectedTitle, setSelectedTitle] = useState<PredefinedTitleKey | 'other' | ''>('');
    const [user, setUser] = useState<User>();
    const [customTitle, setCustomTitle] = useState<string>('');
    const [editedContent, setEditedContent] = useState<string>('');
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'open' | 'archive'>('open');
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    const resetForm = () => {
        setSelectedTitle('');
        setCustomTitle('');
        setEditedContent('');
        setSelectedFields([]);
    };

    const extractErrorMessage = (data: any): string | null => {
        if (!data) return null;
        
        // Check if it's an error response
        if ('statusCode' in data || 'error' in data) {
            // Try to get message first (from API response)
            if (data.message && typeof data.message === 'string') {
                return data.message;
            }
            // Try to get error (from getTable wrapper)
            if (data.error) {
                const errorValue = data.error;
                if (typeof errorValue === 'string') {
                    return errorValue;
                }
                // If error is an object, try to stringify it safely
                if (typeof errorValue === 'object') {
                    return errorValue.message || JSON.stringify(errorValue);
                }
            }
            return 'خطا در بارگذاری تیکت‌ها';
        }
        return null;
    };

    const refreshTickets = () => {
        const isOpen = activeTab === 'open';
        const queryParam = `?open=${isOpen}`;
        
        getTable(`other-tickets/profile${queryParam}`, (ticketsData: OtherTicket[] | {error?: any, statusCode?: number, message?: string, status?: number}) => {
            if (ticketsData && !('error' in ticketsData) && !('statusCode' in ticketsData)) {
                setOtherTickets(Array.isArray(ticketsData) ? ticketsData : []);
            } else {
                setOtherTickets([]);
                const errorMsg = extractErrorMessage(ticketsData);
                if (errorMsg) {
                    setErrorMessage((prev) => prev || errorMsg);
                }
            }
        }, false);
        
        getTable(`sub-project-tickets/profile${queryParam}`, (ticketsData: SubProjectTicket[] | {error?: any, statusCode?: number, message?: string, status?: number}) => {
            if (ticketsData && !('error' in ticketsData) && !('statusCode' in ticketsData)) {
                setSubProjectsTickets(Array.isArray(ticketsData) ? ticketsData : []);
            } else {
                setSubProjectsTickets([]);
                const errorMsg = extractErrorMessage(ticketsData);
                if (errorMsg) {
                    setErrorMessage((prev) => prev || errorMsg);
                }
            }
        }, false);
    };

    useEffect(() => {
        getTable('users/profile', (userData: User | {error?: any, statusCode?: number, message?: string}) => {
            if (userData && !('error' in userData) && !('statusCode' in userData)) {
                const user = userData as User;
                setUser(user);
                setIsAdmin(['admin', 'system'].includes(user?.type || ''));
            } else {
                setUser(undefined);
                setIsAdmin(false);
            }
        }, false);
    }, []);

    useEffect(() => {
        refreshTickets();
    }, [activeTab]);
    
    useEffect(() => {
        const allTickets = [
            ...otherTickets,
            ...subProjectsTickets,
        ];
        
        // Sort tickets: prioritize ones that need to be read
        const sortedTickets = [...allTickets].sort((a, b) => {
            // Closed tickets go to the bottom
            if (a.closed !== b.closed) {
                return a.closed ? 1 : -1;
            }
            
            // Calculate priority score (higher = more urgent)
            const getPriority = (ticket: OtherTicket | SubProjectTicket): number => {
                if (ticket.closed) return 0;
                
                const recieverIsAdmin = ticket.reciever?.type === 'admin' || ticket.reciever?.type === 'system';
                
                if (isAdmin) {
                    // Admin view: prioritize tickets that need admin review
                    if (!ticket.recieverRead) return 3; // Needs review - highest priority
                    if (!ticket.senderRead) return 2; // Waiting for user to read
                    return 1; // Both read
                } else {
                    // User view: prioritize new messages for user
                    if (!ticket.senderRead) return 3; // New message - highest priority
                    if (recieverIsAdmin && !ticket.recieverRead) return 2; // Waiting for admin response
                    return 1; // Others
                }
            };
            
            const priorityA = getPriority(a);
            const priorityB = getPriority(b);
            
            // Sort by priority (descending), then by updatedAt (most recent first)
            if (priorityA !== priorityB) {
                return priorityB - priorityA;
            }
            
            // If same priority, sort by most recently updated
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return dateB - dateA;
        });
        
        setData(sortedTickets);
        // Clear error message if we have data
        if (otherTickets.length > 0 || subProjectsTickets.length > 0) {
            setErrorMessage(null);
        }
    }, [otherTickets, subProjectsTickets, isAdmin])

    const handleToggleClosed = async (ticket: OtherTicket | SubProjectTicket) => {
        if (!ticket.id) return;
        
        // Determine table name based on ticket type
        const tableName = (ticket.type === 'buy' || ticket.type === 'sell') 
            ? 'sub-project-tickets' 
            : 'other-tickets';
        
        const newClosedStatus = !ticket.closed;
        
        await updateTableRow(tableName, ticket.id, { closed: newClosedStatus }, () => {
            refreshTickets();
        });
    };
    return (
        <div className="container mx-auto py-10 px-4" data-tour="tickets-page">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'open' | 'archive')} className="w-full">
                <div className="border-b border-gray-200 mb-6">
                    <TabsList className="w-full h-auto bg-transparent p-0 gap-0 inline-flex flex-wrap">
                        <TabsTrigger 
                            value="open" 
                            className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span>تیکت‌های باز</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="archive" 
                            className="gap-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:bg-gray-50/50 transition-colors"
                        >
                            <Archive className="h-4 w-4" />
                            <span>آرشیو</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="open" className="mt-0">
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                    resetForm();
                }
            }}>
                <DialogTrigger asChild>
                    <Button 
                        variant={'default'} 
                        className="mb-4"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        تیکت جدید +
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="text-right sm:text-right">
                        <DialogTitle>
                            لطفا موضوع تیکت خود را انتخاب کنید
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="title-select">موضوع</Label>
                            <Select 
                                value={selectedTitle} 
                                onValueChange={(value) => {
                                    setSelectedTitle(value as PredefinedTitleKey | 'other');
                                    setEditedContent(''); // Reset edited content when title changes
                                    setSelectedFields([]); // Reset selected fields when title changes
                                    if (value !== 'other') {
                                        setCustomTitle('');
                                    }
                                }}
                            >
                                <SelectTrigger id="title-select" className="h-12">
                                    <SelectValue placeholder="انتخاب موضوع" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(PREDEFINED_TITLES).map(([key, item]) => {
                                        // Only show profile-info-change if user is accepted
                                        if (key === 'profile-info-change' && !user?.accepted) {
                                            return null;
                                        }
                                        return (
                                            <SelectItem key={key} value={key}>
                                                {item.title}
                                            </SelectItem>
                                        );
                                    })}
                                    <SelectItem value="other">سایر</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedTitle === 'other' && (
                            <div className="grid gap-3">
                                <Label htmlFor="custom-title">موضوع دلخواه</Label>
                                <Input 
                                    id="custom-title" 
                                    name="custom-title" 
                                    value={customTitle} 
                                    onChange={(e) => setCustomTitle(e.target.value)}
                                    placeholder="موضوع تیکت خود را بنویسید"
                                />
                            </div>
                        )}

                        {selectedTitle === 'profile-info-change' && (
                            <div className="grid gap-3">
                                <Label>فیلدهایی که می‌خواهید تغییر دهید (می‌توانید چند مورد را انتخاب کنید)</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border rounded-lg bg-slate-50 max-h-[300px] overflow-y-auto">
                                    {Object.entries(FIELD_LABELS).map(([key, label]) => (
                                        <div key={key} className="flex items-center space-x-2 space-x-reverse">
                                            <Checkbox
                                                id={`field-${key}`}
                                                checked={selectedFields.includes(key)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedFields([...selectedFields, key]);
                                                    } else {
                                                        setSelectedFields(selectedFields.filter(f => f !== key));
                                                    }
                                                    // Reset edited content when fields change
                                                    setEditedContent('');
                                                }}
                                            />
                                            <label
                                                htmlFor={`field-${key}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedTitle && selectedTitle !== 'other' && selectedTitle in PREDEFINED_TITLES && (
                            <div className="grid gap-3">
                                <Label htmlFor="predefined-content">محتوای پیشنهادی</Label>
                                <Textarea 
                                    id="predefined-content"
                                    value={
                                        editedContent || getContentForTitle(
                                            selectedTitle as PredefinedTitleKey, 
                                            user,
                                            selectedTitle === 'profile-info-change' ? selectedFields : undefined
                                        )
                                    }
                                    onChange={(e) => {
                                        setEditedContent(e.target.value);
                                    }}
                                    className="min-h-[120px] bg-slate-50"
                                />
                                <p className="text-xs text-gray-500">این محتوا به عنوان اولین پیام در تیکت ارسال خواهد شد</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        {((selectedTitle && selectedTitle !== 'other' && selectedTitle in PREDEFINED_TITLES) || 
                          (selectedTitle === 'other' && customTitle.trim())) && (
                            <Button onClick={async() => {
                                if(!user){
                                    return;
                                }
                                const title = selectedTitle !== 'other' && selectedTitle in PREDEFINED_TITLES
                                    ? PREDEFINED_TITLES[selectedTitle as PredefinedTitleKey].title
                                    : customTitle.trim();
                                
                                const newTicket = await postTable('other-tickets', {
                                    type: title,
                                    userId: user.id,
                                });
                                
                                if(newTicket && newTicket.id) {
                                    // If predefined title is selected, send the predefined content as first message
                                    if (selectedTitle !== 'other' && selectedTitle in PREDEFINED_TITLES) {
                                        const predefinedContent = getContentForTitle(
                                            selectedTitle as PredefinedTitleKey, 
                                            user,
                                            selectedTitle === 'profile-info-change' ? selectedFields : undefined
                                        );
                                        
                                        // Use edited content if available, otherwise use predefined content
                                        const finalContent = editedContent || predefinedContent;
                                        
                                        await postTable('other-chats', {
                                            ticketId: newTicket.id,
                                            message: finalContent,
                                        });
                                    }
                                    
                                    // Reset form and close dialog
                                    resetForm();
                                    setIsDialogOpen(false);
                                    
                                    navigate(`/tickets/other/${newTicket.id}`);
                                }
                            }}>
                                ایجاد تیکت
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
                    </Dialog>
                    <DataTable 
                        columns={getColumns(isAdmin)} 
                        data={data} 
                        errorMessage={errorMessage}
                        onRefresh={refreshTickets}
                        options={(row) => [
                            {
                                title: (
                                    <div className="flex items-center gap-2">
                                        {row.closed ? (
                                            <>
                                                <Unlock className="h-4 w-4" />
                                                <span>باز کردن تیکت</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-4 w-4" />
                                                <span>بستن تیکت</span>
                                            </>
                                        )}
                                    </div>
                                ),
                                onClick: () => handleToggleClosed(row)
                            }
                        ]}
                        onClickRow={(row) => {
                            if(row.id){
                                navigate(`/tickets/${
                                    row.type === 'buy' || row.type === 'sell' ? 'subproject' : 'other'
                                }/${row.id}`)
                            }
                        }} 
                    />
                </TabsContent>

                <TabsContent value="archive" className="mt-0">
                    <DataTable 
                        columns={getColumns(isAdmin)} 
                        data={data} 
                        errorMessage={errorMessage}
                        onRefresh={refreshTickets}
                        options={(row) => [
                            {
                                title: (
                                    <div className="flex items-center gap-2">
                                        {row.closed ? (
                                            <>
                                                <Unlock className="h-4 w-4" />
                                                <span>باز کردن تیکت</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-4 w-4" />
                                                <span>بستن تیکت</span>
                                            </>
                                        )}
                                    </div>
                                ),
                                onClick: () => handleToggleClosed(row)
                            }
                        ]}
                        onClickRow={(row) => {
                            if(row.id){
                                navigate(`/tickets/${
                                    row.type === 'buy' || row.type === 'sell' ? 'subproject' : 'other'
                                }/${row.id}`)
                            }
                        }} 
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}