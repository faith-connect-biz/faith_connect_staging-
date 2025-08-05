
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Clock,
  MessageSquare,
  Building2,
  ArrowLeft,
  User,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface Message {
  id: string;
  content: string;
  sender: "user" | "business";
  timestamp: Date;
}

interface Chat {
  id: string;
  businessId: string;
  businessName: string;
  businessImage?: string;
  lastMessage: string;
  unread: number;
  serviceType?: string;
  pricing?: string;
}

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const { businesses, isLoading } = useBusiness();
  const { user } = useAuth();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chats from businesses
  useEffect(() => {
    if (isLoading || !Array.isArray(businesses) || !businesses.length) return;

    // Create chat conversations from businesses
    const businessChats: Chat[] = businesses.slice(0, 5).map((business, index) => ({
      id: `chat-${business.id}`,
      businessId: business.id,
      businessName: business.business_name,
      businessImage: business.business_image_url || business.business_logo_url,
      lastMessage: getRandomLastMessage(),
      unread: Math.floor(Math.random() * 3), // Random unread count
      serviceType: business.category?.name,
      pricing: getRandomPricing()
    }));

    setChats(businessChats);
    setIsLoadingChats(false);

    // Set active chat if business ID is in URL params
    const businessId = searchParams.get('business');
    if (businessId) {
      const chat = businessChats.find(c => c.businessId === businessId);
      if (chat) {
        setActiveChat(chat);
      }
    }
  }, [businesses, isLoading, searchParams]);

  const getRandomLastMessage = () => {
    const messages = [
      "Thanks for your inquiry!",
      "When can we schedule a consultation?",
      "We'd like to schedule a site visit.",
      "Here are our current rates and availability.",
      "Looking forward to working with you!",
      "Can you provide more details about your project?",
      "We have availability next week.",
      "Thank you for choosing our services."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getRandomPricing = () => {
    const pricingRanges = [
      "KSH 25,000 - KSH 35,000 per project",
      "KSH 85,000 - KSH 110,000 per project", 
      "KSH 18,000 - KSH 22,000 per month",
      "KSH 5,000 - KSH 15,000 per service",
      "KSH 50,000 - KSH 75,000 per project",
      "Contact for custom pricing"
    ];
    return pricingRanges[Math.floor(Math.random() * pricingRanges.length)];
  };

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
  }, [chats]);

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
        sender: "business",
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
        sender: "business",
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
        content: "Absolutely! We've completed over 50 similar projects in the past year. Would you like to see some examples?",
        sender: "business",
        timestamp: new Date(Date.now() - 2700000) // 45 minutes ago
      }
    ];

    setMessages(mockMessages);
  }, [activeChat]);

  // Scroll to bottom when new messages arrive
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

    // Simulate business response
    setTimeout(() => {
      const responses = [
        "Thanks for your message! We'll get back to you soon.",
        "Great question! Let me check our availability.",
        "I'll send you a detailed quote shortly.",
        "We'd be happy to help with that!",
        "Let me gather some information for you."
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: "business",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat);
    // Mark as read
    setChats(prev => prev.map(c => 
      c.id === chat.id ? { ...c, unread: 0 } : c
    ));
  };

  const filteredChats = chats.filter(chat =>
    chat.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || isLoadingChats) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Skeleton className="h-12 w-full mb-4" />
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2">
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
            className="mb-8"
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white px-6 py-3 rounded-full shadow-lg mb-4">
                <MessageSquare className="w-5 h-5" />
                <h1 className="text-2xl font-bold">Business Chat</h1>
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Connect directly with business owners and service providers in our community. 
                Get instant responses to your inquiries and quotes.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chat List */}
            <div className="lg:col-span-1">
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search businesses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Chat List */}
                  <div ref={chatListRef} className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredChats.map((chat) => (
                      <motion.div
                        key={chat.id}
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div
                          onClick={() => handleChatSelect(chat)}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            activeChat?.id === chat.id
                              ? 'bg-gradient-to-r from-fem-terracotta to-fem-gold text-white'
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={chat.businessImage} />
                              <AvatarFallback className="bg-fem-terracotta text-white">
                                <Building2 className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className={`font-semibold truncate ${
                                  activeChat?.id === chat.id ? 'text-white' : 'text-fem-navy'
                                }`}>
                                  {chat.businessName}
                                </h3>
                                {chat.unread > 0 && (
                                  <Badge className="bg-red-500 text-white text-xs">
                                    {chat.unread}
                                  </Badge>
                                )}
                              </div>
                              <p className={`text-sm truncate ${
                                activeChat?.id === chat.id ? 'text-white/90' : 'text-gray-600'
                              }`}>
                                {chat.lastMessage}
                              </p>
                              {chat.serviceType && (
                                <p className={`text-xs ${
                                  activeChat?.id === chat.id ? 'text-white/70' : 'text-gray-500'
                                }`}>
                                  {chat.serviceType}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Messages */}
            <div className="lg:col-span-2">
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl h-96">
                {activeChat ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={activeChat.businessImage} />
                            <AvatarFallback className="bg-fem-gold text-white">
                              <Building2 className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-white">{activeChat.businessName}</CardTitle>
                            {activeChat.serviceType && (
                              <p className="text-white/80 text-sm">{activeChat.serviceType}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="bg-white/20 text-white border-white/30">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="bg-white/20 text-white border-white/30">
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${
                            message.sender === 'user' 
                              ? 'bg-gradient-to-r from-fem-terracotta to-fem-gold text-white' 
                              : 'bg-gray-100 text-gray-900'
                          } rounded-lg p-3`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1"
                        />
                        <Button type="submit" disabled={!newMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-fem-navy mb-2">Select a Conversation</h3>
                      <p className="text-gray-600">Choose a business from the list to start chatting</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChatPage;
