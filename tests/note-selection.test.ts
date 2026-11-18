import { describe, expect, it } from "vitest";
import type { NoteRecord } from "../src/shared/types";
import { canBatchTrash, getBatchTrashTargets, retainVisibleNoteIds } from "../src/renderer/utils/note-selection";

function note(id: string, trashedAt: string | null = null): NoteRecord {
  return {
    id,
    title: id,
    excerpt: "",
    tags: [],
    folder: "",
    favoriteAt: null,
    archivedAt: null,
    trashedAt,
    pinnedAt: null,
    parentId: null,
    bodyFont: null,
    coverAsset: null,
    pageBg: null,
    content: { type: "doc", content: [] },
    html: "",
    plainText: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
}

describe("batch trash selection", () => {
  it("only enables the four record list views", () => {
    expect(canBatchTrash("active")).toBe(true);
    expect(canBatchTrash("recent")).toBe(true);
    expect(canBatchTrash("favorites")).toBe(true);
    expect(canBatchTrash("archive")).toBe(true);
    expect(canBatchTrash("trash")).toBe(false);
    expect(canBatchTrash("tasks")).toBe(false);
    expect(canBatchTrash("calendar")).toBe(false);
  });

  it("drops selected ids hidden by the current filter", () => {
    expect(retainVisibleNoteIds(["n1", "n2", "hidden"], [note("n1"), note("n2")])).toEqual(["n1", "n2"]);
  });

  it("only trashes selected, visible, non-trashed notes in list order", () => {
    const visible = [note("n1"), note("trashed", "2026-01-01T00:00:00.000Z"), note("n2"), note("n5")];
    const targets = getBatchTrashTargets(["n2", "trashed", "hidden", "n1"], visible);

    expect(targets.map((item) => item.id)).toEqual(["n1", "n2"]);
  });
});
