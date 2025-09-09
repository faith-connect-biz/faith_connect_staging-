from django.core.management.base import BaseCommand
from business.models import Category
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seed business categories with subcategories'

    def handle(self, *args, **kwargs):
        # First, clear all existing categories to avoid conflicts
        self.stdout.write("🗑️ Clearing existing categories...")
        Category.objects.all().delete()
        
        # Comprehensive categories with subcategories
        categories_data = [
            {
                'id': 1,
                'name': 'Agriculture & Farming 🌱',
                'slug': 'agriculture-farming',
                'description': 'Crops, livestock, agri-processing, and agricultural services',
                'icon': '🌱',
                'subcategories': [
                    'Crop Production', 'Livestock Farming', 'Poultry & Dairy', 'Fish Farming (Aquaculture)',
                    'Agricultural Processing', 'Farm Equipment & Supplies', 'Organic Farming',
                    'Greenhouse & Horticulture', 'Agricultural Consulting', 'Farm-to-Market Services'
                ],
                'sort_order': 1
            },
            {
                'id': 2,
                'name': 'Manufacturing & Production 🏭',
                'slug': 'manufacturing-production',
                'description': 'Making products including clothing, electronics, food processing, and more',
                'icon': '🏭',
                'subcategories': [
                    'Textile & Clothing Manufacturing', 'Electronics Manufacturing', 'Food Processing',
                    'Furniture Manufacturing', 'Chemical Production', 'Metal Works & Fabrication',
                    'Plastic Manufacturing', 'Automotive Parts', 'Pharmaceutical Manufacturing',
                    'Packaging & Printing', 'Craft & Artisan Products'
                ],
                'sort_order': 2
            },
            {
                'id': 3,
                'name': 'Retail & Wholesale 🛒',
                'slug': 'retail-wholesale',
                'description': 'Selling goods directly to consumers or in bulk to other businesses',
                'icon': '🛒',
                'subcategories': [
                    'General Retail Stores', 'Fashion & Clothing', 'Electronics & Gadgets',
                    'Home & Furniture', 'Books & Stationery', 'Sports & Outdoor Equipment',
                    'Wholesale Distribution', 'Import/Export', 'Online Retail/E-commerce',
                    'Specialty Retail', 'Supermarkets & Grocery'
                ],
                'sort_order': 3
            },
            {
                'id': 4,
                'name': 'Hospitality & Tourism 🏨',
                'slug': 'hospitality-tourism',
                'description': 'Hotels, restaurants, travel services, and entertainment venues',
                'icon': '🏨',
                'subcategories': [
                    'Hotels & Accommodation', 'Restaurants & Dining', 'Travel Agencies',
                    'Tour Operators', 'Event Planning', 'Catering Services',
                    'Entertainment Venues', 'Conference Centers', 'Tourist Attractions',
                    'Safari & Adventure Tourism', 'Cultural Tourism'
                ],
                'sort_order': 4
            },
            {
                'id': 5,
                'name': 'Technology & IT 💻',
                'slug': 'technology-it',
                'description': 'Software development, hardware, digital services, and IT solutions',
                'icon': '💻',
                'subcategories': [
                    'Software Development', 'Web Development', 'Mobile App Development',
                    'IT Support & Services', 'Network Setup & Security', 'Data Analytics',
                    'Digital Marketing', 'E-commerce Solutions', 'Cloud Services',
                    'Cybersecurity', 'AI & Machine Learning', 'Hardware Sales & Repair'
                ],
                'sort_order': 5
            },
            {
                'id': 6,
                'name': 'Finance & Insurance 💰',
                'slug': 'finance-insurance',
                'description': 'Banking, fintech, credit services, and insurance products',
                'icon': '💰',
                'subcategories': [
                    'Banking Services', 'Microfinance', 'Investment Services',
                    'Insurance (Life & General)', 'Mobile Money Services', 'Foreign Exchange',
                    'Financial Planning', 'Credit & Loans', 'Accounting Services',
                    'Tax Preparation', 'Financial Technology (Fintech)'
                ],
                'sort_order': 6
            },
            {
                'id': 7,
                'name': 'Healthcare & Wellness 🏥',
                'slug': 'healthcare-wellness',
                'description': 'Medical services, hospitals, clinics, fitness, and pharmaceutical services',
                'icon': '🏥',
                'subcategories': [
                    'Hospitals & Clinics', 'Dental Services', 'Pharmacy & Medicine',
                    'Mental Health Services', 'Physical Therapy', 'Fitness Centers & Gyms',
                    'Nutrition & Dietetics', 'Alternative Medicine', 'Medical Equipment',
                    'Home Healthcare', 'Wellness Centers', 'Laboratory Services'
                ],
                'sort_order': 7
            },
            {
                'id': 8,
                'name': 'Real Estate & Construction 🏗️',
                'slug': 'real-estate-construction',
                'description': 'Property development, sales, rentals, and construction services',
                'icon': '🏗️',
                'subcategories': [
                    'Property Sales', 'Property Rentals', 'Property Management',
                    'Real Estate Development', 'Building Construction', 'Road Construction',
                    'Renovation & Remodeling', 'Architecture & Design', 'Engineering Services',
                    'Building Materials', 'Interior Design', 'Property Valuation'
                ],
                'sort_order': 8
            },
            {
                'id': 9,
                'name': 'Transportation & Logistics 🚚',
                'slug': 'transportation-logistics',
                'description': 'Delivery services, ride-hailing, freight, and warehousing',
                'icon': '🚚',
                'subcategories': [
                    'Delivery Services', 'Ride-Hailing & Taxi', 'Freight & Cargo',
                    'Warehousing & Storage', 'Moving Services', 'Public Transportation',
                    'Car Rental', 'Logistics Consulting', 'Supply Chain Management',
                    'International Shipping', 'Last-Mile Delivery'
                ],
                'sort_order': 9
            },
            {
                'id': 10,
                'name': 'Professional Services 📁',
                'slug': 'professional-services',
                'description': 'Legal, consulting, accounting, design, and other professional services',
                'icon': '📁',
                'subcategories': [
                    'Legal Services', 'Business Consulting', 'Accounting & Bookkeeping',
                    'Human Resources', 'Marketing & Advertising', 'Graphic Design',
                    'Translation Services', 'Research & Development', 'Project Management',
                    'Quality Assurance', 'Environmental Consulting', 'Management Consulting'
                ],
                'sort_order': 10
            },
            {
                'id': 11,
                'name': 'Education & Training 📚',
                'slug': 'education-training',
                'description': 'Schools, universities, online learning, and vocational training',
                'icon': '📚',
                'subcategories': [
                    'Primary & Secondary Schools', 'Universities & Colleges', 'Vocational Training',
                    'Online Learning Platforms', 'Language Schools', 'Professional Certification',
                    'Tutoring Services', 'Educational Technology', 'Research Institutions',
                    'Corporate Training', 'Skill Development Centers'
                ],
                'sort_order': 11
            },
            {
                'id': 12,
                'name': 'Energy & Utilities ⚡',
                'slug': 'energy-utilities',
                'description': 'Electricity, oil, gas, renewable energy, and water services',
                'icon': '⚡',
                'subcategories': [
                    'Solar Energy', 'Wind Energy', 'Hydroelectric Power', 'Oil & Gas',
                    'Electricity Distribution', 'Water Supply & Treatment', 'Waste Management',
                    'Energy Consulting', 'Battery & Storage Solutions', 'Energy Efficiency',
                    'Biogas & Biomass'
                ],
                'sort_order': 12
            },
            {
                'id': 13,
                'name': 'Creative Industries 🎨',
                'slug': 'creative-industries',
                'description': 'Media, film, advertising, design, and creative services',
                'icon': '🎨',
                'subcategories': [
                    'Film & Video Production', 'Photography', 'Graphic Design',
                    'Music Production', 'Advertising Agencies', 'Art & Crafts',
                    'Fashion Design', 'Interior Design', 'Animation & VFX',
                    'Publishing & Media', 'Event Design', 'Creative Writing'
                ],
                'sort_order': 13
            },
            {
                'id': 14,
                'name': 'Food & Beverage 🍽️',
                'slug': 'food-beverage',
                'description': 'Restaurants, cafes, food processing, catering, and beverage services',
                'icon': '🍽️',
                'subcategories': [
                    'Restaurants', 'Fast Food', 'Cafes & Coffee Shops', 'Bars & Nightlife',
                    'Catering Services', 'Food Delivery', 'Food Processing & Manufacturing',
                    'Bakeries & Pastries', 'Food Trucks', 'Specialty Foods',
                    'Beverage Manufacturing', 'Organic & Health Foods'
                ],
                'sort_order': 14
            },
            {
                'id': 15,
                'name': 'Beauty & Personal Care 💄',
                'slug': 'beauty-personal-care',
                'description': 'Salons, spas, cosmetics, and personal care services',
                'icon': '💄',
                'subcategories': [
                    'Hair Salons', 'Beauty Spas', 'Nail Services', 'Makeup Artists',
                    'Cosmetics & Skincare', 'Barbershops', 'Massage Therapy',
                    'Beauty Training', 'Personal Care Products', 'Wellness & Aromatherapy',
                    'Bridal Services'
                ],
                'sort_order': 15
            },
            {
                'id': 16,
                'name': 'Automotive Services 🚗',
                'slug': 'automotive-services',
                'description': 'Car repair, maintenance, sales, and automotive services',
                'icon': '🚗',
                'subcategories': [
                    'Car Repair & Maintenance', 'Auto Parts & Accessories', 'Car Sales (New & Used)',
                    'Car Wash & Detailing', 'Tire Services', 'Auto Insurance',
                    'Motorcycle Services', 'Auto Electrical', 'Body Shop & Painting',
                    'Towing Services', 'Car Rental'
                ],
                'sort_order': 16
            },
            {
                'id': 17,
                'name': 'Home & Garden 🏡',
                'slug': 'home-garden',
                'description': 'Home improvement, gardening, landscaping, and household services',
                'icon': '🏡',
                'subcategories': [
                    'Home Renovation', 'Landscaping & Gardening', 'Plumbing Services',
                    'Electrical Services', 'Cleaning Services', 'Pest Control',
                    'Security Systems', 'HVAC Services', 'Roofing Services',
                    'Painting & Decorating', 'Appliance Repair'
                ],
                'sort_order': 17
            },
            {
                'id': 18,
                'name': 'Entertainment & Media 🎭',
                'slug': 'entertainment-media',
                'description': 'Entertainment venues, media production, and recreational services',
                'icon': '🎭',
                'subcategories': [
                    'Cinemas & Theaters', 'Music Venues', 'Sports Facilities',
                    'Gaming Centers', 'Media Production', 'Broadcasting',
                    'Event Entertainment', 'Recreational Activities', 'Theme Parks',
                    'Cultural Centers', 'Comedy & Performance'
                ],
                'sort_order': 18
            },
            {
                'id': 19,
                'name': 'Non-Profit & Community 🤝',
                'slug': 'non-profit-community',
                'description': 'Charitable organizations, community services, and social enterprises',
                'icon': '🤝',
                'subcategories': [
                    'Charitable Organizations', 'Community Development', 'Religious Organizations',
                    'Youth Services', 'Elder Care', 'Environmental Organizations',
                    'Social Enterprises', 'NGOs', 'Volunteer Organizations',
                    'Community Centers', 'Advocacy Groups'
                ],
                'sort_order': 19
            },
            {
                'id': 20,
                'name': 'Pet Services & Veterinary 🐾',
                'slug': 'pet-services-veterinary',
                'description': 'Veterinary services, pet care, grooming, and animal-related services',
                'icon': '🐾',
                'subcategories': [
                    'Veterinary Clinics', 'Pet Grooming', 'Pet Boarding & Daycare',
                    'Pet Food & Supplies', 'Pet Training', 'Animal Shelters',
                    'Pet Insurance', 'Animal Photography', 'Pet Transportation',
                    'Aquarium & Fish Services', 'Exotic Pet Care'
                ],
                'sort_order': 20
            },
            {
                'id': 21,
                'name': 'Sports & Recreation 🏃',
                'slug': 'sports-recreation',
                'description': 'Sports facilities, fitness, recreation, and outdoor activities',
                'icon': '🏃',
                'subcategories': [
                    'Fitness Centers & Gyms', 'Sports Clubs', 'Outdoor Adventure',
                    'Sports Equipment', 'Personal Training', 'Swimming Pools',
                    'Golf Courses', 'Tennis Courts', 'Martial Arts', 'Dance Studios',
                    'Yoga & Wellness', 'Sports Medicine'
                ],
                'sort_order': 21
            },
            {
                'id': 22,
                'name': 'Mining & Natural Resources ⛏️',
                'slug': 'mining-natural-resources',
                'description': 'Mining operations, mineral extraction, and natural resource management',
                'icon': '⛏️',
                'subcategories': [
                    'Gold Mining', 'Coal Mining', 'Stone Quarrying', 'Sand & Gravel',
                    'Mineral Processing', 'Mining Equipment', 'Geological Services',
                    'Environmental Impact Assessment', 'Mining Consulting',
                    'Precious Stones & Gems', 'Salt Mining'
                ],
                'sort_order': 22
            },
            {
                'id': 23,
                'name': 'Textiles & Fashion 👗',
                'slug': 'textiles-fashion',
                'description': 'Textile production, fashion design, clothing manufacturing, and accessories',
                'icon': '👗',
                'subcategories': [
                    'Textile Manufacturing', 'Fashion Design', 'Clothing Production',
                    'Traditional Clothing', 'Accessories Design', 'Footwear',
                    'Tailoring & Alterations', 'Fashion Retail', 'Fabric Trading',
                    'Fashion Photography', 'Fashion Shows & Events'
                ],
                'sort_order': 23
            },
            {
                'id': 24,
                'name': 'Government & Public Services 🏛️',
                'slug': 'government-public-services',
                'description': 'Government agencies, public administration, and civic services',
                'icon': '🏛️',
                'subcategories': [
                    'Local Government', 'Public Administration', 'Emergency Services',
                    'Public Health Services', 'Public Transportation', 'Municipal Services',
                    'Regulatory Bodies', 'Public Works', 'Social Services',
                    'Immigration Services', 'Public Safety'
                ],
                'sort_order': 24
            },
            {
                'id': 25,
                'name': 'Import & Export Trade 🚢',
                'slug': 'import-export-trade',
                'description': 'International trade, import/export services, and trade facilitation',
                'icon': '🚢',
                'subcategories': [
                    'Import Services', 'Export Services', 'Trade Facilitation',
                    'Customs Brokerage', 'International Shipping', 'Trade Finance',
                    'Foreign Trade Consulting', 'Cross-Border E-commerce',
                    'Trade Documentation', 'Market Research', 'Trade Missions'
                ],
                'sort_order': 25
            }
        ]

        created_count = 0
        for category_data in categories_data:
            category = Category.objects.create(
                id=category_data['id'],
                name=category_data['name'],
                slug=category_data['slug'],
                description=category_data['description'],
                icon=category_data['icon'],
                subcategories=category_data['subcategories'],
                sort_order=category_data['sort_order'],
                is_active=True
            )
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f"✅ Created category: {category.name} (ID: {category.id}) with {len(category.subcategories)} subcategories")
            )
        
        self.stdout.write(
            self.style.SUCCESS(f"🎉 Successfully created {created_count} categories with comprehensive subcategories!")
        )
