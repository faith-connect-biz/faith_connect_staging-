
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Building2, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Camera, 
  Calendar, 
  Users, 
  CheckCircle,
  Sparkles,
  Shield,
  Award,
  Heart,
  Settings,
  Edit,
  Save,
  Globe,
  TrendingUp,
  MessageCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ProfilePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [partnershipNumber, setPartnershipNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    phone: "+254 700 123 456",
    address: "Nairobi, Kenya",
    bio: "Faith-driven entrepreneur passionate about building community connections.",
    website: "https://mybusiness.com"
  });
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication status
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    if (!loggedInStatus) {
      navigate("/login");
      return;
    }

    // Get user data from localStorage
    const email = localStorage.getItem("userEmail") || "";
    const type = localStorage.getItem("userType") || "user";
    const partnership = localStorage.getItem("partnershipNumber") || "";
    
    setIsLoggedIn(loggedInStatus);
    setUserEmail(email);
    setUserType(type);
    setPartnershipNumber(partnership);
    setLoading(false);
  }, [navigate]);

  // GSAP Animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }

    if (profileRef.current) {
      gsap.fromTo(profileRef.current,
        { scale: 0.9, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.8, 
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: profileRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (statsRef.current) {
      gsap.fromTo(statsRef.current.children,
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { x: 100, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.8, 
          delay: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contentRef.current,
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

  const handleUpdateProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile changes have been saved successfully.",
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fem-terracotta mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </motion.div>
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
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white px-6 py-3 rounded-full shadow-lg mb-4">
              <Sparkles className="w-5 h-5" />
              <h1 className="text-2xl font-bold">My Profile</h1>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Manage your account information, business listings, and community connections
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Enhanced Profile Card */}
            <motion.div 
              ref={profileRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-1"
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative mb-4"
                    >
                      <Avatar className="h-32 w-32 border-4 border-fem-terracotta shadow-lg">
                        <AvatarImage src="" alt="Profile" />
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-fem-terracotta to-fem-gold text-white">
                          {userEmail.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 bg-fem-terracotta text-white rounded-full w-8 h-8 p-0"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="text-center mb-4">
                      <h2 className="text-xl font-semibold text-fem-navy">
                        {profileData.firstName} {profileData.lastName}
                      </h2>
                      <p className="text-gray-600 capitalize">{userType.replace('-', ' ')}</p>
                      <Badge className="mt-2 bg-gradient-to-r from-fem-gold to-fem-terracotta text-white">
                        Partnership #{partnershipNumber}
                      </Badge>
                    </motion.div>

                    <motion.div variants={itemVariants} className="w-full space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-fem-terracotta" />
                        <span>{userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-fem-terracotta" />
                        <span>{profileData.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-fem-terracotta" />
                        <span>{profileData.address}</span>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mt-6 w-full">
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        className="w-full bg-gradient-to-r from-fem-terracotta to-fem-gold text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditing ? "Cancel Edit" : "Edit Profile"}
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Content */}
            <motion.div 
              ref={contentRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-3"
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Profile Settings
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Verified Account</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 backdrop-blur-sm">
                      <TabsTrigger 
                        value="personal" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                      >
                        <Users className="w-4 h-4" />
                        Personal
                      </TabsTrigger>
                      <TabsTrigger 
                        value="business" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                      >
                        <Building2 className="w-4 h-4" />
                        Business
                      </TabsTrigger>
                      <TabsTrigger 
                        value="activity" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Activity
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="personal" className="mt-6">
                      <motion.div variants={itemVariants} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            disabled={!isEditing}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={profileData.website}
                            onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                            disabled={!isEditing}
                            className="mt-1"
                          />
                        </div>
                        
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                          >
                            <Button onClick={handleUpdateProfile} className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white">
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                              Cancel
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="business" className="mt-6">
                      <motion.div variants={itemVariants} className="space-y-6">
                        <div className="text-center py-8">
                          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-fem-navy mb-2">Business Management</h3>
                          <p className="text-gray-600 mb-4">Manage your business listings and services</p>
                          <Button className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Business
                          </Button>
                        </div>
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="activity" className="mt-6">
                      <motion.div variants={itemVariants} className="space-y-6">
                        <div className="text-center py-8">
                          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-fem-navy mb-2">Activity Overview</h3>
                          <p className="text-gray-600">Track your community engagement and interactions</p>
                        </div>
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div 
            ref={statsRef}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8"
          >
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">12</div>
              <div className="text-sm text-gray-600">Favorites</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-fem-navy to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">8</div>
              <div className="text-sm text-gray-600">Conversations</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">15</div>
              <div className="text-sm text-gray-600">Reviews Given</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-fem-terracotta to-fem-navy rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">3</div>
              <div className="text-sm text-gray-600">Businesses</div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
