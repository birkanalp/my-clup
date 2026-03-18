# User Admin Panel Plan

## 1. Purpose

The User Admin Panel is the main web application for gyms, branches, instructors, managers, and operations teams. It is the most complete operational surface for running a gym business.

## 2. Product Goals

- Centralize gym operations
- Reduce manual work for membership and scheduling
- Make chat, sales, and service measurable
- Give gyms full visibility into members and revenue
- Support multilingual operations and multilingual gym-managed content

## 3. Information Architecture

### 3.1 Overview Dashboard

- Revenue summary
- Membership summary
- Upcoming renewals
- Attendance trends
- Class fill rates
- New leads
- Chat SLA indicators
- Staff activity

### 3.2 Member Management

- Member directory
- Advanced filtering
- Segments
- Member detail pages
- Membership lifecycle actions
- Payment and debt visibility
- Notes, tags, documents
- Past attendance and bookings
- Past workouts and progress history
- Communication history

### 3.3 Membership Plans

- Package builder
- Session-based plans
- Time-based plans
- PT package builder
- Trial package builder
- Freeze rules
- Branch restrictions
- Pricing and discount rules

### 3.4 Class and Calendar Management

- Calendar by branch
- Calendar by instructor
- Room / studio calendar
- Capacity planning
- Repeat rules
- Blackout dates
- Holiday overrides
- Instructor availability
- Waitlists

### 3.5 Instructor Workspace

- Instructor schedule editor
- Assigned members
- Workout programming page
- Free-text workout plan input
- AI cleanup and structuring
- Session notes
- Performance follow-ups
- Attendance by instructor

### 3.6 Chat Center

- Shared inbox
- Assignment rules
- Conversation ownership
- Team inbox
- Broadcast composer
- Templates
- Labels and automations
- Member context sidebar
- Search across all chats
- Media viewer

### 3.7 Sales and CRM

- Lead capture
- Pipeline stages
- Tasks and reminders
- Demo / trial scheduling
- Campaign tracking
- Conversion reporting

### 3.8 Billing and Finance

- Payments list
- Receivables
- Invoice management
- Discounts and promos
- Refund workflows
- Installment tracking
- Daily cash summary

### 3.9 Marketing and Campaigns

- Member segmentation
- Campaign builder
- Push / email / in-app / chat campaigns
- Re-engagement flows
- Birthday / anniversary campaigns
- Win-back campaigns
- Ad sending to system users
- Locale-targeted campaigns and translated templates

### 3.10 Discovery and Listing Management

- Public gym profile editor
- Branch photos
- Amenities
- Pricing highlights
- Trial offers
- SEO-friendly gym pages
- Reviews moderation
- Multi-language public listing fields

### 3.11 Reports

- Revenue reports
- Churn reports
- Renewal reports
- Attendance reports
- Instructor performance
- Campaign performance
- Chat performance
- Branch comparisons

## 4. Key Screens to Design Carefully

- Member 360 profile
- Calendar planner
- Shared inbox
- Workout program editor
- Campaign audience builder
- Billing dashboard
- Translation and locale management for gym-managed content

## 5. Chat-Centric Workflows

- New lead starts chat from website
- Sales sees lead in inbox
- Lead converted to member without losing chat history
- Expired member receives automated message
- Staff handles all questions from inbox with full member context

## 6. AI Features

- Workout parser from rough trainer notes
- AI-generated workout formatting
- Suggested customer service replies
- Chat summarization
- Campaign copy suggestions
- Churn risk highlights
- Forecasting for attendance and renewals
- Multi-language copy generation and rewrite support

## 7. Role and Permission Model

- Owner
- Admin manager
- Branch manager
- Instructor
- Reception
- Sales / marketing
- Finance

Permissions should support:

- Branch scoping
- Feature scoping
- Record scoping
- Action approval for sensitive operations

## 8. MVP Scope

- Auth and roles
- Dashboard
- Member management
- Membership plans
- Class calendar
- Basic billing
- Shared inbox
- Reports basics
- Staff UI localization and locale-aware content foundations

## 9. Future Enhancements

- Automation builder
- Webhooks / integrations
- Equipment and room management
- Franchise management
- Advanced accounting exports
- White-label branch pages
