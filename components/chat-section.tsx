"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

const suggestedQueries = [
  "Tell me the latest tech news",
  "Show me sports headlines",
  "Any breaking news?",
  "Latest science discoveries",
]

export function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi there! I'm your NewsChat assistant. Ask me about any news topic or browse the trending stories. Try asking about 'latest tech news' or 'business headlines today'!",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputValue.trim()
    if (!message || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setError(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          messages: messages.slice(-2),
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to get response")
      }

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm having trouble responding right now. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Chat error:", error)
      let errorMessage = "Unknown error"

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Request timed out. The AI is taking too long to respond."
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)

      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          error.name === "AbortError"
            ? "Sorry, that took too long to process. Please try a shorter question or try again later."
            : "I'm sorry, I'm having trouble responding right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorBotMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col h-full">
      {error && error.includes("GEMINI_API_KEY") && (
        <Alert className="m-6 mb-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>To enable AI chat responses:</strong>
              </p>
              <p className="text-xl">
                Add <code className="bg-muted px-1 rounded">GEMINI_API_KEY=your_key_here</code> to your environment
                variables. Get a free key from{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
                .
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="flex-1 m-6 mb-0 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            News Assistant
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "bot" && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                    <div className="text-lg whitespace-pre-wrap">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                      {message.sender === "bot" && !message.content && isLoading && (
                      <span className="inline-flex items-center gap-1">
                         <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-lg opacity-70">Typing...</span>
                            </span>
                             )}
                            </div>

                  <p className={`text-lg mt-1 opacity-70`}>{formatTime(message.timestamp)}</p>
                </div>

                {message.sender === "user" && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="mb-4">
              <p className="text-lg text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    className="text-lg bg-transparent"
                    onClick={() => handleSendMessage(query)}
                    disabled={isLoading}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Ask me about any news topic..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={() => handleSendMessage()} size="icon" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
