import { useState } from "react"
import { Chat, ChatHeader, ChatContent, ChatMessage, ChatInput } from "@/components/ui/chat"

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: "Admin", content: "سلام! چطور میتونم کمک کنم؟", date: "12:30", isSelf: false },
    { sender: "Me", content: "میخواستم وضعیت پروژه رو بدونم. چند روزه علاف نشستیم.\n\n دور زمونه بدی شده لامصب", date: "12:31", isSelf: true },
  ])

  const handleSend = (msg: string) => {
    const newMsg = {
      sender: "Ali",
      content: msg,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
    }
    setMessages([...messages, newMsg])
  }

  return (
    <Chat>
      <ChatHeader title="پشتیبانی پروژه‌ها" />
      <ChatContent>
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
      </ChatContent>
      <ChatInput onSend={handleSend} />
    </Chat>
  )
}
