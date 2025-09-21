import { type ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// Root wrapper
export function Chat({ children }: { children: ReactNode }) {
  return (
    <Card className="flex flex-col h-[600px] w-full">{children}</Card>
  )
}

// Header
export function ChatHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <h2 className="text-lg font-semibold">{title}</h2>
      {/* Right side actions */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">جستجو</Button>
        <Button variant="ghost" size="sm">بستن</Button>
      </div>
    </div>
  )
}

// Messages container
export function ChatContent({ children }: { children: ReactNode }) {
  return (
    <ScrollArea className="flex-1 p-4 space-y-4 overflow-auto">
      {children}
    </ScrollArea>
  )
}

// Single message
interface ChatMessageProps {
  sender: string
  content: string
  date: string
  isSelf?: boolean
}
export function ChatMessage({ sender, content, date, isSelf }: ChatMessageProps) {
  return (
    <div
      className={`flex items-end gap-2 ${
        !isSelf ? "justify-end" : "justify-start"
      }`}
    >
      {isSelf && (
        <Avatar className="bg-muted">
          <AvatarFallback className="bg-muted">{sender[0]}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`rounded-lg px-3 py-2 max-w-xs text-sm shadow ${
          !isSelf ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        <span className="block text-[10px] opacity-70 mt-1">{date}</span>
      </div>
      {!isSelf && (
        <Avatar className="bg-primary text-primary-foreground">
          <AvatarFallback className="bg-primary text-primary-foreground">{sender[0]}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

// Input bar
export function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const textarea = form.elements.namedItem("message") as HTMLTextAreaElement
    const value = textarea.value.trim()
    if (value) {
      onSend(value)
      textarea.value = ""
    }
  }

  return (
    <form
      onSubmit={handleSend}
      className="flex items-end gap-2 p-2 border-t"
    >
      <Textarea
        name="message"
        placeholder="پیام خود را بنویسید..."
        className="resize-none min-h-[40px] flex-1"
      />
      <Button type="submit">ارسال</Button>
    </form>
  )
}
