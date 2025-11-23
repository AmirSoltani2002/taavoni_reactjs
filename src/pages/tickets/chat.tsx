import { useEffect, useState } from "react"
import { Chat, ChatHeader, ChatContent, ChatMessage, ChatInput } from "@/components/ui/chat"
import { useParams } from "react-router-dom"
import type { OtherChat, OtherTicket, SubProjectTicket } from "./columns";
import { getTable, postTable, updateTableRow } from "@/general";
import { type User } from "../users/columns";
import { PageLoader } from "@/components/ui/loader";

const TicketNotFound = <div>
      تیکت مورد نظر پیدا نشد
    </div>
export default function ChatPage() {
  const { ticketId, ticketType } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [ticket, setTicket] = useState<OtherTicket | SubProjectTicket>();
  const [chat, setChat] = useState<OtherChat[]>();
  const [self, setSelf] = useState<User>();
  const [otherGuy, setOtherGuy] = useState<User>();


  useEffect(() => {
    if(!ticketId){
      return;
    }
    setIsLoading(true);
    getTable(
      ticketType === 'other' 
      ? `other-tickets/chat/${ticketId}`
      : `sub-project-tickets/chat/${ticketId}`,
      (d) => {
        setTicket(d[0]);
        setChat(d[0]?.chats);
        setIsLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    setIsLoading(true);
    getTable(`users/profile`, (d) => {
      setSelf(d);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if(!self || !ticket){
      return;
    }
    if(self.type === 'admin' || self.type === 'system') {
      setIsLoading(true);
      getTable(`users/${ticket.userId}`, (d) => {
        setOtherGuy(d);
        setIsLoading(false);
      });
    }
    
    // Update read status when ticket is opened
    const isSender = self.id === ticket.userId;
    const tableName = ticketType === 'other' ? 'other-tickets' : 'sub-project-tickets';
    
    if (isSender) {
      // If current user is the sender, mark senderRead as true
      if (!ticket.senderRead && ticket.id) {
        updateTableRow(tableName, ticket.id, { senderRead: true });
      }
    } else {
      // If current user is the receiver, mark recieverRead as true
      if (!ticket.recieverRead && ticket.id) {
        updateTableRow(tableName, ticket.id, { recieverRead: true });
      }
    }
  }, [self, ticket, ticketType])
  
  const handleSend = async(content: string) => {
    if(!ticket || !self || !ticketId){return};
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
    
    // Update read status: when someone sends a message, set the other person's read status to false
    const isSender = self.id === ticket.userId;
    const tableName = ticketType === 'other' ? 'other-tickets' : 'sub-project-tickets';
    
    if (isSender && ticket.id) {
      // Sender sent a message, receiver hasn't read it yet
      await updateTableRow(tableName, ticket.id, { recieverRead: false });
    } else if (!isSender && ticket.id) {
      // Receiver sent a message, sender hasn't read it yet
      await updateTableRow(tableName, ticket.id, { senderRead: false });
    }
    
    setIsLoading(true);
    await getTable(
      ticketType === 'other' 
      ? `other-tickets/chat/${ticketId}`
      : `sub-project-tickets/chat/${ticketId}`,
      (d) => {
        setTicket(d[0]);
        setChat(d[0]?.chats);
        setIsLoading(false);
      }
    );
  }

  if(isLoading) {
    return <PageLoader />;
  }
  if(!ticketId || !ticket || !ticket.type || !chat) {
    return TicketNotFound;
  }
  return (
    <Chat>
      <ChatHeader title={ticket?.type} />
      <ChatContent>
        {chat.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">پیام یا سوال خود را بنویسید</div>
        ) : (
          chat.map((msg, i) => (
            <ChatMessage key={i} 
              sender={otherGuy?.name ? otherGuy.name : 'Admin'}
              content={msg.message || ''}
              dateString={msg.updatedAt || ''}
              isSelf={msg.senderId === self?.id}
              selfName={self?.name || ''}
            />
          ))
        )}
      </ChatContent>
      <ChatInput onSend={handleSend} />
    </Chat>
  )
}
