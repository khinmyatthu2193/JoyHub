# JoyHub Development Guide

This repository uses `PROJECT_STATUS.md` as the single source of truth for implementation progress.

## Working agreement

1. Read `PROJECT_STATUS.md` before starting work.
2. Work on the first unchecked item in the current phase unless the user requests a specific task.
3. Keep changes within the MVP scope described in `PRODUCT_SPEC.md`.
4. Run the relevant checks before marking an item complete.
5. Update the status, decision log, and "Last updated" note in the same change as the implementation.
6. Do not mark a phase complete while any acceptance check in that phase is unchecked.

## MVP boundaries

- Client-only React application.
- Persist data in local storage.
- No authentication, backend, database, AI generation, analytics, leaderboard, or cloud sync.
- Optimize the game experience for projectors, laptops, and tablets.

## Definition of done

A task is done when it is implemented, typed, manually usable, and covered by the available automated checks. A phase is done only when its acceptance checklist passes.

