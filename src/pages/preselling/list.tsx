import { columns, type PreSelling } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable } from "@/general"
import { useEffect, useState, useMemo } from "react"
import type { User } from "../users/columns"
import { Building, Plus } from "lucide-react"
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
import PreSellingCreate from "./create"
import { Label } from "@/components/ui/label"
import type { Project } from "../projects/columns"
import { UserSelect } from "@/components/user-select"
import type { Transaction } from "../transactions/columns"

export default function PreSellingList() {
    const [data, setData] = useState<PreSelling[]>([])
    const [userInfo, setUserInfo] = useState<User>()
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
    const [projects, setProjects] = useState<Project[]>([])
    const [allUsers, setAllUsers] = useState<User[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])

    useEffect(() => {
        getTable('users/profile', (user) => {
            setUserInfo(user);
            const isAdmin = ['admin', 'system'].includes(user?.type || '');
            
            // Fetch presellings based on user type
            if (isAdmin) {
                // Admin sees all presellings
                getTable('pre-selling', (presellings) => {
                    setData(presellings || []);
                    setIsLoading(false);
                });
                // Fetch projects for admin
                getTable('projects/all/name', (projectsData) => {
                    setProjects(projectsData || []);
                }, false);
                // Fetch all users for admin
                getTable('users', (usersData: User[] | {error?: any}) => {
                    if (usersData && !('error' in usersData)) {
                        setAllUsers(Array.isArray(usersData) ? usersData : []);
                    } else {
                        setAllUsers([]);
                    }
                }, false);
            } else {
                // Regular user sees only their presellings
                getTable('users/pre-selling', (presellings) => {
                    setData(presellings || []);
                    setIsLoading(false);
                });
            }

            // Fetch transactions to calculate paid amounts
            getTable('transaction', (transactionsData: Transaction[] | {error?: any}) => {
                if (transactionsData && !('error' in transactionsData)) {
                    setTransactions(transactionsData as Transaction[] || []);
                } else {
                    setTransactions([]);
                }
            }, false);
        });
    }, [])

    const refreshData = () => {
        const isAdmin = ['admin', 'system'].includes(userInfo?.type || '');
        if (isAdmin) {
            getTable('pre-selling', (presellings) => {
                setData(presellings || []);
            });
        } else {
            getTable('users/pre-selling', (presellings) => {
                setData(presellings || []);
            });
        }
    }

    // Get unique projects from presellings
    const uniqueProjects = useMemo(() => {
        const projectMap = new Map<number, Project>();
        data.forEach(preselling => {
            const project = preselling.project;
            if (project && project.id) {
                projectMap.set(project.id, project);
            }
        });
        return Array.from(projectMap.values());
    }, [data]);

    // Get unique users from presellings
    const uniqueUsers = useMemo(() => {
        const userMap = new Map<number, User>();
        data.forEach(preselling => {
            const user = preselling.user;
            if (user && user.id) {
                userMap.set(user.id, user);
            }
        });
        return Array.from(userMap.values());
    }, [data]);

    // Filter presellings by selected filters
    const filteredData = useMemo(() => {
        let filtered = data;

        // Filter by project
        if (selectedProjectId) {
            filtered = filtered.filter(preselling => {
                const projectId = preselling.project?.id;
                return projectId === selectedProjectId;
            });
        }

        // Filter by user
        if (selectedUserId) {
            filtered = filtered.filter(preselling => {
                return preselling.userId === selectedUserId;
            });
        }

        return filtered;
    }, [data, selectedProjectId, selectedUserId]);

    // Get projects list (use uniqueProjects if admin hasn't loaded projects yet, otherwise use projects)
    const availableProjects = useMemo(() => {
        if (['admin', 'system'].includes(userInfo?.type || '') && projects.length > 0) {
            return projects;
        }
        return uniqueProjects;
    }, [projects, uniqueProjects, userInfo?.type]);

    // Get users list (use uniqueUsers if admin hasn't loaded users yet, otherwise use allUsers)
    const availableUsers = useMemo(() => {
        if (['admin', 'system'].includes(userInfo?.type || '') && allUsers.length > 0) {
            return allUsers;
        }
        return uniqueUsers;
    }, [allUsers, uniqueUsers, userInfo?.type]);

    // Calculate stats for filtered data
    const stats = useMemo(() => {
        // Get unique users/people count
        const uniqueUserIds = new Set<number>();
        filteredData.forEach(preselling => {
            if (preselling.userId) {
                uniqueUserIds.add(preselling.userId);
            }
        });
        const peopleCount = uniqueUserIds.size;

        // Calculate total price of all presellings
        const totalPrice = filteredData.reduce((sum, preselling) => {
            return sum + (preselling.totalPrice || 0);
        }, 0);

        // Calculate total paid (sum of transaction amounts for these presellings)
        const filteredPresellingIds = new Set(filteredData.map(p => p.id).filter((id): id is number => id !== undefined));
        const totalPaid = transactions.reduce((sum, transaction) => {
            // Check if transaction is related to any of the filtered presellings
            // Transactions have presellingId field (even if not in TypeScript type)
            const transactionPresellingId = (transaction as any).presellingId;
            if (transactionPresellingId && filteredPresellingIds.has(transactionPresellingId)) {
                return sum + (transaction.amount || 0);
            }
            return sum;
        }, 0);

        return {
            peopleCount,
            totalPrice,
            totalPaid
        };
    }, [filteredData, transactions]);

    const isAdmin = ['admin', 'system'].includes(userInfo?.type || '');

    // Create edit component wrapper that passes userInfo
    const EditComponent = useMemo(() => {
        return ({ initialValues, onSubmit, isEdit }: { initialValues: any; onSubmit: (values: any) => void; isEdit?: boolean }) => {
            return (
                <PreSellingCreate
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    isEdit={isEdit}
                    userInfo={userInfo}
                />
            );
        };
    }, [userInfo]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto py-8 px-4">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                                <Building className="w-10 h-10 text-blue-600" />
                                پیش‌فروش‌ها
                            </h1>
                            <p className="text-slate-600 text-lg">
                                {isAdmin 
                                    ? 'مشاهده و مدیریت تمام پیش‌فروش‌های موجود در سیستم' 
                                    : 'پیش‌فروش‌های شما'}
                            </p>
                        </div>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="gap-2 shadow-md"
                                    disabled={!isAdmin && !userInfo?.accepted}
                                    title={!isAdmin && !userInfo?.accepted ? 'برای ثبت پیش‌فروش، ابتدا باید حساب کاربری شما تایید شود' : ''}
                                    data-tour="create-preselling-button"
                                >
                                    <Plus className="w-4 h-4" />
                                    ثبت پیش‌فروش جدید
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>ثبت پیش‌فروش جدید</DialogTitle>
                                    <DialogDescription>
                                        اطلاعات پیش‌فروش را وارد کنید
                                    </DialogDescription>
                                </DialogHeader>
                                <PreSellingCreate
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
                    {isAdmin && (
                        <div className="bg-white rounded-xl shadow-sm border p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Project Filter */}
                                {availableProjects.length > 0 && (
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
                                {availableUsers.length > 0 && (
                                    <UserSelect
                                        users={availableUsers}
                                        selectedUserId={selectedUserId}
                                        onUserSelect={(userId) => setSelectedUserId(userId)}
                                        placeholder="همه کاربران"
                                        label="فیلتر بر اساس کاربر"
                                        showAllOption={true}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stats Section */}
                    {filteredData.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">آمار پیش‌فروش‌های فیلتر شده</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                                    <div className="text-sm text-slate-600 mb-1">تعداد افراد</div>
                                    <div className="text-2xl font-bold text-blue-700">
                                        {stats.peopleCount.toLocaleString('fa-IR')}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">نفر در این پروژه‌ها</div>
                                </div>
                                <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100">
                                    <div className="text-sm text-slate-600 mb-1">قیمت کل پیش‌فروش‌ها</div>
                                    <div className="text-2xl font-bold text-green-700">
                                        {stats.totalPrice.toLocaleString('fa-IR')} تومان
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">مجموع قیمت تمام پیش‌فروش‌ها</div>
                                </div>
                                <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                                    <div className="text-sm text-slate-600 mb-1">مبلغ پرداخت شده</div>
                                    <div className="text-2xl font-bold text-purple-700">
                                        {stats.totalPaid.toLocaleString('fa-IR')} تومان
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {stats.totalPrice > 0 
                                            ? `${Math.round((stats.totalPaid / stats.totalPrice) * 100).toLocaleString('fa-IR')}% از کل`
                                            : 'هیچ پرداختی ثبت نشده'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border">
                        <DataTable 
                            columns={columns} 
                            data={filteredData} 
                            tableName="pre-selling"
                            onRefresh={refreshData}
                            editComponent={EditComponent}
                        />
                    </div>
                </div>
                {isLoading && <PageLoader />}
            </div>
        </div>
    )
}

