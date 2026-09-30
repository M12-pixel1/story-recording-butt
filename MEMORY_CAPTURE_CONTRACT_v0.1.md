# Story Capture -> Spatial Memory Adapter Contract v0.1

Status: DRAFT / capture boundary only  
Date: 2026-09-30

This project is a candidate capture UI for Hostaculture / European Living Library and private Family Memory. It is not the authoritative archive.

## Capture output

Each recording session should eventually hand off a bounded package:

- capture_ref;
- captured_at;
- media_type;
- local media reference/hash;
- participant/subject refs;
- consent_ref;
- allowed purposes;
- language;
- optional title/context supplied by the person;
- deletion/revocation handle.

## Required product separation

A recording begins in PRIVATE state.

It must not become public merely because it was recorded.

\`\`\`
CAPTURED_PRIVATE
 -> authoritative Spatial Memory contract
 -> optional transcript/semantic/3D derivation
 -> CURATED_CANDIDATE
 -> Human Gate
 -> PUBLIC export
\`\`\`

## UI requirements for future implementation

Before recording:
- clearly state what will be captured;
- distinguish private family memory from public cultural contribution;
- do not pre-select public sharing;
- allow recording without agreeing to public export.

After recording:
- playback;
- save privately;
- delete;
- separately propose for cultural/public use.

## Data rules

- browser session storage is not authoritative long-term storage;
- no real family recording belongs in the public source repository;
- derived transcript/translation/3D asset inherits provenance;
- AI-generated reconstructions must be marked derived;
- public export requires explicit permission/Human Gate;
- withdrawal/revocation must remain addressable after capture.

## Integration owner

Canonical governance/schema:
M12-pixel1/agentops-core
- docs/SPATIAL_MEMORY_CONTRACT_v0.1.md
- schemas/spatial_memory_asset_v0.1.json

This repo should implement only the capture-side adapter once that schema is accepted.
