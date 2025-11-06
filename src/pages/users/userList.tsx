import { columns, type User } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable, updateTableRow } from "@/general"
import { useEffect, useState } from "react"
import UserCreate from "./create"
import { PageLoader } from "@/components/ui/loader"
import { useNavigate } from "react-router-dom"

export default function UsersList() {
    const [data, setData] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    
    useEffect(() => {
        setIsLoading(true);
        getTable('users', (d) => {
            setData(d);
            setIsLoading(false);
        });
    }, [])
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">لیست کاربران</h1>
            <DataTable columns={columns} data={data} tableName="users" onRefresh={() => {
                getTable('users', setData);
            }} 
            editComponent={UserCreate}
            options={[
                {
                    title: 'تایید کاربر',
                    onClick: async(row) => {
                        setIsLoading(true);
                        if(row.id){
                            await updateTableRow(`users`, row.id, {accepted: true}, () => {
                                getTable('users', setData);
                            })
                        }
                        setIsLoading(false)
                    }
                }
            ]}
            onClickRow={(row) => row.id && navigate(`/users/${row.id}`)}
            />
            {isLoading && <PageLoader />}
        </div>
    )
}