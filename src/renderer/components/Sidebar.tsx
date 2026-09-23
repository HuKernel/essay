import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  EyeOff,
  Folder,
  Hash,
  List,
  ListTodo,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Settings as SettingsIcon,
  Star,
  StarOff,
  Square,
  Trash2,
  X
} from "lucide-react";
import type { NoteRecord } from "../../shared/types";
import type { DragEvent as ReactDragEvent } from "react";
import type { ViewMode } from "../constants";
import { HighlightedText } from "./common";
import { formatTime, type OpenTask } from "../utils/text";

type SidebarProps = {
  sidebarCollapsed: boolean;
  onExpandSidebar: () => void;
  onCollapseSidebar: () => void;
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
  openTasks: OpenTask[];
  onOpenTaskNote: (id: string) => void;
  onToggleTask: (task: OpenTask) => void;
  filteredNotes: NoteRecord[];
  activeId: string;
  searchKeyword: string;
  onSelectNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onPurgeNote: (id: string) => void;
  onAssignFolder: (noteId: string, folder: string) => void;
  onAssignTag: (noteId: string, tag: string) => void;
};

const VIEW_MODES: Array<[ViewMode, string, typeof List]> = [
  ["active", "全部记录", List],
  ["favorites", "收藏", Star],
  ["recent", "最近编辑", Clock],
  ["tasks", "待办", ListTodo],
  ["archive", "归档", Archive],
  ["trash", "回收站", Trash2],
  ["calendar", "日历", Calendar]
];

const LIST_TITLES: Partial<Record<ViewMode, string>> = {
  active: "记录",
  recent: "最近编辑",
  favorites: "收藏",
  tasks: "未完成的待办",
  archive: "归档",
  trash: "回收站"
};

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

function dayKeyOf(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function Sidebar(props: SidebarProps) {
  const {
    sidebarCollapsed,
    onExpandSidebar,
    onCollapseSidebar,
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
    openTasks,
    onOpenTaskNote,
    onToggleTask,
    filteredNotes,
    activeId,
    searchKeyword,
    onSelectNote,
    onTogglePin,
    onToggleFavorite,
    onToggleArchive,
    onDeleteNote,
    onRestoreNote,
    onPurgeNote,
    onAssignFolder,
    onAssignTag
  } = props;

  const [dropTarget, setDropTarget] = useState<string | null>(null);
  // 折叠分区：默认收起，选中对应筛选时自动展开
  const [tagsOpen, setTagsOpen] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [calendarDay, setCalendarDay] = useState<string | null>(() => dayKeyOf(new Date()));

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

  const notesByDay = new Map<string, number>();
  for (const note of filteredNotes) {
    const key = dayKeyOf(note.updatedAt);
    notesByDay.set(key, (notesByDay.get(key) ?? 0) + 1);
  }
  const monthPrefix = `${calendarMonth.getFullYear()}-${`${calendarMonth.getMonth() + 1}`.padStart(2, "0")}-`;
  const calendarCells: Array<{ day: number; key: string; count: number } | null> = [
    ...Array.from({ length: calendarMonth.getDay() }, () => null),
    ...Array.from({ length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate() }, (_, index) => {
      const day = index + 1;
      const key = `${monthPrefix}${`${day}`.padStart(2, "0")}`;
      return { day, key, count: notesByDay.get(key) ?? 0 };
    })
  ];
  const todayKey = dayKeyOf(new Date());
  const dayNotes = calendarDay
    ? filteredNotes
        .filter((note) => dayKeyOf(note.updatedAt) === calendarDay)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    : [];

  if (sidebarCollapsed) {
    return (
      <aside className="sidebar">
        <div className="sidebar-rail">
          <button
            className="icon-button"
            title="展开侧边栏"
            aria-label="展开侧边栏"
            onClick={onExpandSidebar}
            type="button"
          >
            <PanelLeftOpen size={18} />
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
        <div className="workspace-badge">
          <strong>我的空间</strong>
        </div>
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
          <button
            className="icon-button"
            title="收起侧边栏"
            aria-label="收起侧边栏"
            onClick={onCollapseSidebar}
            type="button"
          >
            <PanelLeftClose size={16} />
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
                <button
                  type="button"
                  className={selectedTag ? "" : "is-active"}
                  onClick={() => onSelectTag("")}
                >
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

        {viewMode === "calendar" ? (
          <div className="calendar-wrap">
            <div className="calendar-nav">
              <button
                type="button"
                aria-label="上个月"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
              >
                ‹
              </button>
              <strong>
                {calendarMonth.getFullYear()}年{calendarMonth.getMonth() + 1}月
              </strong>
              <button
                type="button"
                aria-label="下个月"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
              >
                ›
              </button>
              <button
                type="button"
                className="calendar-today"
                onClick={() => {
                  const now = new Date();
                  setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                  setCalendarDay(todayKey);
                }}
              >
                今天
              </button>
            </div>
            {calendarDay ? (
              <>
                <div className="sidebar-list-header">
                  <span>{calendarDay} 的记录</span>
                  <strong>{dayNotes.length}</strong>
                </div>
                <nav className="note-list is-embedded" aria-label="当日记录">
                  {dayNotes.length === 0 ? (
                    <p className="note-list-empty" role="status">
                      这一天没有记录
                    </p>
                  ) : (
                    dayNotes.map((note) => (
                      <div
                        key={note.id}
                        className={note.id === activeId ? "note-item is-active" : "note-item"}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectNote(note.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelectNote(note.id);
                          }
                        }}
                      >
                        <div className="note-item-header">
                          <span className="note-title">
                            <span className="note-title-text">{note.title || "未命名记录"}</span>
                          </span>
                        </div>
                        <span className="note-excerpt">{note.excerpt || "空记录"}</span>
                        <span className="note-time">{formatTime(note.updatedAt)}</span>
                      </div>
                    ))
                  )}
                </nav>
              </>
            ) : null}
            <div className="calendar-grid">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label} className="calendar-weekday">
                  {label}
                </span>
              ))}
              {calendarCells.map((cell, index) =>
                cell ? (
                  <button
                    key={cell.key}
                    type="button"
                    title={cell.count ? `${cell.count} 条记录` : undefined}
                    className={[
                      "calendar-cell",
                      cell.key === calendarDay ? "is-selected" : "",
                      cell.key === todayKey ? "is-today" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setCalendarDay(cell.key === calendarDay ? null : cell.key)}
                  >
                    <span>{cell.day}</span>
                    {cell.count ? <span className="calendar-dot" /> : null}
                  </button>
                ) : (
                  <span key={`pad-${index}`} className="calendar-pad" />
                )
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="sidebar-list-header">
              <span>{LIST_TITLES[viewMode] ?? "记录"}</span>
              <strong>{viewMode === "tasks" ? openTasks.length : filteredNotes.length}</strong>
            </div>

            {viewMode === "tasks" ? (
              <nav className="note-list" aria-label="待办汇总">
                {openTasks.length === 0 ? (
                  <p className="note-list-empty" role="status">
                    没有未完成的待办事项
                  </p>
                ) : (
                  openTasks.map((task, index) => (
                    <div
                      key={`${task.noteId}-${index}`}
                      className="note-item"
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenTaskNote(task.noteId)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onOpenTaskNote(task.noteId);
                        }
                      }}
                    >
                      <div className="note-item-header">
                        <span className="note-title">
                          <button
                            type="button"
                            className="task-toggle"
                            aria-label={`完成待办：${task.text || "未命名待办"}`}
                            title="标记完成"
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleTask(task);
                            }}
                          >
                            <Square size={15} />
                          </button>
                          <span className="note-title-text">{task.text || "未命名待办"}</span>
                        </span>
                      </div>
                      <span className="note-excerpt">{task.noteTitle}</span>
                      <span className="note-time">{formatTime(task.updatedAt)}</span>
                    </div>
                  ))
                )}
              </nav>
            ) : (
              <nav className="note-list">
                {filteredNotes.length === 0 ? (
                  <p className="note-list-empty" role="status">
                    {query || selectedFolder || selectedTag ? "没有匹配的记录" : "这里还没有记录"}
                  </p>
                ) : (
                  filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={note.id === activeId ? "note-item is-active" : "note-item"}
                      role="button"
                      tabIndex={0}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/suiji-note", note.id);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={() => onSelectNote(note.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onSelectNote(note.id);
                        }
                      }}
                    >
                      <div className="note-item-header">
                        <span className="note-title">
                          {note.pinnedAt ? <Pin size={13} className="note-pin-mark" /> : null}
                          <span className="note-title-text">
                            <HighlightedText text={note.title} keyword={searchKeyword} />
                          </span>
                        </span>
                        <div className="note-actions">
                          <button
                            type="button"
                            title={note.pinnedAt ? "取消置顶" : "置顶"}
                            aria-label={note.pinnedAt ? "取消置顶" : "置顶"}
                            onClick={(event) => {
                              event.stopPropagation();
                              onTogglePin(note.id);
                            }}
                          >
                            {note.pinnedAt ? <PinOff size={14} /> : <Pin size={14} />}
                          </button>
                          {note.trashedAt ? (
                            <>
                              <button
                                type="button"
                                title="恢复记录"
                                aria-label="恢复记录"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onRestoreNote(note.id);
                                }}
                              >
                                <ArchiveRestore size={14} />
                              </button>
                              <button
                                type="button"
                                title="永久删除"
                                aria-label="永久删除"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onPurgeNote(note.id);
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                title={note.favoriteAt ? "取消收藏" : "收藏"}
                                aria-label={note.favoriteAt ? "取消收藏" : "收藏"}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onToggleFavorite(note.id);
                                }}
                              >
                                {note.favoriteAt ? <StarOff size={14} /> : <Star size={14} />}
                              </button>
                              <button
                                type="button"
                                title={note.archivedAt ? "取消归档" : "归档"}
                                aria-label={note.archivedAt ? "取消归档" : "归档"}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onToggleArchive(note.id);
                                }}
                              >
                                {note.archivedAt ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                              </button>
                            </>
                          )}
                          {!note.trashedAt ? (
                            <button
                              type="button"
                              title="移到回收站"
                              aria-label="移到回收站"
                              onClick={(event) => {
                                event.stopPropagation();
                                onDeleteNote(note.id);
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {note.folder || note.tags.length > 0 ? (
                        <div className="note-meta">
                          {note.folder ? (
                            <span className="note-folder">
                              <Folder size={12} />
                              {note.folder}
                            </span>
                          ) : null}
                          {note.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="note-tag">
                              <HighlightedText text={tag} keyword={searchKeyword} />
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <span className="note-excerpt">
                        <HighlightedText text={note.excerpt || "空记录"} keyword={searchKeyword} />
                      </span>
                      <span className="note-time">{formatTime(note.updatedAt)}</span>
                    </div>
                  ))
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
