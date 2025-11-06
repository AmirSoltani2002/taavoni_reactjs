import { columns, type Transaction } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable } from "@/general"
import { useEffect, useState } from "react"
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

export default function TransactionsList() {
    const [data, setData] = useState<Transaction[]>([])
    const [userInfo, setUserInfo] = useState<User>()
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

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
                                <Button className="gap-2 shadow-md">
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
                    <div className="bg-white rounded-xl shadow-sm border">
                        <DataTable 
                            columns={columns} 
                            data={data} 
                            tableName="transaction"
                            onRefresh={refreshData}
                        />
                    </div>
                </div>
                {isLoading && <PageLoader />}
            </div>
        </div>
    )
}

