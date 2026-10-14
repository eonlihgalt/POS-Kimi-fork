# Personal OS Self-Test Reference

The Self-Test is read-only. Progress is based on completed checks, not a simulated timer. Reports provide a run ID, timestamps, overall HEALTHY/WARNING/FAILED status, results, and suggested actions.

Tests: AUTH-001 Authentication; DB-001 Debug Sessions/archive schema; DB-002 Observations; DB-003 Components; DB-004 Component Evidence; LOG-001 Diagnostic Events schema; INT-001 Evidence relationship integrity; EXP-001 Export prerequisites.

## Structured diagnostic events
`diagnostic_events` stores sanitized technical events for the authenticated user. Allowed fields are code, area, route, severity, safe technical message, and timestamp. Never write Debug Session text, Observations, triggers, thoughts, passwords, cookies, authentication tokens, session secrets, or export contents to this table.

Recent events are visible on `/diagnostics`. RLS restricts selection/insertion to `auth.uid() = user_id`.
