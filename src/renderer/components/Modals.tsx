import { useState } from "react";
import { ArchiveRestore, Lock, Trash2 } from "lucide-react";
import type { BackupEntry, NoteRecord } from "../../shared/types";
import type { ConfirmDialogState, LinkDialogState } from "../constants";
import { formatTime } from "../utils/text";

/* ---------- 链接编辑 ---------- */

type LinkDialogProps = {
  dialog: LinkDialogState;
  linkDraft: string;
  linkInputRef: React.Ref<HTMLInputElement>;
  onDraftChange: (value: string) => void;
  onApply: () => void;
  onRemove: () => void;
  onClose: () => void;
};

export function LinkDialog({
  dialog,
  linkDraft,
  linkInputRef,
  onDraftChange,
  onApply,
  onRemove,
  onClose
}: LinkDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal link-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-kicker">文本链接</span>
          <h2>编辑链接</h2>
          <p className="modal-description">
            {dialog.empty ? "未选中文本时会直接插入一个可点击链接。" : "保存后会把当前选中文本更新为链接。"}
          </p>
        </div>
        <label className="link-field">
          <span>链接地址</span>
          <input
            ref={linkInputRef}
            type="text"
            value={linkDraft}
            placeholder="https://example.com"
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              onApply();
            }}
          />
          <small className="setting-hint">支持直接输入域名，会自动补全为 `https://`。</small>
        </label>
        <div className="modal-actions link-modal-actions">
          <button type="button" onClick={onClose}>
            取消
          </button>
          <button type="button" onClick={onRemove}>
            移除链接
          </button>
          <button type="button" className="primary" onClick={onApply}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 文本输入弹窗 ---------- */

type PromptDialogProps = {
  title: string;
  description: string;
  value: string;
  confirmLabel?: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function PromptDialog({ title, description, value, confirmLabel, onChange, onConfirm, onClose }: PromptDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal link-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <p className="modal-description">{description}</p>
        </div>
        <label className="link-field">
          <input
            type="text"
            value={value}
            autoFocus
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              onConfirm();
            }}
          />
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            取消
          </button>
          <button type="button" className="primary" onClick={onConfirm}>
            {confirmLabel ?? "确定"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 版本历史 ---------- */

type HistoryModalProps = {
  entries: BackupEntry[];
  status: string;
  onRestore: (entry: BackupEntry) => void;
  onClose: () => void;
};

export function HistoryModal({ entries, status, onRestore, onClose }: HistoryModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal history-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-kicker">文稿回溯</span>
          <h2>版本历史</h2>
          <p className="modal-description">选择一个历史快照恢复，当前内容会先自动备份。</p>
        </div>
        {status ? <p className="history-status">{status}</p> : null}
        <div className="history-list">
          {entries.map((entry) => (
            <div key={entry.fileName} className="history-item">
              <div>
                <strong>{formatTime(entry.createdAt)}</strong>
                <span>
                  {entry.prefix} · {Math.max(1, Math.round(entry.size / 1024))} KB
                </span>
              </div>
              <button type="button" onClick={() => onRestore(entry)}>
                恢复
              </button>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 确认框 ---------- */

type ConfirmDialogProps = {
  dialog: ConfirmDialogState;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ dialog, busy, onClose, onConfirm }: ConfirmDialogProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal confirm-modal"
        role="alertdialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={dialog.tone === "danger" ? "confirm-icon danger" : "confirm-icon"}>
          {dialog.icon === "history" ? <ArchiveRestore size={20} /> : <Trash2 size={20} />}
        </div>
        <div className="confirm-copy">
          <h2>{dialog.title}</h2>
          <p>{dialog.description}</p>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={busy}>
            取消
          </button>
          <button
            type="button"
            className={dialog.tone === "danger" ? "danger-primary" : "primary"}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "处理中..." : dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 隐私锁 ---------- */

type PrivacyLockProps = {
  hasPrivacyPin: boolean;
  unlockPin: string;
  unlockError: string;
  unlockBusy: boolean;
  onUnlockPinChange: (value: string) => void;
  onUnlock: () => void;
};

export function PrivacyLock({
  hasPrivacyPin,
  unlockPin,
  unlockError,
  unlockBusy,
  onUnlockPinChange,
  onUnlock
}: PrivacyLockProps) {
  return (
    <div className="privacy-lock" role="dialog" aria-modal="true">
      <div className="privacy-panel">
        <Lock size={34} />
        <h2>内容已保护</h2>
        <p>窗口隐藏后已遮挡笔记内容，解锁后继续编辑。</p>
        {hasPrivacyPin ? (
          <input
            type="password"
            value={unlockPin}
            autoFocus
            placeholder="输入隐私密码"
            disabled={unlockBusy}
            onChange={(event) => onUnlockPinChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onUnlock();
            }}
          />
        ) : null}
        {unlockError ? <span className="privacy-error">{unlockError}</span> : null}
        <button type="button" onClick={onUnlock} disabled={unlockBusy}>
          {unlockBusy ? "解锁中..." : "解锁"}
        </button>
      </div>
    </div>
  );
}

/* ---------- 块引用选择器 ---------- */

function extractNoteBlocks(note: NoteRecord): string[] {
  const out: string[] = [];
  const walk = (node: { type?: string; textContent?: string; content?: unknown[] }) => {
    if ((node.type === "paragraph" || node.type === "heading") && node.textContent?.trim()) {
      out.push(node.textContent.trim().slice(0, 160));
    }
    (node.content ?? []).forEach((child) => walk(child as typeof node));
  };
  walk(note.content ?? {});
  return out;
}

type BlockRefPickerProps = {
  notes: NoteRecord[];
  activeNoteId: string;
  onPick: (target: { noteId: string; title: string; text: string }) => void;
  onClose: () => void;
};

export function BlockRefPicker({ notes, activeNoteId, onPick, onClose }: BlockRefPickerProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<NoteRecord | null>(null);
  const candidates = notes.filter(
    (note) =>
      !note.trashedAt &&
      note.id !== activeNoteId &&
      (note.title.includes(query.trim()) || note.excerpt.includes(query.trim()) || !query.trim())
  );

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal blockref-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-kicker">块引用</span>
          <h2>{selected ? `选择「${selected.title}」中的块` : "选择来源笔记"}</h2>
          <p className="modal-description">
            {selected ? "点击一个块，把它作为引用卡片插入当前笔记。" : "先选一篇笔记，再挑它里面的一个块。"}
          </p>
        </div>
        {selected ? null : (
          <input
            className="blockref-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索笔记标题或摘要"
            autoFocus
          />
        )}
        <div className="blockref-list">
          {selected
            ? extractNoteBlocks(selected).map((text, index) => (
                <button
                  key={index}
                  type="button"
                  className="blockref-item"
                  onClick={() => onPick({ noteId: selected.id, title: selected.title, text })}
                >
                  {text}
                </button>
              ))
            : candidates.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  className="blockref-item"
                  onClick={() => setSelected(note)}
                >
                  <strong>{note.icon ? `${note.icon} ` : ""}{note.title || "未命名记录"}</strong>
                  <span>{note.excerpt || "空记录"}</span>
                </button>
              ))}
          {(selected ? extractNoteBlocks(selected) : candidates).length === 0 ? (
            <p className="blockref-empty">没有匹配的内容</p>
          ) : null}
        </div>
        <div className="modal-actions">
          {selected ? (
            <button type="button" onClick={() => setSelected(null)}>
              返回笔记列表
            </button>
          ) : null}
          <button type="button" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
