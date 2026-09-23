## 0.9.61 - 2026-09-23

- Information architecture rebuilt: the sidebar is now navigation-only (search, new note, views, tags/folders) with no document list pinned at the bottom. The center routes between three states — Workspace Home (click 我的空间 or the home rail icon: recent documents, favorites, tag groups, view-all entry), Document List (click any view/tag/folder or type in search: card grid with full note actions; tasks and calendar render as list variants), and Document Reader (click any document card). The breadcrumb adapts per state (我的空间 / view name / document path) and the editor stays mounted, so returning to a document is instant. Sidebar header 我的空间 and the breadcrumb root are both clickable shortcuts back to Home.

## 0.9.60 - 2026-09-23

- Wide-block reading layout: the editor container widens to reading-width + 180px (~1030px at the default 900px setting) while every text block stays capped at the reading width and centered — code blocks, tables, and images now break out to the wider measure, symmetric around the text column. Small windows keep near-full-width content; long text lines remain comfortable. Verified in-app: body ~900px, code/table ~1030px, both centered.

## 0.9.59 - 2026-09-23

- Removed the AI actions section (copy markdown / prompt context / outline) from the Knowledge Assistant panel and the Share button from the App Header. The assistant panel now shows Overview, TOC, Properties, Related documents, and Export only; the header carries breadcrumb + last-edited.

## 0.9.58 - 2026-09-23

- Document header is now title-only: the meta line (updated/words/reading time) and tag chips under the title were removed — that information already lives in the Knowledge Assistant panel on the right, so the reading canvas stays clean.

## 0.9.57 - 2026-09-23

- Tightened the gap between the App Header divider and the document title (was ~65px of stacked paddings, now ~22px) so the title sits closer to the breadcrumb bar like Notion/Linear; narrow-viewport paddings scaled down to match.

## 0.9.56 - 2026-09-23

- Top layout rebuilt into three separated layers (Navigation / App Header / Document Header), moving the page from "web article reader" toward a desktop knowledge app: a new 48px App Header below the window bar carries the breadcrumb (workspace / folder / parent / title — folder and parent are clickable filters/jumps), the last-edited date, and a Share button that copies the document as Markdown for pasting anywhere. The Document Header now shows title + meta line + tag chips (click to filter) with proper top breathing room, and the body no longer hugs the top. Old in-canvas subpage breadcrumb merged into the App Header.

## 0.9.55 - 2026-09-23

- Panel-internal toggle buttons removed: the sidebar header no longer has a "collapse sidebar" button and the Knowledge Assistant header no longer has a fold button — the top bar switches are the single control point for both panels at every width.

## 0.9.54 - 2026-09-23

- Removed the expand button from the collapsed icon rail — the top bar sidebar toggle is now the single way to expand/collapse; the rail starts directly with the view icons.

## 0.9.53 - 2026-09-23

- Responsive sidebar with a proper collapse pattern instead of squeezing content: desktop (≥1280px) keeps the full 260px icon+text sidebar; tablet (980–1279px) auto-collapses to an 80px icon rail (view icons with separators and active highlight, plus new/settings/pin/hide); mobile (<980px) hides the sidebar entirely behind the top bar toggle. No font sizes shrink at any width.
- Sidebar reorganized: fixed area (workspace header, search, new note) → navigation (All / Favorites / Recent / Tasks / Archive / Trash / Calendar) → Tags and Folders are now collapsed-by-default sections with chevron + count (auto-expanding while one of their filters is active) → document list fills the rest. The icon rail switches the view and expands the sidebar in one click.

## 0.9.52 - 2026-09-23

- Fixed the right-panel TOC rows collapsing to slivers: the outline list is a constrained-height flex column, so its items were shrinking to fit (each row compressed below the text size on long documents). Items now keep their height and the list scrolls internally; max height also raised from 240px to 320px.

## 0.9.51 - 2026-09-23

- TOC readability hardening: level-2 entries now use the full text color (indent-only hierarchy), level-3 uses the muted gray with a 13px floor, and the right-panel overlay breakpoint moved from `max-width: 1280px` to `1279px` so a window that is exactly 1280 CSS px stays docked instead of half-switching to overlay mode.

## 0.9.50 - 2026-09-23

- Right panel table of contents is readable now: entries enlarged to 13.5px with the level-1 headings in full text color, sub-levels in progressively muted gray, and comfortable row height.

## 0.9.49 - 2026-09-23

- Desktop layout rebuilt as an AI Knowledge OS rather than a Markdown editor. Left sidebar is now a vertical knowledge navigation system: workspace header, search, new note, then a vertical nav list (All / Recent / Favorites / Tasks / Archive / Trash / Calendar) with the selected view highlighted, followed by vertical Folders and Tags sections (drag-to-classify and rename/delete kept) and the document list for the current view. The old horizontal view tabs, outline pane and bottom mode switch are gone; the document outline moved into the right panel.
- Right panel upgraded from metadata-only to a Knowledge Assistant (300px): Overview, clickable Table of Contents (jump to heading), Properties, Related documents, AI actions, and Export. AI actions are local clipboard helpers for working with LLMs — copy full document as Markdown, copy as a ready-to-paste prompt context (title + body + prompt lead-in), and copy the heading outline.
- Center document stays a floating border-less reading canvas (unchanged from 0.9.48).

## 0.9.48 - 2026-09-23

- Reading-first layout pass: the document no longer sits in a paper card — no border, no rounded rectangle, content floats directly on the background (Notion reading mode / Medium article feel). Sidebar (260px) and the info panel (280px) became full-bleed recessed columns with no borders or shadows, so the center document is clearly the hero and the two side columns just support reading. Top bar divider removed.
- De-duplicated the title: the sidebar "current document" summary card was removed, and when the note's own first H1 matches the note title it is hidden visually (display-only; document data is untouched), so the title renders exactly once above the meta line.
- Document header refined: larger serif title with an "updated 2026/09/23 · 4967 chars · ~10 min" style meta line (full date format).
- Default reading width raised to 900px and default line height to 1.8 (both still adjustable in settings).

## 0.9.47 - 2026-09-23

- Visual redesign toward a quiet Notion/Craft/Obsidian-style knowledge workspace (UI only, no logic changes). New warm-paper palette (#FAF8F3 background, #222 text, #64748B slate accent; the warm yellow #E8D7B5 is reserved for the selected note and text selection), serif document headings with sans body and JetBrains Mono code stacks, sidebar narrowed to 240px.
- The permanent right-side format toolbar is gone. Selecting text now shows a floating bubble toolbar (bold/italic/underline/strike/highlight/inline code/link plus an "Aa" trigger); the full format panel became an on-demand popover toggled from the top bar.
- New collapsible Document Info panel on the right: created/updated time, word count, reading time, tags & folder (click to filter, edit inline), related notes (backlinks), and one-click export (MD/PDF/HTML/TXT/JSON). On windows narrower than 1280px it behaves as an overlay like the format popover.
- The note title moved from the top bar into the editor as a large serif heading with a meta line (updated time · words · reading minutes); the top bar keeps only menu, sidebar toggle, panel toggles and save status.
- Default reading width dropped from 1120px to 850px (setting still adjustable 640–1600px).

## 0.9.46 - 2026-09-10

- Notes imported from a file now write their markdown back to the source file on every save (attachments inlined as data URLs). Previously edits lived only in the app database, so reopening the same file through another path re-imported the stale on-disk snapshot and looked like "edits were lost". Write-back failures (file moved/read-only) are logged and never block the note save.

# Changelog

## 0.9.45 - 2026-09-09

- Opening the same file via right-click/double-click now reuses the previously imported note (tracked by file path in note_meta) instead of silently creating a duplicate — this looked like "edits were not saved" because each reopen produced a fresh unedited copy. The file-path column is backfilled via ALTER TABLE on existing databases.

## 0.9.44 - 2026-09-08

- Nudged the top bar title 56px away from the left button group so it no longer overlaps the sidebar toggle on narrow windows; everything else unchanged.

## 0.9.43 - 2026-09-08

- Top bar title input keeps a fixed comfortable width (360px / 36vw, shrinkable on narrow windows) instead of stretching across the bar; the remaining space stays as the window drag area.

## 0.9.42 - 2026-09-08

- Fixed the compact (≤980px) layout scramble: the sidebar/workspace grid placements are scoped to the desktop top-bar (topbar ~ sibling selectors), and the workspace returns to column 1 in the single-column compact grid, so the editor is no longer squeezed into an implicit column.

## 0.9.41 - 2026-09-08

- Slash menu is now clamped to the viewport (measured before positioning), so it no longer gets cut off at the right/bottom window edge when the cursor is near the edge.
- Top bar title input can shrink (min 120px, ellipsis) on narrow windows instead of pushing the meta/status controls out.

## 0.9.40 - 2026-09-08

- Restored window dragging: the flexible title input had covered the whole top bar drag area; the title now keeps a fixed width and an elastic blank drag strip sits between the title and the right-side meta/status group.

## 0.9.39 - 2026-09-08

- Top bar title nudged 24px to the right so it no longer hugs the left button group (visual balance per feedback).

## 0.9.38 - 2026-09-08

- Merged top bar row polish: menu/title/meta/state share one 44px row.
- Final layout fix for the merged top bar: the app grid is now an explicit two-row layout (44px top bar spanning full width; sidebar column 1 and editor column 2 in the second row), and the top bar carries its own grid placement. Fixes the sidebar drawer climbing to the very top and overlapping the bar.

## 0.9.37 - 2026-09-08

- Fixed the compact-viewport layout after the top-bar merge: the sidebar drawer now starts below the 44px top bar instead of covering its left segment.

## 0.9.36 - 2026-09-08

- Merged the standalone brand strip into the top bar: the app menu (with all export/settings actions) now sits next to the title row, removing the separate 40px strip and giving the editor more height. The top bar doubles as the window drag area; buttons and inputs remain clickable.

## 0.9.35 - 2026-09-08

- Fixed block-reference jump not scrolling at all: ProseMirror does not expose "scrollDOM" on its view in this setup; the scroller is now found by walking up from the block to the nearest element with overflow auto/scroll (the .editor-wrap), then aligning the block near the top.

## 0.9.34 - 2026-09-08

- Fixed block-reference jump landing at the end of the note: after successfully locating the referenced block the editor no longer re-focuses the document end, which was scrolling the viewport back to the bottom.

## 0.9.33 - 2026-09-08

- Hardened the block-reference jump: failures in the locate-and-scroll path are now caught and logged instead of propagating through a React effect (which could blank the whole app); the editor focus-to-end fallback always runs.

## 0.9.32 - 2026-09-08

- Block-reference jump now aligns the referenced block near the top of the editor viewport (previously ProseMirror's minimal scroll left it stuck at the very bottom edge).

## 0.9.31 - 2026-09-08

- Clicking a block-reference card now jumps to the referenced block inside the source note: the editor scrolls to the matching paragraph (matched via the stored text snapshot), selects it, and flashes a highlight. Falls back to the top of the note when the source text no longer matches.

## 0.9.30 - 2026-09-08

- Fixed the block-reference picker always showing "no matching content": block extraction read a property that does not exist on serialized TipTap JSON; it now collects text from text/hardBreak nodes inside paragraphs, headings and lists.

## 0.9.29 - 2026-09-08

- Fixed slash menu truncation: all commands now show (cap raised to 16) and the new 子页面 / 引用笔记块 commands sit at the top.
- Fixed note drag & drop being dead: removed the mousedown preventDefault that suppressed native dragging.
- Removed the emoji icon / cover image feature per feedback (parent-id plumbing for sub-pages stays).
- Calendar view: defaults to selecting today, the selected day's notes list renders above the month grid, and the sidebar scrolls as a block instead of squashing the tag/folder chips.
- Fixed sub-page creation losing its title/parent: sanitizeNotePayload now passes parentId through; renderer console is mirrored into the debug log in dev.

## 0.9.28 - 2026-09-08

- Craft-style improvements batch:
  - Deleting a note no longer shows a confirm dialog; it moves to trash immediately with a toast offering Undo for 5 seconds (permanent delete from trash still confirms).
  - Notes support an emoji icon and a cover image: set them in the "编辑属性" panel, shown on list items, the editor header (cover banner + title badge), and the HTML export template.
  - Sidebar notes are draggable onto folder/tag chips to reassign them (drop on "全部文件夹" clears the folder).
  - New "日历" view in the sidebar: month grid with record dots, today highlight, and a per-day note list.
  - New "子页面" slash command creates a child note and inserts a clickable page-link card; a breadcrumb shows the parent path.
  - New "引用笔记块" slash command inserts a block-reference card picked from any note; references count as backlinks.
  - HTML export gained cover banner and emoji icon rendering.

## 0.9.27 - 2026-09-08

- Made the Windows window-controls overlay background transparent so the system caption buttons (— □ ×) float directly on the page; they now dim together with the modal backdrop instead of showing a bright detached patch when a confirm dialog opens.

## 0.9.26 - 2026-09-08

- Replaced the product icon everywhere (exe/installer/ICO, tray, file associations, in-editor title bar) with the new brand mark; trimmed the white border from the supplied artwork and applied transparent rounded corners. Icon generation now builds from `build/icon-source.png` instead of the legacy SVG.

## 0.9.25 - 2026-09-08

- Pasted Markdown source containing fenced code blocks is now parsed into real editor blocks via the shared `markdownToDoc` parser instead of being flattened into plain paragraphs, fixing scrambled code blocks and captions when pasting rich text from sources like FlowUs.
- Allowed remote `https:` images in the renderer CSP so pasted/imported external images render instead of showing broken icons.
- Fixed image-only clipboard HTML (`<p><img></p>` wrappers) leaving an empty line above the pasted image and pushing it to the next line.
- Replaced the drawn title bar logo with the real app icon.
- Registered `.md`/`.markdown`/`.txt` file associations: files open via Explorer right-click "Open with" or double-click and are imported as new notes, with single-instance argv forwarding.
- Compacted the sidebar view switch into a 3-column grid and tightened section spacing so the note list gets more vertical space.
- Added debug logging to the file-open import path behind `SUIJI_DEBUG_LOG`.

## 0.9.24 - 2026-06-26

- Replaced the hand-rolled Markdown import parser with a `markdown-it`-based flow so imported `.md` files now preserve common Markdown/GFM structure including blockquotes, task lists, nested lists, fenced code blocks, horizontal rules, images, tables, and common inline marks.

## 0.9.23 - 2026-06-23

- Fixed text drag selection in the editor by pausing hover-block DOM updates while the mouse button is held down and removing hover translation from normal text blocks.

## 0.9.22 - 2026-06-22

- Simplified content-protection PIN checks to use a fast session-oriented hash so unlocking the privacy overlay no longer waits on scrypt.
- Kept legacy scrypt PIN hashes readable and migrated them to the fast hash after a successful unlock, while leaving encrypted database and export KDF strength unchanged.

## 0.9.21 - 2026-06-22

- Removed the extra encrypted database flush from normal hide and minimize actions so content-protection unlock can return immediately instead of waiting behind a background encrypted write.
- Kept database flushing for explicit saves, app quit, and strong privacy locks while trimming the lock-screen unlock path.

## 0.9.20 - 2026-06-22

- Made normal hide/minimize content protection unlock instantly by keeping the already verified encrypted-session state alive, while still clearing the encrypted session for idle timeout, system lock, and suspend events.

## 0.9.19 - 2026-06-22

- Split interactive PIN verification from storage encryption strength so content-protection unlocks no longer pay the full database-encryption KDF cost during an already verified session.
- Added an explicit "unlocking" state on the privacy lock screen and avoided reloading notes when the local encrypted store is not locked.

## 0.9.18 - 2026-06-22

- Removed the duplicate settings-save status message so encryption changes show one clear rewriting-data prompt instead of two stacked hints.

## 0.9.17 - 2026-06-22

- Added a visible busy state while saving settings that rewrite local data, including disabling the settings form, preventing accidental modal close, and showing a clear "rewriting local data" status for encryption changes.

## 0.9.16 - 2026-06-22

- Raised the storage encryption scrypt work factor for newly encrypted local data and encrypted exports from `N=2^15` to `N=2^18`, while keeping older encrypted files readable through per-file KDF metadata.
- Added explicit KDF metadata for newly saved privacy PIN hashes so new or changed PINs can use the stronger scrypt parameters without breaking existing PINs.

## 0.9.15 - 2026-06-22

- Fixed note state persistence for delete, restore, favorite, archive, and pin actions by updating `updatedAt` and flushing those changes to disk immediately.
- Hardened startup reconciliation so per-note shadow files also repair SQLite rows when timestamps match but record state differs, preventing deleted notes from reappearing after restart.

## 0.9.14 - 2026-06-22

- Fixed collapsible-block dragging by turning the drag affordance into a real draggable handle instead of a button that intercepted the pointer event before ProseMirror could start a node drag.

## 0.9.13 - 2026-06-22

- Added a per-note encrypted-compatible shadow file alongside SQLite saves, and startup reconciliation from `notes/*.json`, so newly created or edited notes can be recovered even if the SQLite export path is interrupted.
- Updated local encryption reconfiguration to rewrite the new per-note shadow files as well as backups.
- Fixed crowded note-list panels by preventing note cards from shrinking in the scroll container and allowing compact titles to wrap without being squeezed by action buttons.

## 0.9.12 - 2026-06-22

- Fixed the real persistence regression in the immediate-save path: note writes now always mark the SQLite session dirty before either queued or immediate flush, so newly created notes and edits to existing notes are actually written into `suiji.db` instead of only appearing in the current session.
- Improved compact-sidebar note cards by letting titles wrap to two lines and reserving space for the action buttons, reducing title truncation when the record list gets crowded in the small panel layout.

## 0.9.11 - 2026-06-22

- Tightened auto-save semantics so `notes:save` now flushes the edited note to `suiji.db` before reporting success; the “已保存” state now means the latest edit is already on disk instead of only living in the in-memory SQLite session.

## 0.9.10 - 2026-06-22

- Fixed a persistence gap where newly created notes could still be only in the in-memory database for a short window; new notes and imported notes are now flushed to `suiji.db` immediately so closing the portable app or rebuilding right after creation no longer drops them.

## 0.9.9 - 2026-06-22

- Increased the note-list excerpt area to two visible lines so the正文摘要 under each title no longer gets clipped into an undersized single-line slot.

## 0.9.8 - 2026-06-22

- Refined the in-editor find panel into a clearer floating layout with grouped search, replace, navigation, and close actions so the popup reads more like the rest of the app's layered controls.
- Fixed find next/previous navigation so the editor content area now smoothly scrolls to the active match instead of only changing the text selection.

## 0.9.7 - 2026-06-22

- Extracted application menu and tray menu construction into `src/main/app-shell.ts`, so shell-level actions are no longer embedded directly inside the main process file.
- Added tests for the new app-shell templates to keep menu and tray entry structure stable during later UI and workflow changes.

## 0.9.6 - 2026-06-22

- Split the oversized main-process file by extracting security/encryption helpers into `src/main/security.ts`, HTML export rendering into `src/main/html-export.ts`, and note transfer helpers into `src/main/note-transfer.ts`.
- Kept the existing import/export and privacy behavior unchanged while moving those domains behind clearer module boundaries for later maintenance.
- Expanded the new `vitest` baseline with coverage for security helpers and note transfer parsing utilities.

## 0.9.5 - 2026-06-22

- Added encrypted export import support so `.suiji-note` and `.suiji-export` files can be brought back into the local library instead of being write-only.
- Added a dedicated “导入加密” action in the settings data tools and unified encrypted-file PIN error messages across backup restore and encrypted export import.
- Added a first engineering baseline with `vitest` test scripts and parser coverage for encrypted export bundle detection.

## 0.9.4 - 2026-06-22

- Fixed the settings PIN verification regression caused by font preset changes calling `settings:update` immediately while the settings dialog still had unsaved security drafts.
- Changed font preset updates to stay in local draft state while the settings dialog is open, so security changes continue through the normal Save flow instead of failing early.

## 0.9.3 - 2026-06-22

- Added a plain-vs-encrypted choice to current-note exports so `HTML`、`Markdown`、`TXT`、`JSON` can now be saved as a Suiji-only encrypted note file instead of only plaintext.
- Added the same plain-vs-encrypted choice to batch exports, writing one app-specific encrypted export file when protection is selected instead of a directory of plaintext files.
- Updated export-related messaging so the app now clearly distinguishes local storage encryption, encrypted backups, and optional encrypted exports.

## 0.9.2 - 2026-06-18

- Required re-entering the current PIN before disabling local encryption or changing the privacy PIN, instead of trusting the already-open session.
- Disabled default debug-log file output in packaged builds unless `SUIJI_DEBUG_LOG` is explicitly provided.
- Added idle auto-lock timing, lock-on-suspend behavior, and real encrypted-session teardown when the app locks.
- Added app-specific encrypted backup export and restore flow so full-library backups can be protected outside the local database.

## 0.9.1 - 2026-06-18

- Reworked the settings dialog into clearer Preference, Security, and Data sections with stronger card hierarchy and better scanability.
- Pulled backup retention, encryption, and data-management actions into more deliberate grouped layouts instead of one long stacked form.

## 0.9.0 - 2026-06-18

- Added switches for local history retention so automatic note-version backups can be disabled entirely or capped to a smaller count.
- Added PIN-based local encryption for `suiji.db`, note history files in `backups/`, and full-library backup exports, with startup lock handling for encrypted storage.

## 0.8.10 - 2026-06-18

- Kept the editor `+` insert button anchored in its original position and changed only the menu to float out from the button's right side so it no longer gets clipped by the left edge.
- Fixed the insert-menu interaction regression introduced in `0.8.9`.

## 0.8.9 - 2026-06-18

- Fixed the editor insert menu so it opens toward the document interior and no longer gets clipped or covered by the left edge of the workspace.

## 0.8.8 - 2026-06-18

- Added runtime block hover and current-block focus treatment inside the editor without touching document structure or export output.
- Refined empty-line insert feedback, collapsible block expand and collapse motion, and button press states so editor interactions feel softer and more deliberate.

## 0.8.7 - 2026-06-18

- Replaced the broken system `prompt()` link action with an in-app link dialog that works inside Electron.
- Improved link editing so you can add, update, or remove links without leaving the editor flow, and plain domains now auto-complete to `https://`.

## 0.8.6 - 2026-06-18

- Unified the floating UI system so menus, the format panel, and modal dialogs share one layered surface language with softer Craft-like depth.
- Reworked the format panel into clearer stacked cards and tightened hover, lift, and panel-entry motion across editing overlays.
- Refined settings and history dialogs with structured inner surfaces and a calmer modal backdrop for more consistent transient interactions.

## 0.8.5 - 2026-06-18

- Removed the unstable editor block hover toolbar and block chrome experiment that could leave the renderer on a white screen at startup.
- Kept the earlier global motion and sidebar interaction polish while rolling the editor interaction pass back to the last stable behavior.

## 0.8.4 - 2026-06-18

- Fixed the renderer white screen caused by applying block chrome decorations to collapsible block node views during startup.
- Kept the new editor hover interactions for standard text blocks while avoiding decoration updates on collapsible blocks.

## 0.8.3 - 2026-06-18

- Added editor block chrome so the current block has a softer focus treatment and block hover states feel more intentional.
- Added a left-side hover toolbar for block-level insertion and quick formatting access inside the editor.
- Reworked collapsible block expand and collapse behavior with smoother visual transitions instead of abrupt body show/hide.

## 0.8.2 - 2026-06-18

- Started the first interaction-polish pass across the app with unified motion timing and easing tokens.
- Refined sidebar view switches, note cards, hover states, active states, and quick actions to feel lighter and more layered.
- Added smoother menu and modal entrance motion so transient UI feels closer to a Craft-style interaction rhythm.

## 0.8.1 - 2026-06-17

- Refined in-app scrollbar styling with slimmer, lower-contrast thumb treatment so scrolling feels less visually heavy, especially in dark mode.
- Kept the existing layout and interactions intact while unifying scrollbar appearance across app panels.

## 0.7.3 - 2026-05-29

- Added a collapsible outline panel so the directory can be folded away in small windows.
- Improved long-title truncation in the editor header and sidebar note cards.
- Compressed small-window header controls to reduce title clipping.

## 0.7.2 - 2026-05-29

- Tightened sidebar note-card layout for small windows so titles, actions, metadata, excerpts, and timestamps do not overlap or clip.

## 0.7.1 - 2026-05-29

- Batched SQLite database persistence to reduce full database export/write work during autosave bursts.
- Forced database flushes when hiding, minimizing, changing data directories, and quitting.
- Debounced outline regeneration during editing to reduce long-document typing overhead.
- Tightened Electron renderer security settings, permission checks, webview blocking, and CSP directives.

## 0.7.0 - 2026-05-28

- Replaced per-note JSON file storage with a local SQLite database at `suiji.db`.
- Added an FTS5 index for full-text note search and wired normal keyword search through it.
- Added first-run migration from existing `notes/*.json` files into SQLite while keeping JSON backups for version history.

## 0.6.5 - 2026-05-28

- Fixed outline navigation so clicking a heading scrolls the editor to that heading reliably.

## 0.6.4 - 2026-05-28

- Reworked the editor toolbar so typography controls live inside one cohesive "layout" menu.
- Reduced toolbar clutter while keeping font, font size, line width, and line height adjustments live.

## 0.6.3 - 2026-05-28

- Removed font, font-size, line-width, and line-height controls from the settings dialog.
- Kept typography controls in the toolbar and preserved a compact dark-mode switch in settings.

## 0.6.2 - 2026-05-28

- Made the editor toolbar responsive so controls reflow instead of being covered in smaller windows.
- Kept formatting controls and export actions visible while the rich-text tool group scrolls inside its own area.

## 0.6.1 - 2026-05-28

- Optimized compact-window layout so sidebar note cards, timestamps, and toolbar controls are not clipped.
- Moved editor typography controls into the toolbar, including default font, font size, line width, and line height.
- Added persistent editor font size and line-height settings.

## 0.6.0 - 2026-05-28

- Added Markdown import and batch export for Markdown, HTML, TXT, and JSON.
- Added hotkey recording with conflict checks, plus startup-at-login support.
- Added full-text search highlighting and syntax filters for `tag:`, `folder:`, `fav`, `archive`, and `trash`.
- Added word count, reading time, outline navigation, and heading jump support.
- Added theme, font, line-width, and dark-mode settings.
- Added tray quick-create, clipboard quick-save, and image/screenshot paste support.

## 0.5.1 - 2026-05-28

- Improved sidebar view-switch layout from cramped five-column buttons to wider two-column controls.
- Added configurable data directory selection with optional migration of notes, backups, and settings.
- Adjusted data-management controls to avoid crowded button layout.

## 0.5.0 - 2026-05-28

- Added folders, favorites, archive state, soft-delete recycle bin, and permanent delete.
- Added a recent-edit timeline view in the sidebar.
- Added current-note version history UI backed by existing `backups/` files.
- Extended the note schema with `folder`, `favoriteAt`, `archivedAt`, and `trashedAt` while keeping older notes compatible.

## 0.4.0 - 2026-05-28

- Added note tags with editing, search matching, sidebar filtering, and note-card tag display.
- Changed HTML export to render from TipTap JSON through an allowlisted HTML renderer instead of using cached raw HTML.
- Reduced automatic edit-backup churn by throttling normal save backups while keeping destructive-operation backups immediate.
- Split renderer bundles into React, editor, icons, and vendor chunks to reduce the main entry chunk size.

## 0.3.0 - 2026-05-28

- Added full-note backup export from the settings panel.
- Added backup restore with validation and pre-overwrite local backups.
- Added an "open data folder" action for troubleshooting and manual backup workflows.
- Documented the backup file shape and data-management workflow.

## 0.2.0 - 2026-05-28

- Hardened Electron navigation: external links now open through the system browser, and app windows block unexpected navigation and permission requests.
- Added IPC payload validation for note saving, exporting, settings updates, and external link opening.
- Improved autosave reliability with serialized save operations and stale-save state protection.
- Made note loading tolerant of corrupted note JSON files by isolating bad files instead of blocking the whole app.
- Upgraded Electron and electron-builder, reducing `npm audit` findings to zero in the current lockfile.
- Added a Content Security Policy and enabled renderer sandboxing.
- Made icon generation skip unchanged files and replace changed files through temporary files with retries.
- Bumped the app version to `0.2.0`.
