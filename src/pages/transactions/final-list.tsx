import { getFinalTransactionColumns, getFinalTransactionOptions, type FinalTransaction } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable } from "@/general"
import { useEffect, useState, useMemo } from "react"
import type { User } from "../users/columns"
import { CreditCard, Plus } from "lucide-react"
import { PageLoader } from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import FinalTransactionCreate from "./final-create"
import { Label } from "@/components/ui/label"
import type { SubProject } from "../projects/columns"
import { UserSelect } from "@/components/user-select"

export default function FinalTransactionsList() {
    const [data, setData] = useState<FinalTransaction[]>([])
    const [userInfo, setUserInfo] = useState<User>()
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [selectedSubProjectId, setSelectedSubProjectId] = useState<number | ''>('')
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
    const [selectedTargetBank, setSelectedTargetBank] = useState<string>('')
    const [allUsers, setAllUsers] = useState<User[]>([])

    useEffect(() => {
        getTable('users/profile', (user) => {
            setUserInfo(user);
            const isAdmin = ['admin', 'system'].includes(user?.type || '');
            
            // Fetch transactions based on user type
            if (isAdmin) {
                // Admin sees all transactions
                getTable('final-transaction', (transactions) => {
                    setData(transactions || []);
                    setIsLoading(false);
                });
                // Fetch all users for admin
                getTable('users', (usersData: User[] | {error?: any}) => {
                    if (usersData && !('error' in usersData)) {
                        setAllUsers(Array.isArray(usersData) ? usersData : []);
                    } else {
                        setAllUsers([]);
                    }
                }, false);
            } else {
                // Regular user sees only their transactions
                getTable('final-transaction/profile', (transactions) => {
                    setData(transactions || []);
                    setIsLoading(false);
                });
            }
        });
    }, [])

    const refreshData = () => {
        const isAdmin = ['admin', 'system'].includes(userInfo?.type || '');
        if (isAdmin) {
            getTable('final-transaction', (transactions) => {
                setData(transactions || []);
            });
        } else {
            getTable('final-transaction/profile', (transactions) => {
                setData(transactions || []);
            });
        }
    }

    // Get unique subProjects from transactions
    const uniqueSubProjects = useMemo(() => {
        const subProjectMap = new Map<number, SubProject>();
        data.forEach(transaction => {
            const subProject = transaction.subProject;
            if (subProject && subProject.id) {
                subProjectMap.set(subProject.id, subProject);
            }
        });
        return Array.from(subProjectMap.values());
    }, [data]);

    // Get unique users from transactions
    const uniqueUsers = useMemo(() => {
        const userMap = new Map<number, User>();
        data.forEach(transaction => {
            const user = transaction.user;
            if (user && user.id) {
                userMap.set(user.id, user);
            }
        });
        return Array.from(userMap.values());
    }, [data]);

    // Get unique target banks from transactions
    const uniqueTargetBanks = useMemo(() => {
        const banks = new Set<string>();
        data.forEach(transaction => {
            if (transaction.targetBank) {
                banks.add(transaction.targetBank);
            }
        });
        return Array.from(banks).sort();
    }, [data]);

    // Filter transactions by selected filters
    const filteredData = useMemo(() => {
        let filtered = data;

        // Filter by subProject
        if (selectedSubProjectId) {
            filtered = filtered.filter(transaction => {
                const subProjectId = transaction.subProject?.id;
                return subProjectId === selectedSubProjectId;
            });
        }

        // Filter by user
        if (selectedUserId) {
            filtered = filtered.filter(transaction => {
                return transaction.userId === selectedUserId;
            });
        }

        // Filter by targetBank
        if (selectedTargetBank) {
            filtered = filtered.filter(transaction => {
                return transaction.targetBank === selectedTargetBank;
            });
        }

        return filtered;
    }, [data, selectedSubProjectId, selectedUserId, selectedTargetBank]);

    // Calculate sum of transactions per subProject
    const subProjectSums = useMemo(() => {
        const sums = new Map<number, { subProjectName: string; total: number; count: number }>();
        
        filteredData.forEach(transaction => {
            const subProject = transaction.subProject;
            if (subProject && subProject.id && transaction.amount) {
                const existing = sums.get(subProject.id);
                const block = subProject.block;
                const project = block?.project;
                const subProjectName = project && block 
                    ? `${project.name} - ${block.name} - واحد ${subProject.unitNumber || '-'}`
                    : `واحد ${subProject.unitNumber || '-'}`;
                if (existing) {
                    existing.total += transaction.amount;
                    existing.count += 1;
                } else {
                    sums.set(subProject.id, {
                        subProjectName: subProjectName,
                        total: transaction.amount,
                        count: 1
                    });
                }
            }
        });
        
        return Array.from(sums.values());
    }, [filteredData]);

    // Calculate stats for filtered data
    const stats = useMemo(() => {
        const totalAmount = filteredData.reduce((sum, t) => sum + (t.amount || 0), 0);
        const transactionCount = filteredData.length;
        const averageAmount = transactionCount > 0 ? totalAmount / transactionCount : 0;
        
        return {
            totalAmount,
            transactionCount,
            averageAmount
        };
    }, [filteredData]);

    // Get users list (use uniqueUsers if admin hasn't loaded users yet, otherwise use uniqueUsers from transactions)
    const availableUsers = useMemo(() => {
        if (['admin', 'system'].includes(userInfo?.type || '') && allUsers.length > 0) {
            return allUsers;
        }
        return uniqueUsers;
    }, [allUsers, uniqueUsers, userInfo?.type]);

    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto py-8 px-4">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                                <CreditCard className="w-10 h-10 text-blue-600" />
                                رسیدهای نهایی
                            </h1>
                            <p className="text-slate-600 text-lg">
                                {['admin', 'system'].includes(userInfo?.type || '') 
                                    ? 'مشاهده و مدیریت تمام رسیدهای نهایی در سیستم' 
                                    : 'رسیدهای نهایی شما'}
                            </p>
                        </div>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="gap-2 shadow-md"
                                    disabled={!['admin', 'system'].includes(userInfo?.type || '') && !userInfo?.accepted}
                                    title={!['admin', 'system'].includes(userInfo?.type || '') && !userInfo?.accepted ? 'برای ثبت رسید پرداخت، ابتدا باید حساب کاربری شما تایید شود' : ''}
                                >
                                    <Plus className="w-4 h-4" />
                                    ثبت رسید پرداخت جدید
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>ثبت رسید پرداخت جدید</DialogTitle>
                                    <DialogDescription>
                                        اطلاعات رسید پرداخت خود را وارد کنید
                                    </DialogDescription>
                                </DialogHeader>
                                <FinalTransactionCreate
                                    onSubmit={() => {
                                        setIsCreateDialogOpen(false);
                                        refreshData();
                                    }}
                                    onCancel={() => setIsCreateDialogOpen(false)}
                                    userInfo={userInfo}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* SubProject Filter */}
                            {uniqueSubProjects.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="subProjectFilter">فیلتر بر اساس واحد</Label>
                                    <select
                                        id="subProjectFilter"
                                        value={selectedSubProjectId}
                                        onChange={(e) => setSelectedSubProjectId(e.target.value ? Number(e.target.value) : '')}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">همه واحدها</option>
                                        {uniqueSubProjects.map((subProject) => {
                                            const block = subProject.block;
                                            const project = block?.project;
                                            const label = project && block 
                                                ? `${project.name} - ${block.name} - واحد ${subProject.unitNumber || '-'}`
                                                : `واحد ${subProject.unitNumber || '-'}`;
                                            return (
                                                <option key={subProject.id} value={subProject.id}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            )}

                            {/* User Filter */}
                            {['admin', 'system'].includes(userInfo?.type || '') && availableUsers.length > 0 && (
                                <UserSelect
                                    users={availableUsers}
                                    selectedUserId={selectedUserId}
                                    onUserSelect={(userId) => setSelectedUserId(userId)}
                                    placeholder="همه کاربران"
                                    label="فیلتر بر اساس کاربر"
                                    showAllOption={true}
                                />
                            )}

                            {/* TargetBank Filter */}
                            {uniqueTargetBanks.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="targetBankFilter">فیلتر بر اساس بانک مقصد</Label>
                                    <select
                                        id="targetBankFilter"
                                        value={selectedTargetBank}
                                        onChange={(e) => setSelectedTargetBank(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">همه بانک‌ها</option>
                                        {uniqueTargetBanks.map((bank) => (
                                            <option key={bank} value={bank}>
                                                {bank}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Section */}
                    {filteredData.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">آمار تراکنش‌های فیلتر شده</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                                    <div className="text-sm text-slate-600 mb-1">تعداد تراکنش‌ها</div>
                                    <div className="text-2xl font-bold text-blue-700">
                                        {stats.transactionCount.toLocaleString('fa-IR')}
                                    </div>
                                </div>
                                <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100">
                                    <div className="text-sm text-slate-600 mb-1">مجموع مبلغ پرداختی</div>
                                    <div className="text-2xl font-bold text-green-700">
                                        {stats.totalAmount.toLocaleString('fa-IR')} ریال
                                    </div>
                                </div>
                                <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                                    <div className="text-sm text-slate-600 mb-1">میانگین مبلغ هر تراکنش</div>
                                    <div className="text-2xl font-bold text-purple-700">
                                        {Math.round(stats.averageAmount).toLocaleString('fa-IR')} ریال
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SubProject Sums Summary */}
                    {subProjectSums.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">خلاصه تراکنش‌ها بر اساس واحد</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subProjectSums.map((sum, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                                        <div className="font-semibold text-slate-900 mb-2">{sum.subProjectName}</div>
                                        <div className="text-sm text-slate-600 mb-1">
                                            تعداد تراکنش: {sum.count.toLocaleString('fa-IR')}
                                        </div>
                                        <div className="text-lg font-bold text-blue-700">
                                            مجموع: {sum.total.toLocaleString('fa-IR')} ریال
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border">
                        <DataTable 
                            columns={getFinalTransactionColumns()} 
                            data={filteredData} 
                            tableName="final-transaction"
                            onRefresh={refreshData}
                            options={getFinalTransactionOptions(refreshData, userInfo)}
                        />
                    </div>
                </div>
                {isLoading && <PageLoader />}
            </div>
        </div>
    )
}
