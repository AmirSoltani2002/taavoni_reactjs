import { type ColumnDef } from "@tanstack/react-table"

export type SubProjectTicket = {
    id?: number;
    userId?: number;
    type?: string;
    subProjectId?: number;
}
export type OtherTicket = {
    id?: number;
    userId?: number;
    type?: string;
}

export const columns: ColumnDef<SubProjectTicket | OtherTicket>[] = [
    {
        accessorKey: 'userId',
        header: 'کاربر',
    },
    {
        accessorKey: 'type',
        header: 'موضوع'
    }
]

