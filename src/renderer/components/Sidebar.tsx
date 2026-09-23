import { useEffect, useRef, useState } from "react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Folder,
  Hash,
  List,
  ListTodo,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  User,
  X
} from "lucide-react";
import type { DragEvent as ReactDragEvent } from "react";
import type { ViewMode, ExportFormat } from "../constants";
import type { BatchExportFormat } from "../../shared/types";
import appIconUrl from "../assets/app-icon.png";

type SidebarProps = {
  sidebarCollapsed: boolean;
  onExpandSidebar: () => void;
  onCollapseSidebar: () => void;
  onOpenHome: () => void;
  onOpenFind: () => void;
  onCreateNote: () => void;
  onSave: () => void;
  onOpenHistory: () => void;
  onExportNote: (format: ExportFormat) => void;
  onBatchExport: (format: BatchExportFormat) => void;
  onHideWindow: () => void;
  onOpenSettings: () => void;
  onAbout: () => void;
  onQuit: () => void;
  alwaysOnTop: boolean;
  onToggleAlwaysOnTop: () => void;
  query: string;
  onQueryChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  allFolders: string[];
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
  onRemoveFolder: (folder: string) => void;
  allTags: string[];
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onRenameTag: (tag: string) => void;
  onAssignFolder: (noteId: string, folder: string) => void;
  onAssignTag: (noteId: string, tag: string) => void;
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

const VIEW_MODES: Array<[ViewMode, string, typeof List]> = [
  ["active", "全部记录", List],
  ["recent", "最近编辑", Clock],
  ["favorites", "收藏", Star],
  ["tasks", "待办", ListTodo],
  ["archive", "归档", Archive],
  ["trash", "回收站", Trash2]
];

export function Sidebar(props: SidebarProps) {
  const {
    sidebarCollapsed,
    onExpandSidebar,
    onCollapseSidebar,
    onOpenHome,
    onOpenFind,
    onCreateNote,
    onSave,
    onOpenHistory,
    onExportNote,
    onBatchExport,
    onHideWindow,
    onOpenSettings,
    onAbout,
    onQuit,
    alwaysOnTop,
    onToggleAlwaysOnTop,
    query,
    onQueryChange,
    viewMode,
    onViewModeChange,
    allFolders,
    selectedFolder,
    onSelectFolder,
    onRemoveFolder,
    allTags,
    selectedTag,
    onSelectTag,
    onRemoveTag,
    onRenameTag,
    onAssignFolder,
    onAssignTag
  } = props;

  const [dropTarget, setDropTarget] = useState<string | null>(null);
  // 折叠分区：默认收起，选中对应筛选时自动展开
  const [tagsOpen, setTagsOpen] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(false);
  // 底部用户菜单（从底向上弹出）
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

  const userMenu = (
    <div className="nav-user-menu" role="menu" aria-label="应用菜单">
      <button type="button" role="menuitem" onClick={act(onCreateNote)}>
        新建记录
      </button>
      <button type="button" role="menuitem" onClick={act(onSave)}>
        保存
      </button>
      <button type="button" role="menuitem" onClick={act(onOpenHistory)}>
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
        <div className="nav-user-submenu">
          {NOTE_EXPORTS.map((item) => (
            <button key={item.format} type="button" role="menuitem" onClick={act(() => onExportNote(item.format))}>
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
        <div className="nav-user-submenu">
          {BATCH_EXPORTS.map((item) => (
            <button key={item.format} type="button" role="menuitem" onClick={act(() => onBatchExport(item.format))}>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="nav-user-menu-divider" />
      <button type="button" role="menuitem" onClick={act(onOpenFind)}>
        查找
      </button>
      <button type="button" role="menuitem" onClick={act(onToggleAlwaysOnTop)}>
        {alwaysOnTop ? "✓ " : ""}窗口置顶
      </button>
      <button type="button" role="menuitem" onClick={act(onOpenSettings)}>
        设置
      </button>
      <button type="button" role="menuitem" onClick={act(onHideWindow)}>
        隐藏窗口
      </button>
      <button type="button" role="menuitem" onClick={act(onAbout)}>
        关于随记
      </button>
      <div className="nav-user-menu-divider" />
      <button type="button" role="menuitem" onClick={act(onQuit)}>
        退出
      </button>
    </div>
  );

  function dropProps(key: string, apply: (noteId: string) => void) {
    return {
      onDragOver: (event: ReactDragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDropTarget(key);
      },
      onDragLeave: () => setDropTarget((current) => (current === key ? null : current)),
      onDrop: (event: ReactDragEvent) => {
        event.preventDefault();
        setDropTarget(null);
        const noteId = event.dataTransfer.getData("text/suiji-note");
        if (noteId) apply(noteId);
      }
    };
  }

  if (sidebarCollapsed) {
    return (
      <aside className="sidebar">
        <div className="sidebar-rail">
          <button
            className="icon-button sidebar-rail-logo"
            title="展开侧边栏"
            aria-label="展开侧边栏"
            onClick={onExpandSidebar}
            type="button"
          >
            <span className="toggle-state logo" aria-hidden="true">
              <img src={appIconUrl} alt="" />
            </span>
            <span className="toggle-state expand" aria-hidden="true">
              <PanelLeftOpen size={17} />
            </span>
          </button>
          <span className="sidebar-rail-divider" aria-hidden="true" />
          {VIEW_MODES.map(([mode, label, Icon]) => (
            <button
              key={mode}
              className={viewMode === mode ? "icon-button is-active" : "icon-button"}
              title={label}
              aria-label={label}
              onClick={() => {
                onViewModeChange(mode);
                onExpandSidebar();
              }}
              type="button"
            >
              <Icon size={17} />
            </button>
          ))}
          <span className="sidebar-rail-divider" aria-hidden="true" />
          <button
            className="icon-button primary-icon"
            title="新记录"
            aria-label="新记录"
            onClick={onCreateNote}
            type="button"
          >
            <Plus size={18} />
          </button>
          <span className="sidebar-rail-spacer" aria-hidden="true" />
          <div className="nav-user-wrap" ref={menuRef}>
            <button
              className={menuOpen ? "icon-button is-active" : "icon-button"}
              title="菜单"
              aria-label="菜单"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              <User size={18} />
            </button>
            {menuOpen ? userMenu : null}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="nav-header">
        <button
          className="icon-button sidebar-collapse-toggle"
          title="收起侧边栏"
          aria-label="收起侧边栏"
          onClick={onCollapseSidebar}
          type="button"
        >
          <span className="toggle-state menu" aria-hidden="true">
            <MenuIcon size={16} />
          </span>
          <span className="toggle-state collapse" aria-hidden="true">
            <PanelLeftClose size={16} />
          </span>
        </button>
        <button type="button" className="workspace-badge" title="回到我的空间" onClick={onOpenHome}>
          <strong>我的空间</strong>
        </button>
      </div>

      <div className="nav-body">
        <div className="search-box">
          <Search size={16} />
          <div className="search-box-body">
            <span className="search-box-label">检索</span>
            <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="搜索知识库" />
          </div>
          {query ? (
            <button
              type="button"
              className="search-box-clear"
              aria-label="清除搜索"
              title="清除搜索"
              onClick={() => onQueryChange("")}
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        <button className="new-note-button" type="button" onClick={onCreateNote}>
          <Plus size={16} />
          新记录
        </button>

        <nav className="nav-group" aria-label="知识导航">
          {VIEW_MODES.map(([mode, label, Icon]) => (
            <button
              key={mode}
              type="button"
              className={viewMode === mode ? "nav-item is-active" : "nav-item"}
              onClick={() => onViewModeChange(mode)}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {allFolders.length > 0 ? (
          <section className="nav-group" aria-label="文件夹">
            <button
              type="button"
              className="nav-section-toggle"
              aria-expanded={foldersOpen || selectedFolder !== ""}
              onClick={() => setFoldersOpen((current) => !current)}
            >
              {foldersOpen || selectedFolder !== "" ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span>文件夹</span>
              <em>{allFolders.length}</em>
            </button>
            {foldersOpen || selectedFolder !== "" ? (
              <>
                <button
                  type="button"
                  className={[
                    selectedFolder ? "" : "is-active",
                    dropTarget === "folder:" ? "is-drop-target" : ""
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                  onClick={() => onSelectFolder("")}
                  {...dropProps("folder:", (noteId) => onAssignFolder(noteId, ""))}
                >
                  <Folder size={15} />
                  <span>全部文件夹</span>
                </button>
                <div className="nav-group-list">
                  {allFolders.map((folder) => (
                    <div className="nav-filter-row" key={folder}>
                      <button
                        type="button"
                        className={[
                          selectedFolder === folder ? "is-active" : "",
                          dropTarget === `folder:${folder}` ? "is-drop-target" : ""
                        ]
                          .filter(Boolean)
                          .join(" ") || undefined}
                        onClick={() => onSelectFolder(folder)}
                        {...dropProps(`folder:${folder}`, (noteId) => onAssignFolder(noteId, folder))}
                      >
                        <Folder size={15} />
                        <span>{folder}</span>
                      </button>
                      <button
                        type="button"
                        className="nav-row-remove"
                        aria-label={`删除文件夹 ${folder}`}
                        title={`删除文件夹 ${folder}`}
                        onClick={() => onRemoveFolder(folder)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {allTags.length > 0 ? (
          <section className="nav-group" aria-label="标签">
            <button
              type="button"
              className="nav-section-toggle"
              aria-expanded={tagsOpen || selectedTag !== ""}
              onClick={() => setTagsOpen((current) => !current)}
            >
              {tagsOpen || selectedTag !== "" ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span>标签</span>
              <em>{allTags.length}</em>
            </button>
            {tagsOpen || selectedTag !== "" ? (
              <>
                <button type="button" className={selectedTag ? "" : "is-active"} onClick={() => onSelectTag("")}>
                  <Hash size={15} />
                  <span>全部标签</span>
                </button>
                <div className="nav-group-list">
                  {allTags.map((tag) => (
                    <div className="nav-filter-row" key={tag}>
                      <button
                        type="button"
                        className={[
                          selectedTag === tag ? "is-active" : "",
                          dropTarget === `tag:${tag}` ? "is-drop-target" : ""
                        ]
                          .filter(Boolean)
                          .join(" ") || undefined}
                        onClick={() => onSelectTag(tag)}
                        {...dropProps(`tag:${tag}`, (noteId) => onAssignTag(noteId, tag))}
                      >
                        <Hash size={15} />
                        <span>{tag}</span>
                      </button>
                      <span className="nav-row-tools">
                        <button
                          type="button"
                          className="nav-row-remove"
                          aria-label={`重命名标签 ${tag}`}
                          title={`重命名标签 ${tag}`}
                          onClick={() => onRenameTag(tag)}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          className="nav-row-remove"
                          aria-label={`删除标签 ${tag}`}
                          title={`删除标签 ${tag}`}
                          onClick={() => onRemoveTag(tag)}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </section>
        ) : null}

      </div>

      <footer className="nav-footer">
        <div className="nav-user-wrap" ref={menuRef}>
          <button
            type="button"
            className="nav-user"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span className="nav-user-avatar" aria-hidden="true">
              <User size={15} />
            </span>
            <span className="nav-user-name">本地空间</span>
            <ChevronUp size={14} className={menuOpen ? "nav-user-chevron is-open" : "nav-user-chevron"} />
          </button>
          {menuOpen ? userMenu : null}
        </div>
      </footer>
    </aside>
  );
}
