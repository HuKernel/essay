import { useEffect, useRef, useState } from "react";
import { Menu as MenuIcon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import appIconUrl from "../assets/app-icon.png";
import type { ExportFormat } from "../constants";
import type { BatchExportFormat } from "../../shared/types";
import type { SaveState } from "../constants";

type TopBarProps = {
  /** 回收站笔记：标题与属性只读 */
  readOnly?: boolean;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  title: string;
  onTitleChange: (value: string) => void;
  onCreateNote: () => void;
  onSave: () => void;
  onOpenHistory: () => void;
  onExportNote: (format: ExportFormat) => void;
  onBatchExport: (format: BatchExportFormat) => void;
  onOpenSettings: () => void;
  onHideWindow: () => void;
  onAbout: () => void;
  onQuit: () => void;
  folderPreview: string;
  metaTagsPreview: string[];
  hasMetaInfo: boolean;
  metaEditorOpen: boolean;
  onToggleMetaEditor: () => void;
  tagsDraft: string;
  onTagsChange: (value: string) => void;
  folderDraft: string;
  onFolderChange: (value: string) => void;
  saveState: SaveState;
  editorCharCount: number;
  readingMinutes: number;
};

const STATUS_TEXT: Record<SaveState, string> = {
  idle: "已保存",
  dirty: "有修改",
  saving: "保存中",
  saved: "已保存",
  error: "保存失败"
};

const NOTE_EXPORTS: Array<{ format: ExportFormat; label: string }> = [
  { format: "pdf", label: "导出 PDF" },
  { format: "html", label: "导出 HTML" },
  { format: "md", label: "导出 Markdown" },
  { format: "txt", label: "导出 TXT" },
  { format: "json", label: "导出 JSON" }
];

const BATCH_EXPORTS: Array<{ format: BatchExportFormat; label: string }> = [
  { format: "md", label: "批量导出 Markdown" },
  { format: "html", label: "批量导出 HTML" },
  { format: "txt", label: "批量导出 TXT" },
  { format: "json", label: "批量导出 JSON" }
];

export function TopBar(props: TopBarProps) {
  const {
    readOnly = false,
    sidebarCollapsed,
    onToggleSidebar,
    title,
    onTitleChange,
    folderPreview,
    metaTagsPreview,
    hasMetaInfo,
    metaEditorOpen,
    onToggleMetaEditor,
    tagsDraft,
    onTagsChange,
    folderDraft,
    onFolderChange,
    saveState,
    editorCharCount,
    readingMinutes
  } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<"note" | "batch" | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function act(fn: () => void) {
    return () => {
      setMenuOpen(false);
      setExpanded(null);
      fn();
    };
  }

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <img className="topbar-logo" src={appIconUrl} alt="" aria-hidden="true" />
        <div className="titlebar-leading" ref={menuRef}>
          <button
            className="icon-button titlebar-menu-trigger"
            title="菜单"
            aria-label="菜单"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            <MenuIcon size={18} />
          </button>
          {menuOpen ? (
            <div className="titlebar-menu" role="menu" aria-label="应用菜单">
              <button type="button" role="menuitem" onClick={act(props.onCreateNote)}>
                新建记录
              </button>
              <button type="button" role="menuitem" onClick={act(props.onSave)}>
                保存
              </button>
              <button type="button" role="menuitem" onClick={act(props.onOpenHistory)}>
                版本历史
              </button>
              <button
                type="button"
                role="menuitem"
                aria-expanded={expanded === "note"}
                onClick={() => setExpanded((current) => (current === "note" ? null : "note"))}
              >
                导出当前记录
              </button>
              {expanded === "note" ? (
                <div className="titlebar-submenu">
                  {NOTE_EXPORTS.map((item) => (
                    <button
                      key={item.format}
                      type="button"
                      role="menuitem"
                      onClick={act(() => props.onExportNote(item.format))}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                role="menuitem"
                aria-expanded={expanded === "batch"}
                onClick={() => setExpanded((current) => (current === "batch" ? null : "batch"))}
              >
                批量导出记录
              </button>
              {expanded === "batch" ? (
                <div className="titlebar-submenu">
                  {BATCH_EXPORTS.map((item) => (
                    <button
                      key={item.format}
                      type="button"
                      role="menuitem"
                      onClick={act(() => props.onBatchExport(item.format))}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="titlebar-menu-divider" />
              <button type="button" role="menuitem" onClick={act(props.onOpenSettings)}>
                设置
              </button>
              <button type="button" role="menuitem" onClick={act(props.onHideWindow)}>
                隐藏窗口
              </button>
              <button type="button" role="menuitem" onClick={act(props.onAbout)}>
                关于随记
              </button>
              <div className="titlebar-menu-divider" />
              <button type="button" role="menuitem" onClick={act(props.onQuit)}>
                退出
              </button>
            </div>
          ) : null}
        </div>
        <button
          className={
            sidebarCollapsed ? "icon-button workspace-nav-toggle is-collapsed" : "icon-button workspace-nav-toggle"
          }
          title={sidebarCollapsed ? "展开左侧栏" : "收起左侧栏"}
          aria-label={sidebarCollapsed ? "展开左侧栏" : "收起左侧栏"}
          onClick={onToggleSidebar}
          type="button"
        >
          <span className="workspace-nav-track" aria-hidden="true">
            <span className="workspace-nav-thumb" />
            <span className="workspace-nav-slot workspace-nav-slot-expand">
              <PanelLeftOpen size={15} />
            </span>
            <span className="workspace-nav-slot workspace-nav-slot-collapse">
              <PanelLeftClose size={15} />
            </span>
          </span>
        </button>
        </div>
        <input
          className="title-input"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="未命名记录"
          disabled={readOnly}
        />
        <button
          type="button"
          className={metaEditorOpen ? "meta-summary is-open" : "meta-summary"}
          onClick={onToggleMetaEditor}
          disabled={readOnly}
        >
          {folderPreview ? <span className="meta-chip meta-folder-chip">文件夹 · {folderPreview}</span> : null}
          {metaTagsPreview.slice(0, 3).map((tag) => (
            <span key={tag} className="meta-chip">
              {tag}
            </span>
          ))}
          {metaTagsPreview.length > 3 ? <span className="meta-chip">+{metaTagsPreview.length - 3}</span> : null}
          {!hasMetaInfo ? <span className="meta-summary-empty">属性</span> : null}
          <span className="meta-summary-action">{metaEditorOpen ? "收起" : "编辑"}</span>
        </button>
        {metaEditorOpen && !readOnly ? (
          <div className="meta-input-row">
            <input
              className="tags-input"
              value={tagsDraft}
              onChange={(event) => onTagsChange(event.target.value)}
              placeholder="标签，用逗号分隔"
            />
            <input
              className="folder-input"
              value={folderDraft}
              onChange={(event) => onFolderChange(event.target.value)}
              placeholder="文件夹"
            />
          </div>
        ) : null}
      <div className="topbar-statuses">
        <span className={`save-status ${saveState}`}>{STATUS_TEXT[saveState]}</span>
        <span className="doc-stats">
          {editorCharCount} 字 · 阅读 {readingMinutes} 分钟
        </span>
      </div>
    </header>
  );
}
