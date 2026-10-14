# Changelog

## [Unreleased]

### Added

- Existing Setting Detection
- Automatic Evidence Reuse
- Component Detail View
- Evidence Count display

### Changed

- Discovery now searches for existing Components in the current workspace before creating new ones.

### Fixed

- Duplicate Setting creation from repeated observations.

### Security

- Existing workspace isolation preserved.

### Known Issues

- Existing Component selection UI still pending (planned for v0.2.0-alpha.2).

---

## [v0.1.0] - Phase 1 Foundation

### Added

- User authentication
- Automatic profile creation
- Automatic Personal OS workspace creation
- Workspace membership provisioning
- Behavioral Debugger
- Debug Session persistence
- Analysis workflow
- Candidate System Component creation
- Observation creation
- Evidence linkage
- Settings architecture
- Experiments architecture
- Versioning architecture

### Changed

- Workspace lookup changed from membership-based lookup to direct ownership lookup.

### Fixed

- Missing authenticated PostgreSQL role permissions.
- Debug Session persistence failure.
- Workspace-resolution failures.
- Diagnostic Events migration now grants SELECT and INSERT privileges to authenticated users.
- Resolved LOG-001 Self-Test failure caused by PostgreSQL table permissions.

### Security

- Row Level Security enabled.
- Workspace isolation verified.
- Cross-user access blocked.
