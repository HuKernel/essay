import type { JSONContent } from "@tiptap/react";
import type { NoteRecord } from "../shared/types.js";

function nodeText(node: JSONContent | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  return (node.content ?? []).map(nodeText).join("");
}

function firstHeadingDuplicatesTitle(note: NoteRecord) {
  const title = note.title.trim();
  const first = note.content?.content?.[0];
  return Boolean(
    title &&
    first?.type === "heading" &&
    Number(first.attrs?.level ?? 1) === 1 &&
    nodeText(first).trim().toLowerCase() === title.toLowerCase()
  );
}

export function contentWithoutDuplicateTitleHeading(note: NoteRecord): JSONContent {
  if (!firstHeadingDuplicatesTitle(note) || !note.content?.content) return note.content;
  return { ...note.content, content: note.content.content.slice(1) };
}

export function plainTextWithoutDuplicateTitleLine(note: NoteRecord) {
  if (!firstHeadingDuplicatesTitle(note)) return note.plainText.trim();
  const lines = note.plainText.split(/\r?\n/);
  const index = lines.findIndex((line) => line.trim().length > 0);
  if (index >= 0 && lines[index].trim().toLowerCase() === note.title.trim().toLowerCase()) lines.splice(index, 1);
  return lines.join("\n").trim();
}
