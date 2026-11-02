# MOMENTUM — PostgreSQL Database Schema

MOMENTUM uses PostgreSQL as the canonical source of truth with strict relational integrity and append-only audit histories.

---

## 1. Entity-Relationship Overview

```
User (1) ────< (N) CalendarEvent (1) ────< (N) EventRevision (Audit Log)
  │                      │
  │                      ├────< (N) ActivitySession ────< (N) ActivitySegment
  │                      │
  ├────< (N) Category    └──── (1) RecurrenceRule ────< (N) EventException
  │
  ├────< (N) Scenario ────< (N) ScenarioEvent
  │
  ├────< (N) Goal ────< (N) Milestone
  │
  └────< (N) DailySnapshot
```

---

## 2. Table Definitions

### `users`
- `id`: UUID (Primary Key)
- `email`: VARCHAR(255) (Unique)
- `password_hash`: VARCHAR(255)
- `display_name`: VARCHAR(100)
- `timezone`: VARCHAR(50) (Default: 'UTC')
- `preferences`: JSONB (`weekStartsOn`, `defaultEnvironment`, `snapInterval`, `reducedMotion`, etc.)
- `created_at`, `updated_at`: TIMESTAMPTZ

### `events`
- `id`: UUID (Primary Key)
- `user_id`: UUID (FK $\to$ `users.id`)
- `title`: VARCHAR(200)
- `description`: TEXT (Nullable)
- `category_id`: UUID (FK $\to$ `categories.id`)
- `start_at`: TIMESTAMPTZ
- `end_at`: TIMESTAMPTZ
- `timezone`: VARCHAR(50)
- `all_day`: BOOLEAN (Default: false)
- `status`: VARCHAR(20) (`planned`, `in_progress`, `completed`, `cancelled`, `missed`)
- `recurrence_id`: UUID (Nullable)
- `parent_event_id`: UUID (Nullable)
- `deleted_at`: TIMESTAMPTZ (Nullable)
- **Constraints**: `CHECK (start_at < end_at)`
- **Indexes**: `(user_id, start_at, end_at)`, `(category_id)`

### `event_revisions` (Append-Only Audit Log)
- `id`: UUID (Primary Key)
- `event_id`: UUID (FK $\to$ `events.id`)
- `user_id`: UUID (FK $\to$ `users.id`)
- `revision_number`: INTEGER
- `action`: VARCHAR(30) (`created`, `updated`, `rescheduled`, `resized`, `completed`, `cancelled`, `deleted`)
- `previous_state`: JSONB (Nullable)
- `new_state`: JSONB
- `recorded_at`: TIMESTAMPTZ (Default: `now()`)
- **Indexes**: `(event_id, revision_number) UNIQUE`, `(user_id, recorded_at)`

### `activity_sessions` & `activity_segments`
- Supports pausing, resuming, and discrete interval execution without drift.
- `duration_seconds`: Calculated from exact interval endpoints: $ended\_at - started\_at$.
