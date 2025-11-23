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

export const getColumns = (isAdmin: boolean = false): ColumnDef<SubProjectTicket | OtherTicket>[] => {
    const baseColumns: ColumnDef<SubProjectTicket | OtherTicket>[] = [
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
    ];

    // Add sender column for admins
    if (isAdmin) {
        baseColumns.push({
            header: 'ارسال کننده',
            cell: ({ row }) => {
                const ticket = row.original;
                const sender = ticket.user;
                if (!sender) {
                    return <span className="text-gray-400">نامشخص</span>;
                }
                return (
                    <div className="flex flex-col">
                        <a href={`/users/${sender.id}`} className="font-medium text-blue-600 hover:underline">
                            {sender.name || ''} {sender.lastName || ''}
                        </a>
                    </div>
                );
            }
        });
    }

    baseColumns.push({
        header: 'وضعیت',
        cell: ({ row }) => {
            const ticket = row.original;
            if(ticket.closed){
                return <Badge variant="outline">بسته شده</Badge>
            }
            const recieverIsAdmin = ticket.reciever?.type === 'admin' || ticket.reciever?.type === 'system';
            
            if (isAdmin) {
                // Admin view: show status from admin's perspective
                if (!ticket.recieverRead) {
                    return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">نیاز به بررسی</Badge>
                } else if (!ticket.senderRead) {
                    return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">در انتظار خواندن کاربر</Badge>
                } else {
                    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">خوانده شده</Badge>
                }
            } else {
                // User view: show status from user's perspective
                if (!ticket.senderRead) {
                    return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">پیام جدید</Badge>
                } else if (recieverIsAdmin && !ticket.recieverRead) {
                    return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">در انتظار پاسخ ادمین</Badge>
                } else if (recieverIsAdmin && ticket.recieverRead) {
                    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">پاسخ داده شده</Badge>
                } else {
                    return <Badge variant="outline">باز</Badge>
                }
            }
        }
    });

    return baseColumns;
};

// Keep backward compatibility
export const columns: ColumnDef<SubProjectTicket | OtherTicket>[] = getColumns(false);

