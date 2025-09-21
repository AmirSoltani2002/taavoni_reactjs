import { useEffect, useState } from "react"
import { Chat, ChatHeader, ChatContent, ChatMessage, ChatInput } from "@/components/ui/chat"
import { useParams } from "react-router-dom"
import type { OtherChat, OtherTicket, SubProjectTicket } from "./columns";
import { getTable, postTable } from "@/general";
import { type User } from "../users/columns";

const TicketNotFound = <div>
      تیکت مورد نظر پیدا نشد
    </div>
export default function ChatPage() {
  const { ticketId, ticketType } = useParams();
  if(!ticketId){
    return TicketNotFound;
  }
  const [ticket, setTicket] = useState<OtherTicket | SubProjectTicket>();
  const [chat, setChat] = useState<OtherChat[]>();
  const [self, setSelf] = useState<User>();
  const [otherGuy, setOtherGuy] = useState<User>();


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
    getTable(`/users/profile`, setSelf);
  }, []);

  useEffect(() => {
    if(!self || !ticket){
      return;
    }
    if(self.type === 'admin') {
      getTable(`/users/${ticket.userId}`, setOtherGuy);
    }
  }, [self, ticket])
  
  const handleSend = async(content: string) => {
    if(!ticket){return};
    const msg = {
      ticketId: ticket.id,
      message: content,
    }
    await postTable(
      ticketType === 'other' 
      ? `other-chats`
      : `subproject-chats`,
      msg,
    );
    await getTable(
      ticketType === 'other' 
      ? `other-tickets/chat/${ticketId}`
      : `sub-project-tickets/chat/${ticketId}`,
      (d) => {
        setTicket(d[0]);
        setChat(d[0]?.chats);
      }
    );
  }

  if(!ticket || !ticket.type || !chat) {
    return TicketNotFound;
  }
  return (
    <Chat>
      <ChatHeader title={ticket?.type} />
      <ChatContent>
        {chat.map((msg, i) => (
          <ChatMessage key={i} 
            sender={otherGuy ? otherGuy.name : 'Admin'}
            content={msg.message || ''}
            dateString={msg.updatedAt || ''}
            isSelf={msg.senderId === self?.id}
            selfName={self?.name || ''}
          />
        ))}
      </ChatContent>
      <ChatInput onSend={handleSend} />
    </Chat>
  )
}
