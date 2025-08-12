import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { OnboardingCheck } from "@/components/OnboardingCheck";
import { 
  Building2, 
  Upload, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Camera,
  Settings,
  Package,
  Tag,
  Users,
  Sparkles,
  Award,
  TrendingUp,
  Heart,
  Star
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const BusinessRegistrationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    // Basic Information
    businessName: "",
    category: "",
    description: "",
    longDescription: "",
    businessType: "both" as "products" | "services" | "both", // NEW FIELD
    
    // Contact Information
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    
    // Business Details
    hours: {
      monday: { open: "", close: "", closed: false },
      tuesday: { open: "", close: "", closed: false },
      wednesday: { open: "", close: "", closed: false },
      thursday: { open: "", close: "", closed: false },
      friday: { open: "", close: "", closed: false },
      saturday: { open: "", close: "", closed: false },
      sunday: { open: "", close: "", closed: false }
    },
    
    // Services & Products
    services: [] as string[],
    products: [] as Array<{name: string, price: string, description: string, photo?: string}>,
    features: [] as string[],
    tags: [] as string[],
    
    // Photo Request
    photoRequest: false,
    photoRequestNotes: ""
  });

  // GSAP Animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }

    if (progressRef.current) {
      gsap.fromTo(progressRef.current,
        { scale: 0.8, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.8, 
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: progressRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          delay: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: formRef.current,
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

  const categories = [
    "Restaurant", "Retail", "Services", "Health & Wellness", 
    "Automotive", "Real Estate", "Education", "Technology",
    "Beauty & Personal Care", "Home & Garden", "Legal Services",
    "Financial Services", "Entertainment", "Professional Services",
    "Construction", "Transportation", "Non-Profit"
  ];

  const availableServices = [
    "Dine-in", "Takeout", "Delivery", "Catering", "Private Events",
    "Consultation", "Installation", "Maintenance", "Repair", "Training",
    "Custom Work", "Rental", "Membership", "Subscription", "One-time Service"
  ];

  const availableFeatures = [
    "Free Wi-Fi", "Parking Available", "Wheelchair Accessible", "Credit Cards Accepted",
    "Cash Only", "Appointment Required", "Walk-ins Welcome", "Emergency Services",
    "24/7 Service", "Mobile Service", "Online Booking", "Gift Cards Available"
  ];

  const availableTags = [
    "Family-Friendly", "Eco-Friendly", "Veteran-Owned", "Woman-Owned", "Local Business",
    "Christian-Owned", "Community-Focused", "Quality Service", "Affordable", "Premium",
    "Fast Service", "Professional", "Reliable", "Trusted", "Innovative"
  ];

  const steps = [
    { id: 1, title: "Basic Info", icon: Building2 },
    { id: 2, title: "Contact Details", icon: Phone },
    { id: 3, title: "Services & Products", icon: Settings }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day as keyof typeof prev.hours],
          [field]: value
        }
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Business registered successfully!",
      description: "Your business has been added to the directory. Welcome to the Faith Connect community!",
    });
    navigate("/directory");
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

  const renderStep1 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Label htmlFor="businessName">Business Name *</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => handleInputChange("businessName", e.target.value)}
          placeholder="Enter your business name"
          className="mt-1"
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="category">Business Category *</Label>
        <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(categories) && categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label className="text-base font-medium">Business Type *</Label>
        <p className="text-sm text-gray-600 mb-3">What does your business offer?</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.businessType === 'products' 
                ? 'border-fem-terracotta bg-fem-terracotta/10' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleInputChange("businessType", "products")}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                formData.businessType === 'products' 
                  ? 'border-fem-terracotta bg-fem-terracotta' 
                  : 'border-gray-400'
              }`}>
                {formData.businessType === 'products' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                )}
              </div>
              <div>
                <div className="font-medium text-fem-navy">Products Only</div>
                <div className="text-sm text-gray-600">Sell physical goods</div>
              </div>
            </div>
          </div>

          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.businessType === 'services' 
                ? 'border-fem-terracotta bg-fem-terracotta/10' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleInputChange("businessType", "services")}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                formData.businessType === 'services' 
                  ? 'border-fem-terracotta bg-fem-terracotta' 
                  : 'border-gray-400'
              }`}>
                {formData.businessType === 'services' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                )}
              </div>
              <div>
                <div className="font-medium text-fem-navy">Services Only</div>
                <div className="text-sm text-gray-600">Provide services</div>
              </div>
            </div>
          </div>

          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              formData.businessType === 'both' 
                ? 'border-fem-terracotta bg-fem-terracotta/10' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleInputChange("businessType", "both")}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                formData.businessType === 'both' 
                  ? 'border-fem-terracotta bg-fem-terracotta' 
                  : 'border-gray-400'
              }`}>
                {formData.businessType === 'both' && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                )}
              </div>
              <div>
                <div className="font-medium text-fem-navy">Both</div>
                <div className="text-sm text-gray-600">Products & services</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="description">Short Description *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Brief description of your business"
          className="mt-1"
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="longDescription">Detailed Description</Label>
        <Textarea
          id="longDescription"
          value={formData.longDescription}
          onChange={(e) => handleInputChange("longDescription", e.target.value)}
          placeholder="Tell us more about your business, services, and what makes you unique"
          rows={4}
          className="mt-1"
        />
      </motion.div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+254 XXX XXX XXX"
            className="mt-1"
            required
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="business@example.com"
            className="mt-1"
            required
          />
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          value={formData.website}
          onChange={(e) => handleInputChange("website", e.target.value)}
          placeholder="https://www.yourbusiness.com"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="address">Street Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="123 Main Street"
          required
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="Nairobi"
            required
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Label htmlFor="state">County *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
            placeholder="Nairobi"
            required
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Label htmlFor="zipCode">Postal Code</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleInputChange("zipCode", e.target.value)}
            placeholder="00100"
          />
        </motion.div>
      </div>

      {/* Business Hours */}
      <motion.div variants={itemVariants} className="space-y-4">
        <Label className="text-lg font-semibold">Business Hours</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData.hours).map(([day, hours]) => (
            <div key={day} className={`border rounded-lg p-4 backdrop-blur-sm transition-all duration-200 ${
              hours.closed 
                ? 'bg-gray-100/80 border-gray-300' 
                : 'bg-white/80 border-blue-300'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Label className="capitalize font-medium">{day}</Label>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Checkbox
                      id={`${day}-closed`}
                      checked={hours.closed}
                      onCheckedChange={(checked) => handleHoursChange(day, "closed", checked as boolean)}
                    />
                    <Label htmlFor={`${day}-closed`} className="text-xs cursor-pointer">
                      {hours.closed ? "Closed" : "Open"}
                    </Label>
                  </div>
                </div>
              </div>
              {!hours.closed && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm text-gray-700">Open</Label>
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                      className="text-sm bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      placeholder="--:--"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-700">Close</Label>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                      className="text-sm bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      placeholder="--:--"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Services Offered */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Services Offered
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          Select the services you provide to your customers
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableServices.map((service) => (
            <div key={service} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-100 transition-colors">
              <Checkbox
                id={service}
                checked={formData.services.includes(service)}
                onCheckedChange={() => handleArrayToggle("services", service)}
              />
              <Label htmlFor={service} className="text-sm cursor-pointer">{service}</Label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Products */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
        <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Products You Sell
        </h3>
        <p className="text-sm text-green-700 mb-4">
          Add the products you sell with descriptions, pricing, and photos
        </p>
        
        {/* Product List */}
        <div className="space-y-4 mb-4">
          {formData.products.map((product, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-green-900">Product {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newProducts = formData.products.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, products: newProducts }));
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`product-name-${index}`}>Product Name *</Label>
                  <Input
                    id={`product-name-${index}`}
                    placeholder="e.g., Handmade Jewelry, Organic Soap"
                    value={product.name}
                    onChange={(e) => {
                      const newProducts = [...formData.products];
                      newProducts[index].name = e.target.value;
                      setFormData(prev => ({ ...prev, products: newProducts }));
                    }}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`product-price-${index}`}>Price (KSH) *</Label>
                  <Input
                    id={`product-price-${index}`}
                    placeholder="e.g., 500, 1,200"
                    value={product.price}
                    onChange={(e) => {
                      const newProducts = [...formData.products];
                      newProducts[index].price = e.target.value;
                      setFormData(prev => ({ ...prev, products: newProducts }));
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
              
              {/* Product Photo Upload */}
              <div className="mt-4">
                <Label className="text-sm font-medium text-green-900 mb-2 block">
                  Product Photo
                </Label>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                  <Camera className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-600 mb-2">
                    Click to upload product photo
                  </p>
                  <p className="text-xs text-green-500">
                    JPG, PNG up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`product-photo-${index}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const newProducts = [...formData.products];
                          newProducts[index] = {
                            ...newProducts[index],
                            photo: event.target?.result as string
                          };
                          setFormData(prev => ({ ...prev, products: newProducts }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`product-photo-${index}`)?.click()}
                    className="mt-2 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Photo
                  </Button>
                </div>
                
                {/* Display uploaded photo */}
                {product.photo && (
                  <div className="mt-3">
                    <div className="relative inline-block">
                      <img
                        src={product.photo}
                        alt={`${product.name} photo`}
                        className="w-24 h-24 object-cover rounded-lg border border-green-200"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newProducts = [...formData.products];
                          newProducts[index] = {
                            ...newProducts[index],
                            photo: ""
                          };
                          setFormData(prev => ({ ...prev, products: newProducts }));
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white hover:bg-red-600 border-red-500"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-3">
                <Label htmlFor={`product-description-${index}`}>Description</Label>
                <Textarea
                  id={`product-description-${index}`}
                  placeholder="Describe your product, its features, materials, etc."
                  value={product.description}
                  onChange={(e) => {
                    const newProducts = [...formData.products];
                    newProducts[index].description = e.target.value;
                    setFormData(prev => ({ ...prev, products: newProducts }));
                  }}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Product Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData(prev => ({
              ...prev,
              products: [...prev.products, { name: "", price: "", description: "", photo: "" }]
            }));
          }}
          className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
        >
          <Package className="w-4 h-4 mr-2" />
          Add Another Product
        </Button>
      </motion.div>

      {/* Features & Amenities */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200 shadow-sm">
        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Features & Amenities
        </h3>
        <p className="text-sm text-purple-700 mb-4">
          Select the features and amenities your business offers
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableFeatures.map((feature) => (
            <div key={feature} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-100 transition-colors">
              <Checkbox
                id={feature}
                checked={formData.features.includes(feature)}
                onCheckedChange={() => handleArrayToggle("features", feature)}
              />
              <Label htmlFor={feature} className="text-sm cursor-pointer">{feature}</Label>
            </div>
          ))}
        </div>
      </motion.div>



      {/* Professional Photography Request */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200 shadow-sm">
        <h3 className="text-lg font-semibold text-pink-900 mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Professional Photography
        </h3>
        <p className="text-sm text-pink-700 mb-4">
          Request professional photos for your business to enhance your listing
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="photoRequest"
              checked={formData.photoRequest}
              onCheckedChange={(checked) => handleInputChange("photoRequest", checked)}
            />
            <Label htmlFor="photoRequest" className="text-sm cursor-pointer">
              Request professional photos for my business
            </Label>
          </div>
          
          {formData.photoRequest && (
            <div className="bg-white p-4 rounded-lg border border-pink-200">
              <Label htmlFor="photoRequestNotes" className="text-sm font-medium text-pink-900 mb-2 block">
                Photo Request Details
              </Label>
              <Textarea
                id="photoRequestNotes"
                value={formData.photoRequestNotes}
                onChange={(e) => handleInputChange("photoRequestNotes", e.target.value)}
                placeholder="Describe your business, preferred photo style, specific areas to capture, or any special requirements..."
                rows={4}
                className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              />
              <p className="text-xs text-pink-600 mt-2">
                Our professional photographers will contact you to schedule a session and discuss your specific needs.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Creative Summary */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Your Business Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-100 rounded-lg">
            <div className="font-semibold text-blue-900">{formData.services.length}</div>
            <div className="text-blue-700">Services</div>
          </div>
          <div className="text-center p-3 bg-green-100 rounded-lg">
            <div className="font-semibold text-green-900">{formData.products.length}</div>
            <div className="text-green-700">Products</div>
          </div>
          <div className="text-center p-3 bg-purple-100 rounded-lg">
            <div className="font-semibold text-purple-900">{formData.features.length}</div>
            <div className="text-purple-700">Features</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );




  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      <OnboardingCheck userType="business" />
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
              <h1 className="text-2xl font-bold">Register Your Business</h1>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our faith community directory and connect with customers who share your values
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            
            {/* Enhanced Progress Steps */}
            <motion.div 
              ref={progressRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={step.id} className="flex items-center">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                            currentStep >= step.id 
                              ? 'bg-fem-terracotta border-fem-terracotta text-white' 
                              : 'bg-white border-gray-300 text-gray-500'
                          }`}>
                            {currentStep > step.id ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <StepIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${
                              currentStep >= step.id ? 'text-fem-terracotta' : 'text-gray-500'
                            }`}>
                              {step.title}
                            </p>
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-4 ${
                              currentStep > step.id ? 'bg-fem-terracotta' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Form */}
            <motion.div 
              ref={formRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const StepIcon = steps[currentStep - 1].icon;
                      return <StepIcon className="w-5 h-5" />;
                    })()}
                    Step {currentStep} of 3: {steps[currentStep - 1].title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {renderCurrentStep()}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Delegate Account",
                        description: "Allow team members or employees to manage your business listing. Coming soon!",
                      });
                    }}
                    className="border-fem-gold text-fem-gold hover:bg-fem-gold hover:text-white group relative"
                    title="Delegate Account - Allow team members to manage your business listing"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Delegate Account
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Allow team members to manage your business
                    </div>
                  </Button>

                  {currentStep === 3 ? (
                    <Button 
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Complete Registration
                    </Button>
                  ) : (
                    <Button onClick={nextStep} className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white">
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessRegistrationPage; 