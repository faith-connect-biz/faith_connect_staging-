
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, User, Sparkles, MessageSquare, Clock, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lottie from "lottie-react";
import { Badge } from "@/components/ui/badge";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

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
  serviceType?: string;
  pricing?: string;
}

const ChatPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mock data
  useEffect(() => {
    // Simulate loading chats from an API
    const mockChats: Chat[] = [
      {
        id: "1",
        name: "ABC Painting Services",
        lastMessage: "Thanks for your inquiry!",
        unread: 2,
        serviceType: "Painting Services",
        pricing: "KSH 25,000 - KSH 35,000 per project"
      },
      {
        id: "2",
        name: "XYZ Tech Solutions",
        lastMessage: "When can we schedule a consultation?",
        unread: 0,
        serviceType: "Software Development",
        pricing: "KSH 85,000 - KSH 110,000 per project"
      },
      {
        id: "3",
        name: "123 Cleaning Services",
        lastMessage: "We'd like to schedule a site visit.",
        unread: 1,
        serviceType: "Cleaning Services",
        pricing: "KSH 18,000 - KSH 22,000 per month"
      },
    ];

    setChats(mockChats);
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }

    if (chatListRef.current) {
      gsap.fromTo(chatListRef.current.children,
        { x: -100, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: chatListRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (!activeChat) return;

    // Simulate loading messages from an API
    const mockMessages: Message[] = [
      {
        id: "1",
        content: "Hello! I'm interested in your services.",
        sender: "user",
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        id: "2",
        content: "Hi there! Thanks for reaching out. How can I help you today?",
        sender: "client",
        timestamp: new Date(Date.now() - 3500000) // 58 minutes ago
      },
      {
        id: "3",
        content: "I'd like to know more about your pricing and availability.",
        sender: "user",
        timestamp: new Date(Date.now() - 3000000) // 50 minutes ago
      },
      {
        id: "4",
        content: "Of course! Let me send you our current rates and schedule.",
        sender: "client",
        timestamp: new Date(Date.now() - 2900000) // 48 minutes ago
      },
      {
        id: "5",
        content: "That sounds great. Can you also tell me about your experience with similar projects?",
        sender: "user",
        timestamp: new Date(Date.now() - 2800000) // 47 minutes ago
      },
      {
        id: "6",
        content: "Absolutely! We've completed over 50 similar projects in the last year. Would you like to see some examples?",
        sender: "client",
        timestamp: new Date(Date.now() - 2700000) // 45 minutes ago
      }
    ];

    setMessages(mockMessages);

    // Animate messages entrance
    if (messagesRef.current) {
      gsap.fromTo(messagesRef.current.children,
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.5, 
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [activeChat]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeChat) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate response after 1-2 seconds
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for your message! We'll get back to you soon.",
        sender: "client",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }, 1000 + Math.random() * 1000);

    toast({
      title: "Message sent",
      description: "Your message has been delivered.",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
    
    // Update unread count
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, unread: 0 } : chat
    ));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const messageVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          
          {/* Enhanced Header */}
          <motion.div 
            ref={headerRef}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white px-6 py-3 rounded-full shadow-lg mb-4">
              <Sparkles className="w-5 h-5" />
              <h1 className="text-2xl font-bold">Faith Connect Chat</h1>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-gray-600 max-w-md mx-auto">
              Connect with trusted businesses in our faith community through secure messaging
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chat List */}
            <motion.div 
              ref={chatListRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-1"
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {chats.map((chat) => (
                      <motion.div
                        key={chat.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 cursor-pointer transition-all duration-200 ${
                          activeChat === chat.id
                            ? "bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10 border-l-4 border-fem-terracotta"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleChatSelect(chat.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-fem-navy">{chat.name}</h3>
                              {chat.unread > 0 && (
                                <Badge className="bg-fem-terracotta text-white text-xs">
                                  {chat.unread}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">2 hours ago</span>
                            </div>
                          </div>
                        </div>
                        {chat.serviceType && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {chat.serviceType}
                            </Badge>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Messages Area */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl h-[600px] flex flex-col">
                {activeChat ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          {chats.find(c => c.id === activeChat)?.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                      <div ref={messagesRef} className="space-y-4">
                        <AnimatePresence>
                          {messages.map((message) => (
                            <motion.div
                              key={message.id}
                              variants={messageVariants}
                              initial="hidden"
                              animate="visible"
                              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                  message.sender === "user"
                                    ? "bg-gradient-to-r from-fem-terracotta to-fem-gold text-white"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.sender === "user" ? "text-white/70" : "text-gray-500"
                                }`}>
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </div>
                    </CardContent>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Textarea
                          ref={textareaRef}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 resize-none"
                          rows={2}
                        />
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            type="submit" 
                            className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white px-6"
                            disabled={!newMessage.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </form>
                    </div>
                  </>
                ) : (
                  /* Empty State */
                  <div className="flex-1 flex items-center justify-center">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-center"
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-fem-navy mb-2">Start a Conversation</h3>
                      <p className="text-gray-600 max-w-sm">
                        Select a business from the list to start chatting and get your questions answered.
                      </p>
                    </motion.div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChatPage;
