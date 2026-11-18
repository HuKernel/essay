import type { NoteRecord } from "../../shared/types";
import type { ViewMode } from "../constants";

const BATCH_TRASH_VIEW_MODES = new Set<ViewMode>(["active", "recent", "favorites", "archive"]);

export function canBatchTrash(viewMode: ViewMode) {
  return BATCH_TRASH_VIEW_MODES.has(viewMode);
}

export function retainVisibleNoteIds(selectedIds: string[], visibleNotes: NoteRecord[]) {
  const visibleIds = new Set(visibleNotes.map((note) => note.id));
  return selectedIds.filter((id) => visibleIds.has(id));
}

export function getBatchTrashTargets(selectedIds: string[], visibleNotes: NoteRecord[]) {
  const selected = new Set(selectedIds);
  return visibleNotes.filter((note) => selected.has(note.id) && !note.trashedAt);
}
