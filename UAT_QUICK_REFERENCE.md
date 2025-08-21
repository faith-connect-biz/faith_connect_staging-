# UAT Quick Reference Card - FEM Family Business Directory

## 🚀 Quick Start Commands

### Frontend
```bash
cd fem-family-business-directory
npm install
npm run dev
# Access at: http://localhost:8080
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python manage.py runserver
# Access at: http://localhost:8000
```

## 👥 Test User Credentials

### Community Users
| Partnership Number | Password | Purpose |
|-------------------|----------|---------|
| TEST001 | Test12345 | General testing |
| TEST002 | Test12345 | Review testing |

### Business Users
| Partnership Number | Password | Purpose |
|-------------------|----------|---------|
| BUSINESS001 | Test12345 | Business management |
| BUSINESS002 | Test12345 | Product testing |

### Admin Users
| Partnership Number | Password | Purpose |
|-------------------|----------|---------|
| ADMIN001 | Admin12345 | Admin functions |

## 🏢 Test Business Data

### Sample Businesses
- **Test Restaurant** (Food & Beverage, Nairobi)
- **Test Tech Solutions** (Technology, Mombasa)  
- **Test Health Clinic** (Health & Wellness, Kisumu)

### Sample Products
- **Test Product A** ($50.00, In Stock)
- **Test Product B** ($75.00, In Stock)

## 📋 Test Case Quick Reference

### Phase 1: Authentication (Day 1)
- ✅ TC_001: User Registration
- ✅ TC_002: User Login  
- ✅ TC_003: Password Validation

### Phase 2: Business Management (Day 1-2)
- ✅ TC_004: Business Registration
- ✅ TC_005: Business Profile Management
- ✅ TC_006: Business Verification

### Phase 3: Directory (Day 2)
- ✅ TC_007: Business Directory Display
- ✅ TC_008: Search & Filtering
- ✅ TC_009: Business Detail Page

### Phase 4: Products (Day 3)
- ✅ TC_010: Add Product
- ✅ TC_011: Edit Product
- ✅ TC_012: Delete Product
- ✅ TC_013: Product Image Management

### Phase 5: Reviews (Day 3)
- ✅ TC_014: Submit Review
- ✅ TC_015: Review Display
- ✅ TC_016: Rating Calculations

### Phase 6: Profiles (Day 4)
- ✅ TC_017: Profile View
- ✅ TC_018: Profile Update
- ✅ TC_019: Password Change

### Phase 7: Admin (Day 4)
- ✅ TC_020: Admin Dashboard Access
- ✅ TC_021: Business Moderation
- ✅ TC_022: User Management

### Phase 8: Mobile (Day 5)
- ✅ TC_023: Mobile Responsiveness
- ✅ TC_024: Cross-Browser Compatibility
- ✅ TC_025: Touch Interactions

### Phase 9: Performance (Day 5)
- ✅ TC_026: Performance Testing
- ✅ TC_027: Security Testing
- ✅ TC_028: Load Testing

## 🔍 Common Test Scenarios

### User Registration Flow
1. Navigate to registration page
2. Enter partnership number: TEST001
3. Fill: First Name, Last Name, User Type, Password
4. Submit and verify redirect

### Business Registration Flow
1. Login as business user
2. Navigate to business registration
3. Fill business details (name, category, description, contact)
4. Upload image and submit

### Product Management Flow
1. Login as business owner
2. Go to business detail page
3. Click "Add Product"
4. Fill product form and submit
5. Verify product appears in list

### Review Submission Flow
1. Login as community user
2. Navigate to business detail page
3. Click "Write Review"
4. Rate (1-5 stars) and write review
5. Submit and verify display

## 🚨 Common Issues & Solutions

### Frontend Issues
| Issue | Solution |
|-------|----------|
| Port 8080 in use | `npx kill-port 8080` |
| Build errors | Clear cache: `npm run dev -- --force` |
| Component not loading | Check browser console for errors |

### Backend Issues
| Issue | Solution |
|-------|----------|
| Port 8000 in use | `npx kill-port 8000` |
| Database connection | Check `.env` file and PostgreSQL status |
| Migration errors | `python manage.py migrate --run-syncdb` |

### Authentication Issues
| Issue | Solution |
|-------|----------|
| Login fails | Verify partnership number and password |
| Token expired | Logout and login again |
| Permission denied | Check user type and role |

## 📱 Testing on Different Devices

### Desktop Testing
- **Chrome**: Primary testing browser
- **Firefox**: Secondary testing browser
- **Edge**: Windows compatibility testing
- **Safari**: Mac compatibility testing

### Mobile Testing
- **iOS Safari**: iPhone/iPad testing
- **Android Chrome**: Android device testing
- **Responsive Design**: Test various screen sizes

### Tablet Testing
- **iPad**: iOS tablet testing
- **Android Tablet**: Android tablet testing
- **Landscape/Portrait**: Both orientations

## 📊 Test Results Quick Log

### Test Case Result Template
```
TC_[Number]: [Status] - [Notes]
Example: TC_001: PASS - User registration works correctly
```

### Bug Report Quick Template
```
BUG_[Number]: [Title] - [Severity]
Example: BUG_001: Login button not working - Critical
```

### Daily Summary Template
```
Date: [Date]
Phase: [Phase Number]
Completed: [X] test cases
Issues: [Y] found
Blockers: [Z] identified
```

## 🎯 Success Criteria Quick Check

### Critical Features (Must Pass)
- ✅ User registration and login
- ✅ Business registration
- ✅ Directory browsing
- ✅ Product management
- ✅ Basic review system

### Performance Requirements
- ✅ Page load < 3 seconds
- ✅ Search response < 2 seconds
- ✅ Image loading < 5 seconds
- ✅ Smooth scrolling and navigation

### Security Requirements
- ✅ Authentication required for protected pages
- ✅ User data isolation
- ✅ Input validation working
- ✅ No unauthorized access

## 📞 Quick Support Contacts

### Technical Issues
- **Frontend**: [Frontend team contact]
- **Backend**: [Backend team contact]
- **Database**: [Database team contact]

### Business Questions
- **Requirements**: [Business analyst contact]
- **Process**: [Process owner contact]
- **Stakeholders**: [Project manager contact]

### UAT Coordination
- **UAT Lead**: [UAT coordinator contact]
- **Daily Standup**: [Time and location]
- **Escalation**: [Escalation process]

## ⚡ Quick Tips

### Testing Efficiency
- Use multiple browser tabs for parallel testing
- Keep test data consistent across sessions
- Document issues immediately when found
- Take screenshots of bugs for clarity

### Data Management
- Use unique test data for each test case
- Clean up test data after testing
- Avoid using production data
- Backup test environment before major changes

### Communication
- Report blockers immediately
- Update progress in daily standup
- Escalate critical issues quickly
- Keep stakeholders informed of progress

---

**Quick Reference Version**: 1.0
**Last Updated**: [Date]
**For Full Documentation**: See UAT_DOCUMENT.md and UAT_EXECUTION_GUIDE.md
