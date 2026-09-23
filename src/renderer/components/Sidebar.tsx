import { useMemo, useState } from "react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Clock,
  EyeOff,
  FileText,
  Folder,
  Hash,
  Home,
  List,
  ListTodo,
  Pencil,
  Pin,
  Plus,
  Search,
  Settings as SettingsIcon,
  Star,
  Trash2,
  X
} from "lucide-react";
import type { DragEvent as ReactDragEvent } from "react";
import type { NoteRecord } from "../../shared/types";
import type { ViewMode } from "../constants";
import { formatTime } from "../utils/text";

type SidebarProps = {
  sidebarCollapsed: boolean;
  onExpandSidebar: () => void;
  onOpenHome: () => void;
  onOpenFind: () => void;
  onCreateNote: () => void;
  onHideWindow: () => void;
  onOpenSettings: () => void;
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
  visibleNotes: NoteRecord[];
  activeId: string;
  onOpenNote: (id: string) => void;
};

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
    onOpenHome,
    onOpenFind,
    onCreateNote,
    onHideWindow,
    onOpenSettings,
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
    onAssignTag,
    visibleNotes,
    activeId,
    onOpenNote
  } = props;

  const [dropTarget, setDropTarget] = useState<string | null>(null);
  // 折叠分区：默认收起，选中对应筛选时自动展开
  const [tagsOpen, setTagsOpen] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(false);

  // 侧栏记录列表：与当前导航/筛选联动，按更新时间倒序
  const docRows = useMemo(
    () => [...visibleNotes].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [visibleNotes]
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
            className="icon-button"
            title="我的空间"
            aria-label="我的空间"
            onClick={onOpenHome}
            type="button"
          >
            <Home size={18} />
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
          <button className="icon-button" title="设置" aria-label="设置" onClick={onOpenSettings} type="button">
            <SettingsIcon size={18} />
          </button>
          <button
            className={alwaysOnTop ? "icon-button is-active" : "icon-button"}
            title={alwaysOnTop ? "取消窗口置顶" : "窗口置顶"}
            aria-label={alwaysOnTop ? "取消窗口置顶" : "窗口置顶"}
            onClick={onToggleAlwaysOnTop}
            type="button"
          >
            <Pin size={18} />
          </button>
          <button className="icon-button" title="隐藏窗口" aria-label="隐藏窗口" onClick={onHideWindow} type="button">
            <EyeOff size={18} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="nav-header">
        <button type="button" className="workspace-badge" title="回到我的空间" onClick={onOpenHome}>
          <strong>我的空间</strong>
        </button>
        <div className="nav-header-actions">
          <button className="icon-button" title="查找" aria-label="查找" onClick={onOpenFind} type="button">
            <Search size={16} />
          </button>
          <button className="icon-button" title="设置" aria-label="设置" onClick={onOpenSettings} type="button">
            <SettingsIcon size={16} />
          </button>
          <button
            className={alwaysOnTop ? "icon-button is-active" : "icon-button"}
            title={alwaysOnTop ? "取消窗口置顶" : "窗口置顶"}
            aria-label={alwaysOnTop ? "取消窗口置顶" : "窗口置顶"}
            onClick={onToggleAlwaysOnTop}
            type="button"
          >
            <Pin size={16} />
          </button>
          <button className="icon-button" title="隐藏窗口" aria-label="隐藏窗口" onClick={onHideWindow} type="button">
            <EyeOff size={16} />
          </button>
        </div>
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

        <section className="nav-group nav-docs" aria-label="记录列表">
          <div className="nav-section-toggle nav-docs-head">
            <span>记录</span>
            <em>{docRows.length}</em>
          </div>
          {docRows.length > 0 ? (
            <div className="nav-doc-list">
              {docRows.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  className={[
                    "nav-doc-row",
                    activeId === note.id ? "is-active" : "",
                    note.trashedAt ? "is-trashed" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onOpenNote(note.id)}
                >
                  <FileText size={14} />
                  <span className="nav-doc-title">{note.title || "未命名记录"}</span>
                  <span className="nav-doc-time">{formatTime(note.updatedAt).split(" ")[0]}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="nav-doc-empty">当前视图没有记录</p>
          )}
        </section>
      </div>
    </aside>
  );
}
