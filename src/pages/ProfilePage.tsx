
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
import { Separator } from "@/components/ui/separator";
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
  User,
  Briefcase,
  Clock,
  Eye,
  PenTool,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { apiService } from "@/services/api";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const { forceReAuth } = useAuth();
  const { businesses } = useBusiness();
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    county: "",
    bio: "",
    website: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch complete user profile from API
  const fetchUserProfile = async () => {
    try {
      console.log('ProfilePage: Fetching complete user profile...');
      const userData = await apiService.getCurrentUser();
      console.log('ProfilePage: Complete user profile received:', userData);
      console.log('ProfilePage: User data keys:', Object.keys(userData));
      console.log('ProfilePage: User data first_name:', userData.first_name);
      console.log('ProfilePage: User data last_name:', userData.last_name);
      console.log('ProfilePage: User data phone:', userData.phone);
      console.log('ProfilePage: User data address:', userData.address);
      console.log('ProfilePage: User data city:', userData.city);
      console.log('ProfilePage: User data county:', userData.county);
      console.log('ProfilePage: User data bio:', userData.bio);
      
      if (userData) {
        const newProfileData = {
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          county: userData.county || "",
          bio: userData.bio || "",
          website: "" // Website not available in User model
        };
        
        console.log('ProfilePage: Setting complete profile data:', newProfileData);
        setProfileData(newProfileData);
      } else {
        console.error('ProfilePage: No user data received');
        // Fallback to basic user data if API call fails
        if (user) {
          const fallbackData = {
            firstName: user.first_name || "",
            lastName: user.last_name || "",
            phone: user.phone || "",
            address: user.address || "",
            city: user.city || "",
            county: user.county || "",
            bio: user.bio || "",
            website: ""
          };
          console.log('ProfilePage: Using fallback data:', fallbackData);
          setProfileData(fallbackData);
        }
      }
    } catch (error) {
      console.error('ProfilePage: Error fetching user profile:', error);
      // Fallback to basic user data if API call fails
      if (user) {
        const fallbackData = {
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          county: user.county || "",
          bio: user.bio || "",
          website: ""
        };
        console.log('ProfilePage: Using fallback data:', fallbackData);
        setProfileData(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      console.log('ProfilePage: User object received:', user);
      console.log('ProfilePage: User type:', user.user_type);
      console.log('ProfilePage: User keys:', Object.keys(user));
      
      // Fetch complete user profile from API
      fetchUserProfile();
    }
  }, [user]);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

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

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      console.log('ProfilePage: Updating profile with data:', profileData);
      
      // Prepare data for API update
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        county: profileData.county,
        bio: profileData.bio
      };
      
      console.log('ProfilePage: Sending update data to API:', updateData);
      
      // Update profile using API service
      const updatedUser = await apiService.updateProfile(updateData);
      console.log('ProfilePage: Profile updated successfully:', updatedUser);
      
      // Update local user context
      updateUser(updatedUser);
      
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error('ProfilePage: Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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

  // Calculate user stats
  const userBusinesses = Array.isArray(businesses) ? businesses.filter(b => b.user === user?.id) : [];
  const userStats = {
    favorites: 0, // TODO: Implement favorites
    conversations: 0, // TODO: Implement conversations
    reviewsGiven: 0, // TODO: Implement reviews
    businesses: userBusinesses.length
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-fem-terracotta border-t-transparent mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    console.error('ProfilePage: No user data available');
    toast({
      title: "Authentication required",
      description: "Please log in to access your profile",
      variant: "destructive"
    });
    navigate("/");
    return;
  }

  if (!profileData.firstName && !profileData.lastName) {
    console.error('ProfilePage: Profile data not loaded');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-fem-terracotta border-t-transparent mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">Loading profile data...</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          
          {/* Enhanced Header with Gradient Background */}
          <motion.div 
            ref={headerRef}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12 text-center relative"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-fem-navy/10 via-fem-terracotta/10 to-fem-gold/10 rounded-3xl blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-4 bg-gradient-to-r from-fem-navy via-fem-terracotta to-fem-gold text-white px-8 py-4 rounded-2xl shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
                Manage your account information, business listings, and community connections with our comprehensive profile dashboard
              </p>
            </div>
          </motion.div>

          {/* Debug Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Debug & Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Authentication Status</h4>
                  <div className="text-sm space-y-1">
                    <p>User: {user?.partnership_number || 'None'} ({user?.user_type || 'None'})</p>
                    <p>Access Token: {apiService.getAuthToken() ? 'Present' : 'Missing'}</p>
                    <p>Refresh Token: {localStorage.getItem('refresh_token') ? 'Present' : 'Missing'}</p>
                    <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Debug Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => forceReAuth()}
                      className="w-full"
                    >
                      Force Re-authentication
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fetchUserProfile()}
                      className="w-full"
                    >
                      Refresh Profile Data
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        console.log('Current user state:', user);
                        console.log('Current profile data:', profileData);
                      }}
                      className="w-full"
                    >
                      Log Current State
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => apiService.logAuthStatus()}
                      className="w-full"
                    >
                      Log Auth Status
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Enhanced Profile Card with Glassmorphism */}
            <motion.div 
              ref={profileRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="xl:col-span-1"
            >
              <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-br from-fem-navy to-fem-terracotta h-24 relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative"
                    >
                      <Avatar className="h-24 w-24 border-4 border-white shadow-2xl">
                        <AvatarImage src={user.profile_image_url || ""} alt="Profile" />
                        <AvatarFallback className="text-3xl bg-gradient-to-br from-fem-terracotta to-fem-gold text-white font-bold">
                          {user.first_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 bg-fem-terracotta hover:bg-fem-terracotta/90 text-white rounded-full w-10 h-10 p-0 shadow-lg border-2 border-white"
                      >
                        <Camera className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
                
                <CardContent className="pt-16 pb-8 px-8">
                  <motion.div variants={itemVariants} className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-fem-navy mb-2">
                      {user.first_name} {user.last_name}
                    </h2>
                    <p className="text-gray-600 capitalize text-sm font-medium mb-3">
                      {user.user_type ? user.user_type.replace('_', ' ') : 'User'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      <Badge className="bg-gradient-to-r from-fem-gold to-fem-terracotta text-white px-3 py-1 text-xs font-medium">
                        Partnership #{user.partnership_number}
                      </Badge>
                      {user.is_verified && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs font-medium">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </motion.div>

                  <Separator className="my-6" />

                  <motion.div variants={itemVariants} className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600 p-3 rounded-xl bg-gray-50/50">
                      <Mail className="w-4 h-4 text-fem-terracotta" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                    {profileData.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 p-3 rounded-xl bg-gray-50/50">
                        <Phone className="w-4 h-4 text-fem-terracotta" />
                        <span className="font-medium">{profileData.phone}</span>
                      </div>
                    )}
                    {profileData.address && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 p-3 rounded-xl bg-gray-50/50">
                        <MapPin className="w-4 h-4 text-fem-terracotta" />
                        <span className="font-medium">{profileData.address}</span>
                      </div>
                    )}
                    {profileData.city && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 p-3 rounded-xl bg-gray-50/50">
                        <MapPin className="w-4 h-4 text-fem-terracotta" />
                        <span className="font-medium">{profileData.city}, {profileData.county}</span>
                      </div>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      className="w-full bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? "Cancel Edit" : "Edit Profile"}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Content Area */}
            <motion.div 
              ref={contentRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="xl:col-span-3"
            >
              <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-fem-navy via-fem-terracotta to-fem-gold text-white p-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                      <Settings className="w-6 h-6" />
                      Profile Settings
                    </CardTitle>
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {user.is_verified ? "Verified Account" : "Unverified Account"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 backdrop-blur-sm p-1 rounded-xl mb-8">
                      <TabsTrigger 
                        value="personal" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-3 px-6 transition-all duration-200"
                      >
                        <User className="w-4 h-4" />
                        Personal Info
                      </TabsTrigger>
                      <TabsTrigger 
                        value="business" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-3 px-6 transition-all duration-200"
                      >
                        <Briefcase className="w-4 h-4" />
                        Business
                      </TabsTrigger>
                      <TabsTrigger 
                        value="activity" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-3 px-6 transition-all duration-200"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Activity
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="personal" className="mt-8">
                      <motion.div variants={itemVariants} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name</Label>
                            <Input
                              id="firstName"
                              value={profileData.firstName}
                              onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                              disabled={!isEditing}
                              className="h-12 border-2 border-gray-200 focus:border-fem-terracotta focus:ring-2 focus:ring-fem-terracotta/20 rounded-xl transition-all duration-200"
                              placeholder="Enter your first name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name</Label>
                            <Input
                              id="lastName"
                              value={profileData.lastName}
                              onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                              disabled={!isEditing}
                              className="h-12 border-2 border-gray-200 focus:border-fem-terracotta focus:ring-2 focus:ring-fem-terracotta/20 rounded-xl transition-all duration-200"
                              placeholder="Enter your last name"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                            <Input
                              id="phone"
                              value={profileData.phone}
                              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                              disabled={!isEditing}
                              className="h-12 border-2 border-gray-200 focus:border-fem-terracotta focus:ring-2 focus:ring-fem-terracotta/20 rounded-xl transition-all duration-200"
                              placeholder="Enter your phone number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website" className="text-sm font-semibold text-gray-700">Website (Optional)</Label>
                            <Input
                              id="website"
                              value={profileData.website}
                              onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                              disabled={!isEditing}
                              className="h-12 border-2 border-gray-200 focus:border-fem-terracotta focus:ring-2 focus:ring-fem-terracotta/20 rounded-xl transition-all duration-200"
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Address</Label>
                          <Input
                            id="address"
                            value={profileData.address}
                            onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                            disabled={!isEditing}
                            className="h-12 border-2 border-gray-200 focus:border-fem-terracotta focus:ring-2 focus:ring-fem-terracotta/20 rounded-xl transition-all duration-200"
                            placeholder="Enter your address"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City</Label>
                            <Input
                              id="city"
                              value={profileData.city}
                              onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                              disabled={!isEditing}
                              className="h-12 border-2 border-gray-200 focus:border-fem-terracotta focus:ring-2 focus:ring-fem-terracotta/20 rounded-xl transition-all duration-200"
                              placeholder="Enter your city"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="county" className="text-sm font-semibold text-gray-700">County</Label>
                            <Input
                              id="county"
                              value={profileData.county}
                              onChange={(e) => setProfileData(prev => ({ ...prev, county: e.target.value }))}
                              disabled={!isEditing}
                              className="h-12 border-2 border-gray-200 focus:border-fem-terracotta focus:ring-2 focus:ring-fem-terracotta/20 rounded-xl transition-all duration-200"
                              placeholder="Enter your county"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            disabled={!isEditing}
                            rows={4}
                            className="border-2 border-gray-200 focus:border-fem-terracotta focus:ring-2 focus:ring-fem-terracotta/20 rounded-xl transition-all duration-200 resize-none"
                            placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                          />
                        </div>
                        
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 pt-4"
                          >
                            <Button
                              onClick={handleUpdateProfile}
                              disabled={saving}
                              className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white hover:from-fem-terracotta/90 hover:to-fem-gold/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                              {saving ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => setIsEditing(false)}
                              variant="outline"
                              className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="business" className="mt-8">
                      <motion.div variants={itemVariants} className="space-y-6">
                        {userBusinesses.length > 0 ? (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-bold text-fem-navy">Your Businesses</h3>
                              <Button className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white font-semibold px-6 py-2 rounded-xl shadow-lg">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New
                              </Button>
                            </div>
                            {userBusinesses.map((business) => (
                              <Card key={business.id} className="p-6 border-2 border-gray-100 hover:border-fem-terracotta/30 transition-all duration-200 rounded-2xl shadow-lg hover:shadow-xl">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="text-xl font-bold text-fem-navy mb-2">{business.business_name}</h4>
                                    <p className="text-gray-600 mb-3 flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-fem-terracotta" />
                                      {business.city}, {business.county}
                                    </p>
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        <span className="text-sm font-medium">{business.rating} ({business.review_count} reviews)</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Updated recently</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <Button size="sm" variant="outline" className="border-2 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white rounded-xl px-4 py-2">
                                      <PenTool className="w-4 h-4 mr-2" />
                                      Edit
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-4 py-2">
                                      <Eye className="w-4 h-4 mr-2" />
                                      View
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-br from-fem-terracotta/20 to-fem-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Building2 className="w-12 h-12 text-fem-terracotta" />
                            </div>
                            <h3 className="text-2xl font-bold text-fem-navy mb-3">No Businesses Yet</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                              Start building your business presence by adding your first business listing to our directory
                            </p>
                            <Button className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white font-semibold px-8 py-4 rounded-xl shadow-lg text-lg transform hover:scale-105 transition-all duration-200">
                              <Plus className="w-5 h-5 mr-2" />
                              Add Your First Business
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="activity" className="mt-8">
                      <motion.div variants={itemVariants} className="space-y-6">
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-fem-gold/20 to-fem-terracotta/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="w-8 h-8 text-fem-gold" />
                          </div>
                          <h3 className="text-xl font-bold text-fem-navy mb-2">Activity Overview</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Your recent activity on the platform
                          </p>
                          
                          {/* Compact Stats */}
                          <div className="flex justify-center gap-8 mb-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-fem-navy">0</div>
                              <div className="text-sm text-gray-600">Reviews</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-fem-navy">0</div>
                              <div className="text-sm text-gray-600">Favorites</div>
                            </div>
                          </div>

                          {/* Recent Activity List */}
                          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 max-w-lg mx-auto">
                            <h4 className="text-sm font-semibold text-fem-navy mb-3 text-left">Recent Activity</h4>
                            <div className="space-y-2">
                              <div className="text-center py-6">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <Clock className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-sm">No recent activity</p>
                                <p className="text-gray-400 text-xs mt-1">Start reviewing businesses and adding favorites</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Enhanced Stats Section with Glassmorphism */}
          <motion.div 
            ref={statsRef}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-center shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-fem-navy mb-2">{userStats.favorites}</div>
              <div className="text-sm text-gray-600 font-medium">Favorites</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-center shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-fem-navy mb-2">{userStats.reviewsGiven}</div>
              <div className="text-sm text-gray-600 font-medium">Reviews Given</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-center shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-fem-terracotta to-fem-navy rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-fem-navy mb-2">{userStats.businesses}</div>
              <div className="text-sm text-gray-600 font-medium">Businesses</div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
