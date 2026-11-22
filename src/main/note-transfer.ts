import { buildHtmlExport } from "./html-export.js";
import { toMarkdown } from "../shared/markdown.js";
import { contentWithoutDuplicateTitleHeading, plainTextWithoutDuplicateTitleLine } from "./export-content.js";
import type { BackupEntry, ExportPayload, NoteRecord, NotesBackup } from "../shared/types.js";

export const DATA_MIGRATION_ENTRIES = ["suiji.db", "notes", "backups", "attachments", "settings.json"] as const;

export type BackupPruneFile = {
  fileName: string;
  filePath: string;
  mtime: number;
  tmp: boolean;
};

export function backupFilesToDelete(
  files: BackupPruneFile[],
  limit: number,
  now: number,
  backupMaxAgeMs: number,
  tmpMaxAgeMs: number
) {
  const expired = files.filter(
    (file) => file.mtime < now - backupMaxAgeMs || (file.tmp && file.mtime < now - tmpMaxAgeMs)
  );
  const kept = files
    .filter((file) => !expired.includes(file))
    .sort((a, b) => b.mtime - a.mtime);
  const retainedByNote = new Map<string, number>();
  const stale = kept.filter((file) => {
    if (file.tmp) return false;
    const noteId = file.fileName.replace(/\.json$/, "").match(/[a-f0-9-]{36}$/i)?.[0] ?? "unknown";
    const retained = retainedByNote.get(noteId) ?? 0;
    retainedByNote.set(noteId, retained + 1);
    return retained >= limit;
  });
  return [...expired, ...stale];
}

export function safeExportName(name: string, ext: string) {
  const base = (name || "未命名记录")
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return `${base || "未命名记录"}.${ext}`;
}

export function safeExportBaseName(name: string) {
  return safeExportName(name, "tmp").replace(/\.tmp$/, "");
}

export function defaultEncryptedBatchExportName() {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  return `suiji-export-${stamp}.suiji-export`;
}

export function defaultBackupName(encrypted = false) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  return `suiji-backup-${stamp}.${encrypted ? "suiji-backup" : "json"}`;
}

export function buildExportText(note: NoteRecord, format: Exclude<ExportPayload["format"], "pdf">) {
  return format === "html"
    ? buildHtmlExport(note)
    : format === "json"
      ? JSON.stringify(note, null, 2)
      : format === "md"
        ? buildMarkdownExport(note)
        : buildTextExport(note);
}

export function plainDoc(text: string): NoteRecord["content"] {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : undefined
      }
    ]
  };
}

export function parseBackupNotes(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray((raw as Partial<NotesBackup>).notes)) {
    return (raw as Partial<NotesBackup>).notes ?? [];
  }
  throw new Error("Invalid backup file");
}

export function parseBackupEntryName(
  fileName: string,
  id: string,
  size: number,
  fallbackDate: Date
): BackupEntry | null {
  if (!fileName.endsWith(`-${id}.json`)) return null;
  const match = fileName.match(/^(.+?)-(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{3}Z)-[a-f0-9-]{36}\.json$/i);
  return {
    fileName,
    prefix: match?.[1] ?? "backup",
    createdAt: match?.[2]?.replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, "T$1:$2:$3.$4Z") ?? fallbackDate.toISOString(),
    size
  };
}

export function buildMarkdownExport(note: NoteRecord) {
  const title = (note.title || "未命名记录").trim() || "未命名记录";
  const body = toMarkdown(contentWithoutDuplicateTitleHeading(note)).trim();
  return body ? `# ${title}\n\n${body}\n` : `# ${title}\n`;
}

export function buildTextExport(note: NoteRecord) {
  const title = (note.title || "未命名记录").trim() || "未命名记录";
  const body = plainTextWithoutDuplicateTitleLine(note);
  return body ? `${title}\n\n${body}\n` : `${title}\n`;
}
