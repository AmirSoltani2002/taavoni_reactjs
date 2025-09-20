import { Button } from "@/components/ui/button";
import { columns, type OtherTicket, type SubProjectTicket } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { getTable } from "@/general"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TicketsList() {
    const [otherTickets, setOtherTickets] = useState<OtherTicket[]>([]);
    const [subProjectsTickets, setSubProjectsTickets] = useState<SubProjectTicket[]>([]);
    const [data, setData] = useState<(OtherTicket | SubProjectTicket)[]>([]);
    const [newTicketTitle, setNewTicketTitle] = useState<string | undefined>();
    const navigate = useNavigate();

    useEffect(() => {
        getTable('other-tickets', setOtherTickets);
        getTable('sub-project-tickets', setSubProjectsTickets);
    }, []);
    useEffect(() => {
        setData([
            ...otherTickets,
            ...subProjectsTickets,
        ])
    }, [otherTickets, subProjectsTickets])
    return (
        <div className="container mx-auto py-10">
            <Dialog>
                <DialogTrigger>
                    <Button 
                        variant={'default'} 
                        className="mb-4"
                    >
                        تیکت جدید +
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="text-right sm:text-right">
                        <DialogTitle>
                            لطفا موضوع تیکت خود را بنویسید
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">موضوع</Label>
                            <Input id="title" name="title" value={newTicketTitle} onChange={(e) => setNewTicketTitle(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        {newTicketTitle && <Button onClick={() => {
                            navigate(`/tickets/create?title=${newTicketTitle}`)
                        }}>
                            ایجاد تیکت
                        </Button>}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <DataTable columns={columns} data={data} />
        </div>
    )
}