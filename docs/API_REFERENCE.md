# MOMENTUM — API Reference (`/api/v1`)

All API endpoints follow RESTful conventions, return ISO 8601 timestamps, use UUID identifiers, and provide request tracking via `x-request-id`.

---

## Authentication & User Profile
- `POST /api/v1/auth/register`: Create user account with bcrypt password hashing and issue HTTP-only `momentum_session` cookie.
- `POST /api/v1/auth/login`: Authenticate email/password credentials and set session cookie.
- `POST /api/v1/auth/logout`: Invalidate and clear session cookie.
- `GET /api/v1/auth/me`: Retrieve authenticated user profile and spatial preferences.
- `PATCH /api/v1/auth/preferences`: Update preferences (`weekStartsOn`, `defaultEnvironment`, `snapInterval`, `reducedMotion`, etc.).

---

## Event Management
- `GET /api/v1/events?from={ISO}&to={ISO}&timezone={tz}`: Fetch events intersecting the requested temporal window.
- `GET /api/v1/events/:id`: Fetch individual event by ID.
- `POST /api/v1/events`: Create a new temporal commitment with half-open validation ($start < end$).
- `PATCH /api/v1/events/:id`: Update event title, description, category, or time.
- `DELETE /api/v1/events/:id`: Soft delete an event and append a `deleted` revision.
- `POST /api/v1/events/:id/reschedule`: Reschedule event start and end boundaries.

---

## Historical Reconstruction & Snapshots
- `GET /api/v1/history/days/:date`: Reconstruct daily event state at the specified revision cursor.
- `GET /api/v1/history/snapshots/:date`: Retrieve serialized snapshot checkpoint for accelerated replay.
- `POST /api/v1/history/snapshots`: Create snapshot checkpoint.

---

## Scenarios & Future Planning
- `GET /api/v1/scenarios`: List future planning scenarios.
- `POST /api/v1/scenarios`: Create alternate planning branch.
- `POST /api/v1/scenarios/:id/apply`: Transactionally apply scenario events to the active calendar.

---

## Analytics
- `GET /api/v1/analytics/summary`: Retrieve commitment hours, free time, context switch count, and focus scores without double-counting overlaps.
