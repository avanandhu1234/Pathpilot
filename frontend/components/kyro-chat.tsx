"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bot, User, Send, Mic, MicOff, Volume2, VolumeX, Sparkles, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface KyroChatProps {
  className?: string
  variant?: "inline" | "floating"
}

export function KyroChat({ className, variant = "inline" }: KyroChatProps) {
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMinimized, setIsMinimized] = useState(variant === "floating")
  const [speechSupported, setSpeechSupported] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<{
    start(): void
    stop(): void
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: ((e: { results: SpeechRecognitionResultList }) => void) | null
    onend: (() => void) | null
    onerror: (() => void) | null
  } | null>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/kyro" }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setSpeechSupported(!!SpeechRecognition)
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const startListening = () => {
    if (!speechSupported) return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = "en-US"

    recognitionRef.current.onresult = (event: { results: SpeechRecognitionResultList }) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("")
      setInput(transcript)
    }

    recognitionRef.current.onend = () => setIsListening(false)
    recognitionRef.current.onerror = () => setIsListening(false)
    recognitionRef.current.start()
    setIsListening(true)
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      utterance.onend = () => setIsSpeaking(false)
      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  const getMessageText = (message: (typeof messages)[number]) => {
    return (
      message.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("") || ""
    )
  }

  const suggestedQuestions = [
    "How do I prepare for a job interview?",
    "What skills should I develop?",
    "How to negotiate salary?",
    "Tips for career transition?",
  ]

  if (variant === "floating" && isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className={cn(
            "group relative h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl",
            className
          )}
          size="icon"
        >
          <Bot className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
          </span>
        </Button>
      </div>
    )
  }

  const chatContent = (
    <>
      <CardHeader className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                Kyro
                <Sparkles className="h-4 w-4 text-amber-500" />
              </CardTitle>
              <p className="text-xs text-muted-foreground">AI Career Assistant</p>
            </div>
          </div>
          {variant === "floating" && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full min-h-0 p-4">
            <div ref={scrollRef} className="space-y-4 pr-3">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg rounded-tl-none bg-muted p-3">
                    <p className="text-sm">
                      Hi! I&apos;m <span className="font-semibold">Kyro</span>, your AI Career Assistant.
                      I&apos;m here to help you with career guidance, job search strategies, resume tips,
                      interview prep, and more. How can I help you today?
                    </p>
                  </div>
                </div>
                <div className="pl-11">
                  <p className="mb-2 text-xs text-muted-foreground">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question) => (
                      <Badge
                        key={question}
                        variant="outline"
                        className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setInput(question)}
                      >
                        {question}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => {
              const text = getMessageText(message)
              const isUser = message.role === "user"
              return (
                <div key={message.id} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
                  <Avatar className={cn("h-8 w-8 shrink-0", isUser ? "bg-muted" : "bg-primary")}>
                    <AvatarFallback className={cn(isUser ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground")}>
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("group relative max-w-[80%] rounded-lg p-3", isUser ? "rounded-tr-none bg-primary text-primary-foreground" : "rounded-tl-none bg-muted")}>
                    <p className="whitespace-pre-wrap text-sm">{text}</p>
                    {!isUser && text && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-10 top-0 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => (isSpeaking ? stopSpeaking() : speakText(text))}
                      >
                        {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg rounded-tl-none bg-muted p-3">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                  </div>
                </div>
              </div>
            )}
            </div>
          </ScrollArea>
        </div>

        <div className="shrink-0 border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            {speechSupported && (
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className="shrink-0"
                onClick={isListening ? stopListening : startListening}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask Kyro anything..."}
              disabled={isLoading}
              className={cn(isListening && "border-destructive")}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Kyro can make mistakes. Verify important career decisions.
          </p>
        </div>
      </CardContent>
    </>
  )

  if (variant === "floating") {
    return (
      <Card className={cn("fixed bottom-6 right-6 z-50 flex h-[550px] w-[380px] flex-col shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300", "max-h-[calc(100vh-6rem)] max-w-[calc(100vw-3rem)]", className)}>
        {chatContent}
      </Card>
    )
  }

  return <Card className={cn("flex h-[600px] flex-col", className)}>{chatContent}</Card>
}

declare global {
  interface Window {
    SpeechRecognition?: new () => {
      start(): void
      stop(): void
      continuous: boolean
      interimResults: boolean
      lang: string
      onresult: ((e: { results: SpeechRecognitionResultList }) => void) | null
      onend: (() => void) | null
      onerror: (() => void) | null
    }
    webkitSpeechRecognition?: Window["SpeechRecognition"]
  }
}
