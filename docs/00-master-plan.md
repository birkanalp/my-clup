# MyClup Master Plan

## 1. Product Vision

MyClup is a gym membership, class, coaching, communication, and discovery platform.

Core value proposition:

- Gyms manage members, packages, payments, attendance, instructors, classes, campaigns, and communication from one system.
- Instructors manage schedules, member progress, workouts, and direct communication.
- Members track memberships, classes, progress, and conversations from a simple mobile experience.
- The platform creates a network effect by allowing members to discover nearby gyms and connect with new services.
- The platform is multilingual across all client-facing surfaces from day one.

The most critical feature is chat:

- WhatsApp-like experience
- Very low friction
- Fast message send/receive
- Media support
- Read states
- Group and 1:1 conversations
- Tight integration with gym workflows

## 2. Product Suite

### 2.1 Apps and Panels

1. User App
   Normal members, built with Expo.
2. User Admin App
   Gym owners, managers, instructors, built with Expo.
3. User Admin Panel
   Gym-side web panel for gym owners and instructors, built with Next.js.
4. Admin Panel
   Internal super-admin system for platform operators, built with Next.js.
5. Website
   SEO-first marketing and information website, built with Next.js.

### 2.2 Core Personas

- Member
- Prospective member
- Gym owner
- Branch manager
- Instructor / coach
- Reception / front desk
- Sales staff
- Platform support admin
- Platform finance / operations admin

## 3. Business Domains

### 3.1 Membership Management

- Member registration
- Membership package definitions
- Package renewals
- Freezes / pauses
- Cancellations
- Trial memberships
- Family / couple packages
- Corporate memberships
- Multi-branch entitlements
- Add-on services
- Digital member card / QR access

### 3.2 Class and Appointment Management

- Studio classes
- PT sessions
- Group workouts
- Instructor schedules
- Waitlist management
- Booking / cancellation rules
- Class attendance check-in
- Capacity management
- Substitute instructor assignment
- Calendar-based planning

### 3.3 Chat and Communication

- 1:1 chat
- Member to gym support chat
- Member to instructor chat
- Group chats
- Broadcast messages
- Campaign messages
- Media, document, and voice note sharing
- System-triggered conversation shortcuts

### 3.4 Training and Progress

- Workout plans
- Exercise logs
- Body measurements
- Progress photos
- Nutrition notes
- Instructor feedback
- AI-assisted workout text structuring

### 3.5 Discovery Marketplace

- Nearby gym discovery
- Gym profiles
- Reviews and ratings
- Trial session booking
- Compare plans
- Map and filter search

### 3.6 Revenue and Growth

- Membership payments
- Payment reminders
- Lead capture
- Conversion funnels
- Campaigns and promotions
- Retention workflows
- Churn analysis
- Ad / campaign sending to members

## 4. Experience Principles

- Mobile-first, extremely fast workflows
- Chat must feel instant and familiar
- Two-tap completion for common tasks
- Low training requirement for gym staff
- Clean separation between gym data and platform admin data
- Strong permission model by role
- Multilingual by default, with Turkish as the initial primary locale
- Notification-driven engagement

## 4.1 Localization and Internationalization

Localization is a core product requirement for:

- User App
- User Admin App
- User Admin Panel
- Admin Panel
- Website

Platform-level localization defaults:

- All client text should be translation-driven, not hardcoded in screens
- Dates, times, numbers, currencies, and measurement units must be locale-aware
- Notifications, campaigns, and chatbot content must support localization
- Public website and discovery pages must support locale-aware SEO
- User language preference should be stored and respected across surfaces
- Gym-managed public content should support multi-language variants where applicable

## 5. Cross-Product Feature Set

### 5.1 Identity and Access

- Email login
- Phone login with OTP
- Social login
- Role-based access control
- Gym / branch switching
- Session management
- Trusted device handling
- Audit logs for critical actions

### 5.2 Member Profiles

- Personal info
- Emergency contact
- Health notes / waivers
- Membership status
- Branch affiliation
- Attendance history
- Payment history
- Chat history
- Progress history
- Documents and signed forms

### 5.3 Instructor Tools

- Weekly availability
- Calendar management
- Class creation and editing
- Workout program entry
- AI formatting of free-text workout plans
- Session notes
- Performance tracking
- Member feedback

### 5.4 Payments and Billing

- Online payment
- In-club payment logging
- Installments
- Invoices
- Failed payment handling
- Debt / receivable tracking
- Automatic reminders
- Promotional discount codes

### 5.5 Notifications

- Push notifications
- In-app notifications
- Email notifications
- SMS for critical flows
- Booking reminders
- Payment reminders
- Chat notifications
- Campaign notifications

### 5.6 AI Opportunities

- Workout text cleanup and structuring
- Exercise extraction from natural language
- Smart member support suggestions
- Churn risk flagging
- Lead quality scoring
- Campaign copy suggestions
- FAQ assistant for gyms
- Summary generation for long chat threads
- Translation and rewrite assistance for multilingual content

## 6. Chat Strategy

Chat is the flagship differentiator and should be designed as a core platform layer, not a side feature.

### 6.1 Primary Use Cases

- Member asks gym about membership or schedule
- Instructor follows up after training
- Front desk answers operational questions
- Gym broadcasts updates to members
- Staff coordinate internally
- Sales team converts leads through chat

### 6.2 Chat Capabilities

- WhatsApp-like conversation list
- Pinned chats
- Unread counters
- Typing indicators
- Read receipts
- Attachments
- Voice notes
- Quick replies
- Message reactions
- Search in conversation
- Message forwarding
- Reply to message
- Templates for common replies
- Conversation tags
- Assign conversation to staff
- Chat-to-member-profile shortcut
- Chat-to-payment / booking shortcut

### 6.3 Operational Enhancements

- Auto-open chat when a lead signs up
- Booking confirmation chat thread
- Payment reminder message templates
- AI draft replies for staff
- Escalation rules for unanswered chats
- SLA tracking for gym response times

## 7. Suggested Data Model Domains

- Users
- Roles
- Gyms
- Branches
- Instructors
- Members
- Leads
- Membership plans
- Membership instances
- Payments
- Invoices
- Classes
- Bookings
- Attendance
- Workout plans
- Locale-aware content resources
- Exercises
- Progress logs
- Chats
- Messages
- Campaigns
- Notifications
- Reviews
- Discovery listings
- Audit logs

## 8. Security and Compliance

- Tenant isolation per gym
- Admin impersonation with audit trail
- Encryption for sensitive data
- Secure media storage
- Consent tracking
- Privacy policy and terms acceptance
- KVKK / GDPR-aware data handling
- Data export and deletion workflows
- Moderation tools for abuse / spam

## 8.1 Localization Governance

- Legal and policy text should be versioned per locale
- Consent acceptance should record the locale shown to the user
- Missing translations must fall back safely to a default locale
- Translation changes for public, legal, and campaign content should be reviewable

## 9. Reporting and Analytics

- Active members
- New memberships
- Churn rate
- Class fill rate
- Instructor utilization
- Revenue by branch
- Overdue payments
- Lead conversion
- Campaign performance
- Chat response times
- Member retention cohorts

## 10. Delivery Phases

### Phase 1: Foundation MVP

- Authentication and roles
- Gym, branch, member core records
- Membership management basics
- Basic class scheduling
- Basic booking and attendance
- Basic 1:1 chat
- User App core profile and membership views
- User Admin web and mobile core management
- Website marketing pages

### Phase 2: Operational Depth

- Payments and billing
- Advanced booking rules
- Instructor calendar
- Push notifications
- Group chat
- Workout programming
- Progress tracking
- Reporting dashboards

### Phase 3: Growth and Marketplace

- Nearby gym discovery
- Trial booking
- Ratings and reviews
- Campaign engine
- Lead pipeline
- Ad targeting to platform users
- Advanced AI assistance

### Phase 4: Scale and Intelligence

- Automation workflows
- Churn prediction
- Recommendation engine
- Smart scheduling
- Multi-country readiness
- Deeper finance controls

## 11. Recommended Initial Priorities

If execution must be staged tightly, prioritize:

1. Gym/member data model
2. Membership lifecycle
3. Chat
4. Class scheduling and booking
5. Payments and reminders
6. Instructor calendar and workout tools
7. Discovery marketplace

## 12. Add-on Packages

Gyms can activate optional, independently purchasable modules on top of their core subscription. Each package targets a specific growth or operational need.

| Package                   | Purpose                                                        |
| ------------------------- | -------------------------------------------------------------- |
| AI Chatbot                | 24/7 automated member support with human handoff               |
| Platform Reklamcılığı     | Targeted ads to other platform users via discovery and push    |
| Üye Koruma                | Block other gyms from advertising to the gym's own members     |
| Gelişmiş Analitik         | Churn prediction, cohort analysis, revenue projection          |
| Toplu SMS / WhatsApp      | Bulk and trigger-based messaging via off-platform channels     |
| Dijital Sözleşme & E-imza | Mobile contract signing and legal archiving                    |
| CRM & Otomasyon           | Drip campaigns, retention workflows, lead nurturing automation |
| White-label Uygulama      | Gym's own branded app on App Store and Play Store              |
| Entegrasyon Paketi        | Muhasebe (Logo/Mikro/Luca), Google Ads, Instagram Leads        |
| Öncelikli Destek          | Dedicated support channel with SLA guarantees                  |

See `docs/06-addon-packages-plan.md` for full specifications.

## 13. Documentation Structure

- `docs/00-master-plan.md`
- `docs/01-user-app-plan.md`
- `docs/02-user-admin-app-plan.md`
- `docs/03-user-admin-panel-plan.md`
- `docs/04-admin-panel-plan.md`
- `docs/05-website-plan.md`
- `docs/06-addon-packages-plan.md`
