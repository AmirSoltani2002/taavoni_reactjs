import { getColumns, getTransactionOptions, type Transaction } from "./columns"
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
import TransactionCreate from "./create"
import { Label } from "@/components/ui/label"
import type { Project } from "../projects/columns"

export default function TransactionsList() {
    const [data, setData] = useState<Transaction[]>([])
    const [userInfo, setUserInfo] = useState<User>()
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
    const [selectedIsConfirmed, setSelectedIsConfirmed] = useState<'all' | 'true' | 'false'>('all')
    const [selectedTargetBank, setSelectedTargetBank] = useState<string>('')
    const [projects, setProjects] = useState<Project[]>([])
    const [allUsers, setAllUsers] = useState<User[]>([])

    useEffect(() => {
        getTable('users/profile', (user) => {
            setUserInfo(user);
            const isAdmin = ['admin', 'system'].includes(user?.type || '');
            
            // Fetch transactions based on user type
            if (isAdmin) {
                // Admin sees all transactions
                getTable('transaction', (transactions) => {
                    setData(transactions || []);
                    setIsLoading(false);
                });
                // Fetch projects for admin
                getTable('projects/all', (projectsData) => {
                    setProjects(projectsData || []);
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
                getTable('transaction/profile', (transactions) => {
                    setData(transactions || []);
                    setIsLoading(false);
                });
            }
        });
    }, [])

    const refreshData = () => {
        const isAdmin = ['admin', 'system'].includes(userInfo?.type || '');
        if (isAdmin) {
            getTable('transaction', (transactions) => {
                setData(transactions || []);
            });
        } else {
            getTable('transaction/profile', (transactions) => {
                setData(transactions || []);
            });
        }
    }

    // Get unique projects from transactions
    const uniqueProjects = useMemo(() => {
        const projectMap = new Map<number, Project>();
        data.forEach(transaction => {
            const project = transaction.project;
            if (project && project.id) {
                projectMap.set(project.id, project);
            }
        });
        return Array.from(projectMap.values());
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

        // Filter by project
        if (selectedProjectId) {
            filtered = filtered.filter(transaction => {
                const projectId = transaction.project?.id;
                return projectId === selectedProjectId;
            });
        }

        // Filter by user
        if (selectedUserId) {
            filtered = filtered.filter(transaction => {
                return transaction.userId === selectedUserId;
            });
        }

        // Filter by isConfirmed
        if (selectedIsConfirmed !== 'all') {
            const isConfirmedValue = selectedIsConfirmed === 'true';
            filtered = filtered.filter(transaction => {
                const isConfirmed = transaction.isConfirmed ?? false;
                return isConfirmed === isConfirmedValue;
            });
        }

        // Filter by targetBank
        if (selectedTargetBank) {
            filtered = filtered.filter(transaction => {
                return transaction.targetBank === selectedTargetBank;
            });
        }

        return filtered;
    }, [data, selectedProjectId, selectedUserId, selectedIsConfirmed, selectedTargetBank]);

    // Calculate sum of transactions per project
    const projectSums = useMemo(() => {
        const sums = new Map<number, { projectName: string; total: number; count: number }>();
        
        filteredData.forEach(transaction => {
            const project = transaction.project;
            if (project && project.id && transaction.amount) {
                const existing = sums.get(project.id);
                if (existing) {
                    existing.total += transaction.amount;
                    existing.count += 1;
                } else {
                    sums.set(project.id, {
                        projectName: project.name || 'بدون نام',
                        total: transaction.amount,
                        count: 1
                    });
                }
            }
        });
        
        return Array.from(sums.values());
    }, [filteredData]);

    // Get projects list (use uniqueProjects if admin hasn't loaded projects yet, otherwise use projects)
    const availableProjects = useMemo(() => {
        if (['admin', 'system'].includes(userInfo?.type || '') && projects.length > 0) {
            return projects;
        }
        return uniqueProjects;
    }, [projects, uniqueProjects, userInfo?.type]);

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
                                رسیدهای پرداخت
                            </h1>
                            <p className="text-slate-600 text-lg">
                                {['admin', 'system'].includes(userInfo?.type || '') 
                                    ? 'مشاهده و مدیریت تمام رسیدهای پرداخت در سیستم' 
                                    : 'رسیدهای پرداخت شما'}
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
                                <TransactionCreate
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
                            {/* Project Filter */}
                            {['admin', 'system'].includes(userInfo?.type || '') && availableProjects.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="projectFilter">فیلتر بر اساس پروژه</Label>
                                    <select
                                        id="projectFilter"
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : '')}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">همه پروژه‌ها</option>
                                        {availableProjects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* User Filter */}
                            {['admin', 'system'].includes(userInfo?.type || '') && availableUsers.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="userFilter">فیلتر بر اساس کاربر</Label>
                                    <select
                                        id="userFilter"
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">همه کاربران</option>
                                        {availableUsers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name || ''} {user.lastName || ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* IsConfirmed Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="isConfirmedFilter">فیلتر بر اساس وضعیت تایید</Label>
                                <select
                                    id="isConfirmedFilter"
                                    value={selectedIsConfirmed}
                                    onChange={(e) => setSelectedIsConfirmed(e.target.value as 'all' | 'true' | 'false')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="all">همه</option>
                                    <option value="true">تایید شده</option>
                                    <option value="false">تایید نشده</option>
                                </select>
                            </div>

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

                    {/* Project Sums Summary */}
                    {projectSums.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">خلاصه تراکنش‌ها بر اساس پروژه</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projectSums.map((sum, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                                        <div className="font-semibold text-slate-900 mb-2">{sum.projectName}</div>
                                        <div className="text-sm text-slate-600 mb-1">
                                            تعداد تراکنش: {sum.count.toLocaleString('fa-IR')}
                                        </div>
                                        <div className="text-lg font-bold text-blue-700">
                                            مجموع: {sum.total.toLocaleString('fa-IR')} تومان
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {selectedProjectId && (
                                <div className="mt-4 pt-4 border-t">
                                    <div className="font-semibold text-slate-900">
                                        مجموع تراکنش‌های فیلتر شده: {filteredData.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString('fa-IR')} تومان
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border">
                        <DataTable 
                            columns={getColumns()} 
                            data={filteredData} 
                            tableName="transaction"
                            onRefresh={refreshData}
                            options={getTransactionOptions(refreshData, userInfo)}
                        />
                    </div>
                </div>
                {isLoading && <PageLoader />}
            </div>
        </div>
    )
}

