# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Telegram bot for the GetMentor platform, running as an Azure Function. The bot allows mentors to manage client requests, update their profiles, and receive notifications about new mentorship opportunities. It uses PostgreSQL as the backend database and integrates with SendGrid for email notifications.

## Development Commands

### Build and Run
- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Compile TypeScript in watch mode
- `npm start` - Build and start Azure Functions locally (requires `func` CLI)
- `npm test` - Run tests (currently placeholder)

### Azure Functions
This project uses Azure Functions Core Tools. The function is configured in `getmentor-bot/function.json` and the compiled output goes to `dist/`.

## Architecture

### Entry Point
The main Azure Function HTTP trigger is in `getmentor-bot/index.ts`. It:
- Receives webhook requests from Telegram
- Initializes the Telegraf bot with session middleware
- Routes commands and menu interactions
- Returns HTTP 200 responses to Telegram

### Bot Structure
The Telegraf bot is configured with:
- **Session middleware** - Tracks user state across interactions
- **Common middleware** (`commonMiddleware`) - Attaches PostgreSQL storage and loads mentor data into context
- **Anonymous blocking** (`blockAnonymousMiddleware`) - Prevents access for users not registered as mentors
- **Menu system** (`telegraf-inline-menu`) - Interactive keyboard-based navigation

### Context Extension
The custom `MentorContext` extends Telegraf's context with:
- `storage: MentorStorage` - PostgreSQL database interface
- `mentor: Mentor` - Currently authenticated mentor
- `session` - Pagination state for requests/tags

### Data Layer
**MentorStorage Interface** (`lib/storage/MentorStorage.ts`):
- Defines methods for mentor and request operations
- Implemented by `PostgresStorage` class

**PostgresStorage** (`lib/storage/postgres/PostgresStorage.ts`):
- Manages PostgreSQL database interactions via pgx connection pool
- Implements three-tier caching with `node-cache`:
  - Mentors: 10 min TTL
  - Active requests: 10 min TTL
  - Archived requests: 100 min TTL
- Handles cache invalidation on status changes
- Swaps requests between active/archived caches based on status
- Uses `pgRowAdapter` to convert PostgreSQL rows to expected record format

### Data Models
**Mentor** (`lib/models/Mentor.ts`):
- Status: `pending`, `active`, `inactive`, `declined`
- Price tiers from free to 15000 руб
- Experience levels: 0-2, 2-5, 5-10, 10+ years

**MentorClientRequest** (`lib/models/MentorClientRequest.ts`):
- Status flow: `pending` → `contacted` → `working` → `done`
- Alternative flows: `unavailable`, `declined`, `reschedule`
- When status changes to `done`, `declined`, or `unavailable`, request moves from active to archived cache

### Commands
- `/start` - Initial bot setup, accepts secret code for mentor authentication
- `/menu` - Shows main menu with inline keyboard
- `/requests` - Shortcut to requests submenu
- `/profile` - Shortcut to profile editing submenu
- 8-character alphanumeric codes authenticate mentors via `TgSecret` field

### Menu System
The menu hierarchy is defined in `getmentor-bot/commands/`:
- **Main menu** (`main.ts`) - Root menu with profile, requests, and links
- **Requests menu** (`requests.ts`) - View and manage active/archived client requests
- **Profile menu** (`profile.ts`) - Edit mentor status, price, and other profile fields

Menu interactions use `telegraf-inline-menu` library for keyboard-based UIs. The `menuMiddleware` handles all menu routing under the `/` path.

### Monitoring & Analytics
- **Sentry** - Error tracking (configured in `lib/utils/sentry.ts`)
- **Application Insights** - Azure monitoring (configured in `lib/utils/appInsights.ts`)
- **Mixpanel** - User analytics for bot interactions

All errors are funneled through `reportError()` in `lib/utils/monitor.ts`, which sends to both Sentry and logs to console.

### Email Notifications
SendGrid integration in `getmentor-bot/sendgrid/`:
- `SessionCompleteMessage.ts` - Sent when session is marked as done
- `SessionDeclinedMessage.ts` - Sent when mentor declines a request

## Environment Variables
Required in `local.settings.json` for local development:
- `TELEGRAM_BOT_TOKEN` - Telegram bot API token
- `WEBHOOK_ADDRESS` - Webhook URL for Telegram
- `DATABASE_URL` - PostgreSQL connection string
- `TG_MENTORS_CHAT_LINK` - Link to private mentors chat

## Important Notes

### Authentication Flow
1. User starts bot with `/start`
2. Bot prompts for 8-character secret code
3. Code is matched against database `tg_secret` field in mentors table
4. On success, `telegram_chat_id` is saved to database
5. Mentor data is cached for subsequent requests

### Request Status Transitions
Status changes automatically move requests between caches:
- Active cache: `pending`, `contacted`, `working`, `reschedule`
- Archived cache: `done`, `declined`, `unavailable`

The `setRequestStatus` method in `PostgresStorage` handles cache swapping and updates the `last_status_change` timestamp in the database.

### PostgreSQL Schema
The bot expects these PostgreSQL tables:
- **mentors** table with columns: id (UUID), name, email, job_title, workplace, details, slug, legacy_id, tg_secret, telegram, telegram_chat_id, price, status, image, experience, calendar_url, auth_token, sort_order, created_at, updated_at
- **client_requests** table with columns: id (UUID), mentor_id (UUID FK), name, email, telegram, description, level, review, status, created_at, modified_at, scheduled_at, last_status_change, review_form_url, decline_reason, decline_comment

### Localization
All user-facing strings are in Russian and located in `getmentor-bot/strings/` directory.
