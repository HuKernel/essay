import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Folder,
  ListTodo,
  Pin,
  PinOff,
  Square,
  Star,
  StarOff,
  Trash2
} from "lucide-react";
import type { NoteRecord } from "../../shared/types";
import type { DragEvent as ReactDragEvent } from "react";
import type { ViewMode } from "../constants";
import { HighlightedText } from "./common";
import { formatTime, type OpenTask } from "../utils/text";

type DocumentListPageProps = {
  viewMode: ViewMode;
  filteredNotes: NoteRecord[];
  activeId: string;
  searchKeyword: string;
  hasFilter: boolean;
  openTasks: OpenTask[];
  onOpenNote: (id: string) => void;
  onOpenTaskNote: (id: string) => void;
  onToggleTask: (task: OpenTask) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onPurgeNote: (id: string) => void;
};

const VIEW_TITLES: Partial<Record<ViewMode, string>> = {
  active: "全部记录",
  recent: "最近编辑",
  favorites: "收藏",
  tasks: "待办",
  archive: "归档",
  trash: "回收站",
  calendar: "日历"
};

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

function dayKeyOf(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function DocumentListPage(props: DocumentListPageProps) {
  const {
    viewMode,
    filteredNotes,
    activeId,
    searchKeyword,
    hasFilter,
    openTasks,
    onOpenNote,
    onOpenTaskNote,
    onToggleTask,
    onTogglePin,
    onToggleFavorite,
    onToggleArchive,
    onDeleteNote,
    onRestoreNote,
    onPurgeNote
  } = props;

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [calendarDay, setCalendarDay] = useState<string | null>(() => dayKeyOf(new Date()));

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

  const emptyText = hasFilter ? "没有匹配的记录" : "这里还没有记录";

  function noteDragStart(event: ReactDragEvent, noteId: string) {
    event.dataTransfer.setData("text/suiji-note", noteId);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <div className="doc-list-page" aria-label="文档列表">
      <div className="doc-list-head">
        <h2>
          {viewMode === "tasks" ? <ListTodo size={18} /> : null}
          {VIEW_TITLES[viewMode] ?? "全部记录"}
        </h2>
        <span>{viewMode === "tasks" ? openTasks.length : filteredNotes.length} 篇</span>
      </div>

      {viewMode === "calendar" ? (
        <div className="calendar-wrap is-page">
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
          {calendarDay ? (
            <>
              <div className="doc-list-section-label">
                {calendarDay} 的记录 · {dayNotes.length}
              </div>
              <div className="doc-list-grid">
                {dayNotes.length === 0 ? (
                  <p className="doc-list-empty">这一天没有记录</p>
                ) : (
                  dayNotes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      className={note.id === activeId ? "home-doc-row is-active" : "home-doc-row"}
                      onClick={() => onOpenNote(note.id)}
                    >
                      <strong>{note.title || "未命名记录"}</strong>
                      <span>{note.excerpt || "空记录"}</span>
                      <em>{formatTime(note.updatedAt)}</em>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : null}
        </div>
      ) : viewMode === "tasks" ? (
        <div className="doc-list-grid">
          {openTasks.length === 0 ? (
            <p className="doc-list-empty">没有未完成的待办事项</p>
          ) : (
            openTasks.map((task, index) => (
              <div key={`${task.noteId}-${index}`} className="note-item is-task">
                <div className="note-item-header">
                  <span className="note-title">
                    <button
                      type="button"
                      className="task-toggle"
                      aria-label={`完成待办：${task.text || "未命名待办"}`}
                      title="标记完成"
                      onClick={() => onToggleTask(task)}
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
        </div>
      ) : (
        <div className="doc-list-grid">
          {filteredNotes.length === 0 ? (
            <p className="doc-list-empty">{emptyText}</p>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={note.id === activeId ? "note-item is-active" : "note-item"}
                role="button"
                tabIndex={0}
                draggable
                onDragStart={(event) => noteDragStart(event, note.id)}
                onClick={() => onOpenNote(note.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenNote(note.id);
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
        </div>
      )}
    </div>
  );
}
