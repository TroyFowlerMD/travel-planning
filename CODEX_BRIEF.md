# Travel Planning - Project Brief

## Overview
A comprehensive travel tracking and flight monitoring system that helps users track travel ideas, monitor flight prices, and receive intelligent alerts for optimal booking windows. The system emphasizes great layout, automation, and data-driven decision making.

## Core Features
- **Flight Tracking**: Monitor specific routes and price history
- **Travel Ideas**: Capture and organize travel inspirations with destinations, dates, and budget
- **Smart Alerts**: Notify users of price drops, deal windows, and significant changes
- **Automation**: Auto-refresh flight data, trend analysis, and recommendation engine
- **Dashboard**: Visual overview of tracked flights, upcoming trips, and deal alerts

## Tech Stack

### Frontend
- **Framework**: React or Vue.js (lightweight, component-based)
- **Styling**: Tailwind CSS (rapid, responsive layout)
- **State Management**: Zustand or Pinia (minimal boilerplate)
- **Charts/Visualization**: Chart.js or Recharts (price trends, analytics)
- **HTTP Client**: Axios or Fetch API

### Backend
- **Runtime**: Node.js (Express.js) or Python (FastAPI)
- **Database**: PostgreSQL (relational data) + Redis (caching, alerts queue)
- **Job Queue**: Bull (Node.js) or Celery (Python) for scheduled tasks
- **Real-time**: WebSockets (Socket.io) for live alert notifications

### External APIs
- **Flight Data**: Amadeus API, Google Flights API, or Skyscanner API
- **Email Alerts**: SendGrid or Mailgun
- **Monitoring**: Sentry (error tracking)

### DevOps
- **Hosting**: Vercel (frontend) + Railway/Render (backend)
- **Database Hosting**: Railway or Supabase
- **CI/CD**: GitHub Actions
- **Containerization**: Docker (optional, for local dev and production)

## API Routes

### Flights
- `GET /api/flights` - List all tracked flights
- `POST /api/flights` - Create new flight tracking
- `GET /api/flights/:id` - Get flight details with price history
- `PUT /api/flights/:id` - Update flight tracking preferences
- `DELETE /api/flights/:id` - Stop tracking flight
- `GET /api/flights/:id/history` - Get price history data

### Travel Ideas
- `GET /api/ideas` - List all travel ideas
- `POST /api/ideas` - Create new travel idea
- `GET /api/ideas/:id` - Get idea details
- `PUT /api/ideas/:id` - Update travel idea
- `DELETE /api/ideas/:id` - Delete travel idea
- `POST /api/ideas/:id/convert` - Convert idea to active flight tracking

### Alerts
- `GET /api/alerts` - Get user alerts
- `GET /api/alerts/settings` - Get alert preferences
- `PUT /api/alerts/settings` - Update alert thresholds
- `POST /api/alerts/:id/dismiss` - Dismiss alert
- `GET /api/alerts/email-history` - Get sent email log

### Dashboard
- `GET /api/dashboard/summary` - Overview stats (tracked flights, alerts, deals)
- `GET /api/dashboard/trending` - Trending routes and deals

## Alert Thresholds

### Price Drop Alerts
- **Default Trigger**: 10% price decrease from tracked baseline
- **Minimum Absolute Change**: $15 USD (prevents noise from small changes)
- **Frequency**: Maximum 1 alert per route per day
- **Lookback Window**: Compare against 7-day average price

### Optimal Booking Window
- **Trigger**: When route drops below historical 25th percentile (good deal threshold)
- **Frequency**: Once per 14-day period per route
- **Context**: Include price trend, historical range, and days-to-departure

### Route Availability Alerts
- **Trigger**: When previously unavailable route becomes bookable
- **Minimum Seats**: Only alert if multiple airlines have availability
- **Frequency**: Once per availability window

### Expiration Alerts
- **Trigger**: 48 hours before price hold expires (if applicable)
- **Frequency**: Single alert per price hold
- **Action**: Recommend immediate booking or re-evaluate

### Deal Expiration
- **Trigger**: When a flight transitions from "good deal" back to baseline price
- **Frequency**: Once per transition
- **Purpose**: Urgency signal for interested travelers

## Automation & Background Jobs

### Scheduled Tasks
- **Flight Price Refresh**: Every 6 hours for active tracking
- **Trend Analysis**: Daily at 2 AM UTC (compute 7/14/30-day trends)
- **Alert Digest**: Daily at 8 AM user's timezone (email summary)
- **Price History Cleanup**: Weekly (archive data older than 1 year)
- **Stale Route Removal**: Monthly (remove tracking if no price changes in 60 days)

### Real-time Features
- WebSocket push for instant alerts
- Email notifications for time-sensitive deals
- In-app notification badge with unread count

## Data Model (High-Level)

### Users
- ID, email, timezone, preferences, created_at, updated_at

### Travel Ideas
- ID, user_id, destination, departure_date_range, budget, notes, status, created_at

### Flights (Tracked)
- ID, user_id, origin, destination, departure_date, return_date (if round-trip), airlines (filter), baseline_price, alert_threshold, active, created_at, last_refreshed_at

### Price History
- ID, flight_id, price, currency, airline, seats_available, timestamp

### Alerts
- ID, user_id, flight_id, type (price_drop, booking_window, availability), trigger_value, message, dismissed_at, sent_at

### Alert Settings
- ID, user_id, price_drop_percentage, min_absolute_change, max_alerts_per_day, email_enabled, push_enabled

## Success Metrics

- **User Engagement**: Daily active users, flights tracked per user
- **Alert Accuracy**: False positive rate (irrelevant alerts), user dismissal rate
- **Savings Impact**: Avg. savings per booked flight, deals captured
- **System Health**: API response time (<500ms), price refresh success rate (>99%), alert delivery rate (>95%)

## MVP Scope (Phase 1)

1. User auth (email/password)
2. Create and manage flight tracking
3. Basic price history tracking (single API integration)
4. Price drop alert (10% threshold)
5. Simple dashboard (list view)
6. Email notifications

## Future Enhancements (Phase 2+)

- Multi-destination trip planning
- Flexible date range search
- Price prediction ML model
- Social features (share deals, recommendations)
- Mobile app
- Budget tracking and reporting
- Integration with calendar (Google Calendar, Outlook)
- Flight comparison matrix
- Loyalty program tracking (miles, points)
