import { type ColumnDef } from "@tanstack/react-table"

export type SubProjectTicket = {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    userId?: number;
    type?: string;
    subProjectId?: number;
}
export type OtherTicket = {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    userId?: number;
    recieverId?: number;
    type?: string;
}

export type OtherChat = {
    id?: number,
    createdAt?: string;
    updatedAt?: string;
    message?: string;
    senderId?: number;
    ticketId?: number;
}

export const columns: ColumnDef<SubProjectTicket | OtherTicket>[] = [
    {
        accessorKey: 'userId',
        header: 'کاربر',
    },
    {
        accessorKey: 'type',
        header: 'موضوع'
    },
    {
        accessorFn: (row) => {
            if(!row.createdAt){
                return 'نامشخص'
            }
            const d = new Date(row.createdAt);
            return d.toLocaleDateString('fa-IR')
        },
        header: 'تاریخ ایجاد'
    }
]

