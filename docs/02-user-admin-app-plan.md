# User Admin App Plan

## 1. Purpose

The User Admin App is the Expo mobile application for gym owners, managers, instructors, and front-desk staff who need to manage operations on the go.

Primary goals:

- Allow staff to manage members quickly from mobile
- Keep chat and urgent workflows available everywhere
- Enable instructors to run daily operations without a laptop
- Support multilingual staff usage and multilingual member communication

## 2. User Roles

- Gym owner
- Branch manager
- Instructor / coach
- Reception staff
- Sales staff

## 3. Main Mobile Sections

### 3.1 Dashboard

- Today’s class count
- Today’s appointments
- New messages
- Expiring memberships
- Pending payments
- Check-in summary
- Lead summary
- Quick actions

### 3.2 Members

- Search member
- Add new member quickly
- Edit member profile
- View membership status
- View payment status
- Attendance history
- Notes and tags
- Freeze / renew / cancel membership
- Upload documents

### 3.3 Chat

- Unified inbox
- Filter by unread / assigned / branch / tag
- 1:1 member conversations
- Group conversations
- Staff internal chats
- Broadcast send flow
- Saved replies
- Voice note support
- AI reply suggestions

### 3.4 Classes

- Today / week calendar
- Create class
- Edit class
- Check participant list
- Check in attendees
- Cancel or reschedule class
- Assign substitute instructor
- Capacity tracking

### 3.5 Appointments / PT

- Personal training booking list
- Instructor agenda
- Session notes
- Follow-up reminders
- Rebook session

### 3.6 Workouts

- Create workout plan from free text
- Enter movement name, reps, sets, notes
- Paste rough text
- Use AI to structure and clean the program
- Save reusable templates
- Assign workout to member
- Track completion status

### 3.7 Sales / Leads

- Add lead
- Lead source tracking
- Contact history
- Follow-up reminders
- Convert lead to member
- Promotional messaging

## 4. Critical Mobile Flows

### 4.1 Quick Member Registration

- Open add member
- Scan ID or enter basic info
- Assign membership package
- Collect payment or mark pending
- Open chat automatically

### 4.2 Front Desk Check-In

- Scan QR or search member
- Validate membership
- Show issues: expired, debt, freeze
- Allow manual override by permission

### 4.3 Instructor Daily Workflow

- View schedule
- Open next class
- Check attendance
- Send follow-up note
- Update workout plan
- Message members

### 4.4 Localization and Communication

- Staff can use the app in their preferred language
- Member language preference is visible in profile and chat context
- Quick replies, templates, and campaign drafts support multiple locales
- Registration flows can show localized legal and consent text

## 5. High-Impact Features

- Offline-friendly attendance draft mode
- One-tap “membership expiring” outreach
- One-tap debt reminder via chat
- Member timeline screen
- Quick tags like VIP, risk, PT, debt, beginner
- Photo upload for progress
- Internal staff notes hidden from members

## 6. AI Features

- Free-text workout cleanup
- Suggested follow-up message after missed class
- AI summary of member history
- Suggested churn-risk members
- Suggested campaign audience
- Translation and rewrite support for member-facing text

## 7. Permission Considerations

- Owners see all
- Managers see branch-scoped operations
- Instructors see assigned members and classes
- Reception sees registration and check-in only
- Sales sees lead and campaign tools

## 8. MVP Scope

- Staff auth
- Dashboard
- Member list and profile
- Membership actions
- Basic chat
- Class calendar
- Basic attendance
- Workout text editor with AI placeholder planning
- Staff UI localization and locale-aware message template groundwork

## 9. Future Enhancements

- Mobile POS integration
- Digital contract signing
- Staff performance metrics
- Camera-based document capture
- Smart auto-tagging of members
- Per-branch locale defaults and multilingual quick replies

## 10. QA and localization acceptance

See **`docs/19-mobile-admin-qa-localization.md`** for staff mobile test layers, `en`/`tr` parity rules, role-gated access test expectations, and release checklist.
