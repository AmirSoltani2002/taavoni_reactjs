import { columns, type User } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable, updateTableRow } from "@/general"
import { useEffect, useState, useMemo } from "react"
import UserCreate from "./create"
import { PageLoader } from "@/components/ui/loader"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

export default function UsersList() {
    const [data, setData] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const navigate = useNavigate();
    const loadUsers = () => {
        setIsLoading(true);
        getTable('users', (d) => {
            if (Array.isArray(d)) {
                setData(d);
                setErrorMessage(null);
            } else {
                setData([]);
                setErrorMessage(d?.error || 'خطایی رخ داده است');
            }
            setIsLoading(false);
        });
    };
    
    useEffect(() => {
        loadUsers();
    }, [])

    // Filter users based on search query (name, lastName, or nationalNumber)
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) {
            return data;
        }
        
        const query = searchQuery.toLowerCase().trim();
        return data.filter((user) => {
            const name = (user.name || "").toLowerCase();
            const lastName = (user.lastName || "").toLowerCase();
            const nationalNumber = (user.nationalNumber || "").toLowerCase();
            const fullName = `${name} ${lastName}`.trim();
            
            return (
                name.includes(query) ||
                lastName.includes(query) ||
                nationalNumber.includes(query) ||
                fullName.includes(query)
            );
        });
    }, [data, searchQuery]);

    return (
        <div className="container mx-auto py-10" data-tour="users-list">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">لیست کاربران</h1>
            </div>
            
            {/* Search Input */}
            <div className="mb-6">
                <Label htmlFor="search" className="text-slate-700 font-semibold mb-2 block">
                    جستجو در کاربران
                </Label>
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                        id="search"
                        type="text"
                        placeholder="جستجو بر اساس نام، نام خانوادگی یا کد ملی..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10 h-12 text-lg bg-white/50 border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                    />
                </div>
                {searchQuery && (
                    <p className="text-sm text-slate-500 mt-2">
                        {filteredData.length} نتیجه یافت شد
                    </p>
                )}
            </div>

            <DataTable 
                columns={columns} 
                data={filteredData} 
                tableName="users" 
                onRefresh={() => {
                    loadUsers();
                }} 
                editComponent={UserCreate}
                options={[
                    {
                        title: 'تایید کاربر',
                        onClick: async(row) => {
                            setIsLoading(true);
                            if(row.id){
                                await updateTableRow(`users`, row.id, {accepted: true}, () => {
                                    loadUsers();
                                })
                            }
                            setIsLoading(false)
                        }
                    }
                ]}
                onClickRow={(row) => row.id && navigate(`/users/${row.id}`)}
                errorMessage={errorMessage}
            />
            {isLoading && <PageLoader />}
        </div>
    )
}