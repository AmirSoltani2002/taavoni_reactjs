import { columns, type User } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable, updateTableRow } from "@/general"
import { useEffect, useState } from "react"
import UserCreate from "./create"
import { PageLoader } from "@/components/ui/loader"

export default function UsersList() {
    const [data, setData] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(false)
    
    useEffect(() => {
        setIsLoading(true);
        getTable('users', (d) => {
            setData(d);
            setIsLoading(false);
        });
    }, [])
    return (
        <div className="container mx-auto py-10">
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
            />
            {isLoading && <PageLoader />}
        </div>
    )
}