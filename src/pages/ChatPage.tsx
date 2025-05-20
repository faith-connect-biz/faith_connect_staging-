
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for our messages
interface Message {
  id: string;
  content: string;
  sender: "user" | "client";
  timestamp: Date;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  unread: number;
  jobTitle?: string;
  salary?: string;
}

const ChatPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Mock data
  useEffect(() => {
    // Simulate loading chats from an API
    const mockChats: Chat[] = [
      {
        id: "1",
        name: "ABC Company",
        lastMessage: "Thanks for your application!",
        unread: 2,
        jobTitle: "Senior Painter",
        salary: "KSH 25,000 - KSH 35,000 per month"
      },
      {
        id: "2",
        name: "XYZ Corporation",
        lastMessage: "When can you start?",
        unread: 0,
        jobTitle: "Software Engineer",
        salary: "KSH 85,000 - KSH 110,000 per month"
      },
      {
        id: "3",
        name: "123 Enterprises",
        lastMessage: "We'd like to schedule an interview.",
        unread: 1,
        jobTitle: "Administrative Assistant",
        salary: "KSH 18,000 - KSH 22,000 per month"
      },
    ];

    setChats(mockChats);
  }, []);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (!activeChat) return;

    // Simulate loading messages from an API
    const mockMessages: Message[] = [
      {
        id: "m1",
        content: "Hello! Thanks for your interest in our position.",
        sender: "client",
        timestamp: new Date(Date.now() - 50000000),
      },
      {
        id: "m2",
        content: "I'm very interested in the role. When can we discuss more details?",
        sender: "user",
        timestamp: new Date(Date.now() - 40000000),
      },
      {
        id: "m3",
        content: "Would you be available for an interview next week?",
        sender: "client",
        timestamp: new Date(Date.now() - 30000000),
      },
      {
        id: "m4",
        content: "Yes, I'm available on Tuesday afternoon or Thursday morning.",
        sender: "user",
        timestamp: new Date(Date.now() - 20000000),
      },
      {
        id: "m5",
        content: "Great! Let's schedule for Tuesday at 2 PM. The job offers KSH 85,000 - KSH 110,000 per month depending on experience.",
        sender: "client",
        timestamp: new Date(Date.now() - 10000000),
      },
    ];

    setMessages(mockMessages);

    // Mark messages as read
    setChats(chats.map(chat => 
      chat.id === activeChat ? { ...chat, unread: 0 } : chat
    ));
    
    // Focus the input field when a chat is selected
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, [activeChat]);

  // Scroll to bottom when new messages come in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeChat) return;
    
    // Add new message to the conversation
    const newMsg: Message = {
      id: `new-${Date.now()}`,
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
    
    // Update the last message in the chat list
    setChats(chats.map(chat => 
      chat.id === activeChat 
        ? { ...chat, lastMessage: newMessage } 
        : chat
    ));
    
    // Focus back on the input
    textareaRef.current?.focus();
    
    // Simulate response (in a real app, this would come from a WebSocket or similar)
    setTimeout(() => {
      const response: Message = {
        id: `resp-${Date.now()}`,
        content: "Thanks for your message! I'll get back to you soon.",
        sender: "client",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, response]);
      
      toast({
        title: "New message",
        description: "You've received a new message",
      });
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-6 flex-grow">
        <h1 className="text-2xl font-bold mb-6 text-fem-navy">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-300px)]">
          {/* Chat list */}
          <Card className="md:col-span-1 overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <div className="overflow-y-auto h-[calc(100%-70px)]">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-100 flex items-start ${
                    activeChat === chat.id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className="bg-fem-navy text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{chat.name}</h3>
                      {chat.unread > 0 && (
                        <span className="bg-fem-terracotta text-white text-xs rounded-full px-2 py-1 ml-2">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-fem-terracotta">{chat.jobTitle}</p>
                    {chat.salary && (
                      <p className="text-xs text-gray-600">{chat.salary}</p>
                    )}
                    <p className="text-sm text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Chat window */}
          <Card className="md:col-span-3 flex flex-col">
            {activeChat ? (
              <>
                <CardHeader className="p-4 border-b">
                  <CardTitle>
                    {chats.find((chat) => chat.id === activeChat)?.name || "Chat"}
                  </CardTitle>
                  {chats.find((chat) => chat.id === activeChat)?.jobTitle && (
                    <p className="text-sm text-gray-600">
                      {chats.find((chat) => chat.id === activeChat)?.jobTitle} - {chats.find((chat) => chat.id === activeChat)?.salary}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-grow p-0 overflow-hidden flex flex-col">
                  <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender === "user"
                              ? "bg-fem-terracotta text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 text-right ${
                            message.sender === "user" ? "text-white/70" : "text-gray-500"
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-grow resize-none min-h-[50px] max-h-[150px]"
                      ref={textareaRef}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (newMessage.trim()) {
                            handleSendMessage(e);
                          }
                        }
                      }}
                    />
                    <Button 
                      type="submit" 
                      variant="default" 
                      className="bg-fem-terracotta hover:bg-fem-terracotta/90 self-end h-[50px]"
                      disabled={!newMessage.trim() || !activeChat}
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center flex-col p-6 text-center text-gray-500">
                <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-1">No conversation selected</h3>
                <p className="text-sm">Choose a conversation from the list to start chatting</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChatPage;
