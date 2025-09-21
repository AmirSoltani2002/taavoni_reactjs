import { useEffect, useState } from "react"
import { Chat, ChatHeader, ChatContent, ChatMessage, ChatInput } from "@/components/ui/chat"
import { useParams } from "react-router-dom"
import type { OtherTicket, SubProjectTicket } from "./columns";
import { getTable, postTable } from "@/general";

const TicketNotFound = <div>
      تیکت مورد نظر پیدا نشد
    </div>
export default function ChatPage() {
  const { ticketId, ticketType } = useParams();
  if(!ticketId){
    return TicketNotFound;
  }
  const [ticket, setTicket] = useState<OtherTicket | SubProjectTicket>();
  const [chat, setChat] = useState<any>();

  useEffect(() => {
    getTable(
      ticketType === 'other' 
      ? `other-tickets/chat/${ticketId}`
      : `sub-project-tickets/chat/${ticketId}`,
      (d) => {
        setTicket(d[0]);
        setChat(d[0]?.chats);
      }
    );
  }, []);
  
  useEffect(() => {
    console.log({chat})
  }, [chat])
  
  const [messages, setMessages] = useState([
    { sender: "Admin", content: "سلام! چطور میتونم کمک کنم؟", date: "12:30", isSelf: false },
    { sender: "Me", content: "میخواستم وضعیت پروژه رو بدونم. \n\n آیا cash-flow مناسبی جریان دارد؟", date: "12:31", isSelf: true },
    { sender: "Admin", content: "خوشبختانه طبق آخرین خبر همه چیز طبق برنامه‌ریزی است", date: "15:02", isSelf: false },
  ])

  const handleSend = async(content: string) => {
    if(!ticket){return};
    const msg = {
      ticketId: ticket.id,
      text: content,
    }
    const newMsg = {

      ////
      sender: "Ali",
      content: content,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
    };
    await postTable(
      ticketType === 'other' 
      ? `other-chats`
      : `subproject-chats`,
      msg,
    )
    setMessages([...messages, newMsg])
  }

  if(!ticket || !ticket.type) {
    return TicketNotFound;
  }
  return (
    <Chat>
      <ChatHeader title={ticket?.type} />
      <ChatContent>
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
      </ChatContent>
      <ChatInput onSend={handleSend} />
    </Chat>
  )
}
