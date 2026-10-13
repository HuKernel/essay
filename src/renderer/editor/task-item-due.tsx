import { useEffect, useRef, useState } from "react";
import TaskItem from "@tiptap/extension-task-item";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { CalendarPlus } from "lucide-react";
import type { JSONContent } from "@tiptap/react";

/** 本地时区日期串（YYYY-MM-DD），避免 toISOString 的 UTC 偏移 */
export function localDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateStr(date);
}

export function describeDue(due: string) {
  const today = localDateStr();
  if (due === today) return "今天";
  if (due === shiftDate(1)) return "明天";
  if (due < today) return `逾期 ${due.slice(5).replace("-", "/")}`;
  return due.slice(5).replace("-", "/");
}

export type TodayTaskItem = {
  noteId: string;
  noteTitle: string;
  text: string;
  due: string;
};

/** 汇总全库未完成且日期已到（含逾期）的任务，逾期在前 */
export function collectTodayTasks(notes: Array<{ id: string; title: string; trashedAt: string | null; content: JSONContent }>): TodayTaskItem[] {
  const today = localDateStr();
  const items: TodayTaskItem[] = [];
  const textOf = (node: JSONContent): string =>
    (node.content ?? []).map((child) => (child.type === "text" ? child.text ?? "" : textOf(child))).join("");
  const walk = (note: { id: string; title: string; content: JSONContent }, node: JSONContent) => {
    if (node.type === "taskItem") {
      const due = typeof node.attrs?.dueDate === "string" ? node.attrs.dueDate : null;
      if (due && due <= today && !node.attrs?.checked) {
        const text = textOf(node).trim();
        if (text) items.push({ noteId: note.id, noteTitle: note.title || "未命名记录", text, due });
      }
    }
    (node.content ?? []).forEach((child) => walk(note, child));
  };
  for (const note of notes) {
    if (note.trashedAt) continue;
    walk(note, note.content ?? {});
  }
  return items.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0)).slice(0, 8);
}

function TaskItemDueView({ node, updateAttributes }: NodeViewProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const slotRef = useRef<HTMLSpanElement | null>(null);
  const due = typeof node.attrs.dueDate === "string" ? node.attrs.dueDate : null;
  const checked = Boolean(node.attrs.checked);
  const overdue = due !== null && due < localDateStr();

  useEffect(() => {
    if (!popoverOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (slotRef.current && event.target instanceof Node && slotRef.current.contains(event.target)) return;
      setPopoverOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [popoverOpen]);

  function applyDate(value: string | null) {
    updateAttributes({ dueDate: value });
    setPopoverOpen(false);
  }

  return (
    <NodeViewWrapper as="li" data-type="taskItem" data-checked={checked} className="task-item-due">
      <label contentEditable={false}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => updateAttributes({ checked: !checked })}
        />
      </label>
      <NodeViewContent className="task-item-content" />
      <span className="task-due-slot" contentEditable={false} ref={slotRef}>
        {popoverOpen ? (
          <span className="task-due-popover" role="menu" aria-label="任务日期">
            <button type="button" onClick={() => applyDate(localDateStr())}>
              今天
            </button>
            <button type="button" onClick={() => applyDate(shiftDate(1))}>
              明天
            </button>
            <button type="button" onClick={() => applyDate(shiftDate(7))}>
              一周后
            </button>
            {due ? (
              <button type="button" className="task-due-clear" onClick={() => applyDate(null)}>
                清除
              </button>
            ) : null}
            <input
              type="date"
              value={due ?? localDateStr()}
              onChange={(event) => applyDate(event.target.value || null)}
              aria-label="自定义日期"
            />
          </span>
        ) : null}
        <button
          type="button"
          className={
            due
              ? overdue && !checked
                ? "task-due-badge is-overdue"
                : checked
                  ? "task-due-badge is-done"
                  : "task-due-badge"
              : "task-due-add"
          }
          onClick={() => setPopoverOpen((current) => !current)}
          title="任务日期"
          aria-label="任务日期"
        >
          {due ? describeDue(due) : <CalendarPlus size={12} />}
        </button>
      </span>
    </NodeViewWrapper>
  );
}

/** 带截止日期的任务项：li 上存 data-due-date，行尾徽标点击设置日期 */
export const TaskItemDue = TaskItem.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      dueDate: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-due-date") || null,
        renderHTML: (attributes) => (attributes.dueDate ? { "data-due-date": attributes.dueDate } : {})
      }
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(TaskItemDueView);
  }
});
