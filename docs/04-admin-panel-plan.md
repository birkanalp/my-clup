# Admin Panel Plan

## 1. Purpose

The Admin Panel is the internal platform operations system used by MyClup admins.

Primary goals:

- Manage platform-wide operations
- Support gyms and users
- Monitor growth, abuse, and revenue
- Control listings, campaigns, and permissions
- Govern locale rollout, translations, and multilingual content quality

## 2. Internal Roles

- Super admin
- Support admin
- Finance admin
- Growth admin
- Content / moderation admin
- Technical operations admin

## 3. Functional Areas

### 3.1 Platform Dashboard

- Total gyms
- Total active members
- Total messages sent
- Total bookings
- Platform revenue
- New signups
- Churn overview
- Alerts and incidents

### 3.2 Gym Management

- Approve new gyms
- View gym profiles
- Manage subscription tiers
- Suspend or restrict gyms
- Branch overview
- Usage statistics
- Health score

### 3.3 User Management

- Search any member or staff user
- View profile summary
- Support actions
- Account verification
- Suspensions / bans
- Data export / deletion support

### 3.4 Chat Oversight

- Abuse reports
- Spam detection
- Flagged conversations
- Message volume monitoring
- SLA monitoring
- Template governance

### 3.5 Listing and Marketplace Moderation

- Gym listing approvals
- Review moderation
- Featured placement controls
- Category management
- Discovery quality checks

### 3.6 Campaign and Ad System

- Manage ad inventory
- Approve campaign content
- Audience governance
- Billing for campaigns
- Performance analytics

### 3.7 Billing and Platform Finance

- Gym subscription billing
- Commission logic
- Invoice generation
- Payment reconciliation
- Refund handling
- Revenue reporting

### 3.8 Support Tools

- Ticketing or support queue
- Gym impersonation with audit log
- Session troubleshooting
- Incident notes
- Internal comments

### 3.9 CMS / Website Control

- Static content editing
- FAQ management
- Blog / SEO content management
- Legal page editing
- Homepage blocks
- Locale-aware content publishing oversight

### 3.10 Localization Operations

- Manage supported locales
- Review translation coverage
- Oversee legal and policy content per locale
- Approve translated campaign templates where needed
- Control locale rollout by product surface
- Monitor locale-specific SEO and content quality

## 4. Governance and Safety

- Full audit logs
- Role-based internal access
- Sensitive action confirmation
- Fraud monitoring
- Abuse handling
- Content moderation workflow
- Translation change auditability

## 5. Analytics

- Platform GMV
- Active gyms
- Member growth
- Discovery conversion
- Campaign revenue
- Chat utilization
- Support workload
- Locale usage and translation coverage

## 6. MVP Scope

- Internal auth
- Platform dashboard
- Gym management
- User lookup
- Basic support tools
- Billing oversight
- Content management basics
- Locale management basics

## 7. Future Enhancements

- Rule engine for auto-moderation
- ML-based fraud detection
- Revenue forecasting
- Cohort analytics
- Internal incident management

## 8. Implementation references

- Platform admin UI shell and QA gates: **`docs/21-web-platform-admin-qa.md`**
- Audited elevated actions and impersonation: **`docs/23-platform-audit-elevated-actions.md`**
