"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, User, Sparkles, Lock, Unlock, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  contextAccess?: {
    allowed: string[]
    requested: string[]
    denied: string[]
  }
}

// Simulated responses based on context access
const simulatedResponses: Record<string, { content: string; contextAccess: Message['contextAccess'] }> = {
  "washing": {
    content: "Based on your preferences for quality-focused and sustainable products, I'd recommend looking at front-loading washing machines from brands like Miele or Bosch. They're more water-efficient and tend to last longer. Given your moderate budget sensitivity, the Bosch 500 series offers excellent value with a 15-year average lifespan.",
    contextAccess: {
      allowed: ["preferences.shopping", "behavioral_patterns"],
      requested: [],
      denied: []
    }
  },
  "news": {
    content: "I'd like to personalize your news feed, but I need permission to access your news preferences. This would help me show you content about technology, science, and economics from your preferred sources.",
    contextAccess: {
      allowed: [],
      requested: ["preferences.news"],
      denied: []
    }
  },
  "recommend": {
    content: "I can see you enjoy documentaries, sci-fi, and thrillers. Have you watched 'Severance' on Apple TV+? It's a psychological thriller with sci-fi elements that's been highly rated. Also, 'The Social Dilemma' documentary might interest you given your concern about privacy in tech.",
    contextAccess: {
      allowed: ["preferences.entertainment"],
      requested: [],
      denied: []
    }
  },
  "default": {
    content: "I'd be happy to help! To give you a more personalized response, could you tell me more about what you're looking for? I can access some of your preferences to tailor my recommendations.",
    contextAccess: {
      allowed: ["behavioral_patterns"],
      requested: [],
      denied: []
    }
  }
}

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("What are the different types of washing machines available?")
  const [isLoading, setIsLoading] = useState(false)
  const [pendingPermissions, setPendingPermissions] = useState<{ messageId: string; keys: string[] }[]>([])

  const getSimulatedResponse = (userMessage: string) => {
    const lower = userMessage.toLowerCase()
    if (lower.includes("washing") || lower.includes("appliance")) {
      return simulatedResponses.washing
    }
    if (lower.includes("news") || lower.includes("article")) {
      return simulatedResponses.news
    }
    if (lower.includes("watch") || lower.includes("movie") || lower.includes("show") || lower.includes("recommend")) {
      return simulatedResponses.recommend
    }
    return simulatedResponses.default
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const response = getSimulatedResponse(userMessage.content)
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.content,
      contextAccess: response.contextAccess,
    }

    setMessages((prev) => [...prev, assistantMessage])

    // If there are requested permissions, add to pending
    if (response.contextAccess?.requested && response.contextAccess.requested.length > 0) {
      setPendingPermissions(prev => [...prev, {
        messageId: assistantMessage.id,
        keys: response.contextAccess!.requested
      }])
    }

    setIsLoading(false)
  }

  const handleApprovePermission = (messageId: string) => {
    setPendingPermissions(prev => prev.filter(p => p.messageId !== messageId))

    // Add a follow-up message showing the permission was granted
    const followUpMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Thanks for granting access! Now I can see you prefer balanced perspectives from varied sources on topics like technology, science, and economics. I'll curate a news digest for you focusing on these areas from reputable primary sources.",
      contextAccess: {
        allowed: ["preferences.news"],
        requested: [],
        denied: []
      }
    }
    setMessages(prev => [...prev, followUpMessage])
  }

  const handleDenyPermission = (messageId: string) => {
    setPendingPermissions(prev => prev.filter(p => p.messageId !== messageId))

    // Update the message to show denied access
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? {
            ...msg,
            contextAccess: {
              ...msg.contextAccess!,
              denied: msg.contextAccess?.requested || [],
              requested: []
            }
          }
        : msg
    ))
  }

  return (
    <div className="flex flex-col h-full p-3 sm:p-4 md:p-6">
      {/* Messages */}
      <ScrollArea className="flex-1 mb-3 sm:mb-4 min-h-0">
        <div className="space-y-3 sm:space-y-4 pr-2 sm:pr-4">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8 sm:py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
              </motion.div>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                Imagine this is your favorite chatbot interface—ChatGPT, Claude, or Gemini
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}>
                      {message.role === "user" ? (
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      ) : (
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      )}
                    </motion.div>
                    <Card
                      className={`px-3 py-2 sm:px-4 sm:py-3 border-0 shadow-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/50 backdrop-blur-sm"
                      }`}>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                      {/* Context Access Display */}
                      {message.role === "assistant" && message.contextAccess && (
                        <div className="mt-3 space-y-2">
                          {/* Allowed Context */}
                          {message.contextAccess.allowed.length > 0 && (
                            <div className="flex items-start gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                              <Unlock className="h-3 w-3 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-green-700 mb-1">Accessing Context</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.contextAccess.allowed.map((key) => (
                                    <Badge key={key} variant="outline" className="text-xs bg-green-500/10 border-green-500/30">
                                      {key}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Permission Requests */}
                          {pendingPermissions.find(p => p.messageId === message.id) && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                            >
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-yellow-700 mb-2">Permission Required</p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  The AI needs access to the following context to provide a personalized response:
                                </p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {pendingPermissions.find(p => p.messageId === message.id)?.keys.map((key) => (
                                    <Badge key={key} variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/30">
                                      {key}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleApprovePermission(message.id)}
                                    size="sm"
                                    className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
                                  >
                                    Allow Access
                                  </Button>
                                  <Button
                                    onClick={() => handleDenyPermission(message.id)}
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 px-3 text-xs"
                                  >
                                    Deny
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Denied Context */}
                          {message.contextAccess.denied.length > 0 && (
                            <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                              <Lock className="h-3 w-3 text-red-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-red-700 mb-1">Access Denied</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.contextAccess.denied.map((key) => (
                                    <Badge key={key} variant="outline" className="text-xs bg-red-500/10 border-red-500/30">
                                      {key}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-muted-foreground animate-pulse" />
                  </div>
                  <Card className="px-4 py-3 bg-card/50 backdrop-blur-sm border-0 shadow-sm">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-sm text-muted-foreground"
                      >
                        Thinking...
                      </motion.div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input */}
      <motion.form
        onSubmit={handleSubmit}
        className="flex gap-2 p-2 sm:p-3 bg-muted/30 rounded-xl backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          disabled={isLoading}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm placeholder:text-muted-foreground/50"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" />
        </Button>
      </motion.form>
    </div>
  )
}
