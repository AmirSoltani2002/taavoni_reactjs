import { columns, type User } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable } from "@/general"
import { useEffect, useState } from "react"
import UserCreate from "./create"


export default function UsersList() {
    const [data, setData] = useState<User[]>([])
    
    useEffect(() => {
        getTable('users', setData);
    }, [])
    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} tableName="users" onRefresh={() => {
                getTable('users', setData);
            }} 
            editComponent={UserCreate}
            />
        </div>
    )
}