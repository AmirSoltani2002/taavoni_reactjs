import { type ColumnDef } from "@tanstack/react-table"
import { type User } from "../users/columns"
import { type SubProject } from "../projects/columns"
import { Badge } from "@/components/ui/badge";

export type SubProjectTicket = {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    userId?: number;
    type?: string;
    subProjectId?: number;
    subProject?: SubProject;
    recieverRead?: boolean;
    senderRead?: boolean;
    reciever?: User;
    user?: User;
    closed?: boolean;
}
export type OtherTicket = {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    userId?: number;
    recieverId?: number;
    reciever?: User;
    type?: string;
    recieverRead?: boolean;
    senderRead?: boolean;
    user?: User;
    closed?: boolean;
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
    },
    {
        header: 'وضعیت',
        cell: ({ row }) => {
            const ticket = row.original;
            if(ticket.closed){
                return <Badge variant="outline">بسته شده</Badge>
            }
            console.log({reciever: ticket.reciever});
            const recieverIsAdmin = ticket.reciever?.type === 'admin' || ticket.reciever?.type === 'system';
            if(recieverIsAdmin && !ticket.recieverRead){
                return <Badge variant="outline">در انتظار پاسخ ادمین</Badge>
            } else if(!ticket.senderRead){
                return <Badge variant="outline">در انتظار پاسخ شما</Badge>
            }
            return <Badge variant="outline">باز</Badge>
        }
    }
]

