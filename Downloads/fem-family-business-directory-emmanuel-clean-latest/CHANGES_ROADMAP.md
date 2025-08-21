# FEM Family Business Directory - Changes Roadmap

## Overview
This document outlines all the planned changes and improvements for the FEM Family Business Directory application, organized by priority and implementation complexity.

---

## 🚀 Phase 1: Immediate UI/UX Changes (Today)

### 1. Theme Color Change
**Priority**: High | **Effort**: Low | **Files**: `tailwind.config.ts`, CSS files
- **Current**: Navy (#1A1F2C), Terracotta (#C84B31), Gold (#FFBD59)
- **New Theme**: [To be decided - need color palette]
- **Implementation**: Update color variables in Tailwind config and replace throughout components

### 2. Hero Section Image Changes
**Priority**: High | **Effort**: Low | **Files**: `src/components/home/Hero.tsx`
- **Current**: Church leader images in carousel
- **New**: [To be specified - what type of images?]
- **Implementation**: Replace image sources in carousel array

### 3. Directory Search Button Removal
**Priority**: High | **Effort**: Low | **Files**: `src/pages/DirectoryPage.tsx`
- **Current**: Two search buttons (one in hero, one in directory)
- **Change**: Remove duplicate search button from directory page
- **Implementation**: Remove the search button from directory filters section

### 4. Business Count Update
**Priority**: High | **Effort**: Low | **Files**: `src/components/home/Hero.tsx`, `src/pages/DirectoryPage.tsx`
- **Current**: "500+ Members"
- **New**: "1000+ Local Businesses"
- **Implementation**: Update text in hero section and stats

---

## 🔧 Phase 2: Core Feature Enhancements (Today)

### 5. OTP Validation Implementation
**Priority**: High | **Effort**: Medium | **Files**: New OTP components, registration pages
- **Current**: Basic form validation
- **New**: Phone/email OTP verification system
- **Implementation**:
  - Create OTP input component
  - Add OTP verification to registration flow
  - Integrate with backend for OTP generation/verification

### 6. Featured Section Rating Criteria
**Priority**: High | **Effort**: Medium | **Files**: `src/components/home/FeaturedBusinesses.tsx`
- **Current**: Manual selection
- **New**: Auto-select based on rating and review count
- **Implementation**: 
  - Add rating/review filtering logic
  - Update featured business selection algorithm

### 7. Registration Product/Service Specification
**Priority**: High | **Effort**: Medium | **Files**: Registration forms, onboarding
- **Current**: Generic business registration
- **New**: Specify if business has Products, Services, or Both
- **Implementation**:
  - Add radio buttons/checkboxes to registration form
  - Update business profile structure
  - Modify onboarding flow

### 8. Optional Photo Upload
**Priority**: Medium | **Effort**: Low | **Files**: Registration forms
- **Current**: No photo upload
- **New**: Optional photo upload during registration
- **Implementation**: Add file upload component to registration forms

---

## 🎨 Phase 3: Visual Improvements (Today)

### 9. Directory Image Format Changes
**Priority**: Medium | **Effort**: Medium | **Files**: `src/pages/DirectoryPage.tsx`, `src/components/directory/BusinessList.tsx`
- **Current**: Square images
- **New**: Rectangular images for products and services
- **Implementation**:
  - Update image container aspect ratios
  - Modify grid/list view layouts
  - Ensure responsive behavior

### 10. Review Profile Images
**Priority**: Medium | **Effort**: Low | **Files**: Review components
- **Current**: Square profile images
- **New**: Rounded profile images
- **Implementation**: Update CSS classes for profile images

### 11. Remove Contact Buttons
**Priority**: Medium | **Effort**: Low | **Files**: Directory page, business list components
- **Current**: Contact buttons on services/products
- **New**: Remove contact buttons, add review count instead
- **Implementation**: 
  - Remove contact button components
  - Add review count display
  - Update business cards layout

---

## 🔍 Phase 4: Enhanced Filtering & Discovery (Today)

### 12. Add Top Rated/Popular Filter
**Priority**: Medium | **Effort**: Medium | **Files**: `src/pages/DirectoryPage.tsx`
- **Current**: Basic filters (county, category, rating)
- **New**: Add "Top Rated" and "Popular" filter options
- **Implementation**:
  - Add new filter options to sidebar
  - Implement sorting logic for top rated/popular
  - Update filter state management

### 13. Remove Stock Alerts
**Priority**: Low | **Effort**: Low | **Files**: Directory page, product components
- **Current**: "In Stock" indicators
- **New**: Remove stock status display
- **Implementation**: Remove stock-related UI elements

### 14. Product Business Links
**Priority**: Medium | **Effort**: Low | **Files**: Directory page
- **Current**: Products show business name
- **New**: Clickable links to main business page
- **Implementation**: Add navigation links to business names in product listings

---

## 📊 Phase 5: Business Management Features (Today)

### 15. Business Activity Tracking
**Priority**: Medium | **Effort**: High | **Files**: New components, business dashboard
- **Current**: No activity tracking
- **New**: Track seller activity (views, inquiries, etc.)
- **Implementation**:
  - Create activity tracking system
  - Add activity dashboard for business owners
  - Implement analytics tracking

### 16. Product Archiving
**Priority**: Medium | **Effort**: Medium | **Files**: Business dashboard, product management
- **Current**: No archiving functionality
- **New**: Allow sellers to archive products
- **Implementation**:
  - Add archive/unarchive functionality
  - Create archived products view
  - Update product listing logic

---

## 🔗 Phase 6: Backend Integration (Today)

### 17. Django Database Connection
**Priority**: High | **Effort**: High | **Files**: API integration, data models
- **Current**: Mock data
- **New**: Connect to existing Django backend
- **Implementation**:
  - Set up API client configuration
  - Replace mock data with API calls
  - Update data models to match Django schema
  - Implement error handling for API failures

---

## 🚀 Future Phases (Later Versions)

### Phase 7: Chat Functionality
- Real-time messaging between users and businesses
- Message history and notifications
- File sharing capabilities

### Phase 8: Advanced Business Features
- Inventory management system
- Order processing
- Payment integration
- Business analytics dashboard

### Phase 9: Inventory Tracking
- Real-time stock levels
- Low stock alerts
- Automated inventory updates

---

## 📋 Implementation Checklist

### Today's Priority Tasks:
- [ ] **Theme Color Change** - Update color palette
- [ ] **Hero Images** - Replace with new images
- [ ] **OTP Validation** - Implement verification system
- [ ] **Featured Section** - Add rating criteria
- [ ] **Business Count** - Update to 1000+
- [ ] **Directory Search** - Remove duplicate button
- [ ] **Registration Flow** - Add Products/Services specification
- [ ] **Image Formats** - Change to rectangular
- [ ] **Contact Buttons** - Remove and add review counts
- [ ] **Filters** - Add Top Rated/Popular
- [ ] **Django Integration** - Connect to backend

### Files to Modify:
1. `tailwind.config.ts` - Theme colors
2. `src/components/home/Hero.tsx` - Hero images and business count
3. `src/pages/DirectoryPage.tsx` - Search button, filters, image formats
4. `src/components/home/FeaturedBusinesses.tsx` - Rating criteria
5. Registration components - OTP, photo upload, product/service spec
6. API integration files - Django connection
7. Review components - Profile image styling

### New Files to Create:
1. OTP validation components
2. Business activity tracking components
3. Product archiving components
4. API client configuration
5. Enhanced filter components

---

## 🎯 Success Metrics

### Phase 1 Success:
- [ ] All UI changes implemented and tested
- [ ] OTP validation working end-to-end
- [ ] Django backend connected and functional
- [ ] All visual improvements completed

### Phase 2 Success:
- [ ] Business activity tracking operational
- [ ] Product archiving functional
- [ ] Enhanced filtering working
- [ ] All registration improvements complete

---

## 📝 Notes

- **Priority**: Focus on Phase 1 and 2 for today's implementation
- **Testing**: Each change should be tested individually before moving to next
- **Backup**: Create backup of current working state before major changes
- **Documentation**: Update component documentation as changes are made
- **Performance**: Monitor app performance after Django integration

---

*Last Updated: [Current Date]*
*Next Review: After Phase 1 completion* 