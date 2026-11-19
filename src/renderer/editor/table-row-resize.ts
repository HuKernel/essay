import TableRow from "@tiptap/extension-table-row";
import { Plugin } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

const MIN_ROW_HEIGHT = 32;
const ROW_RESIZE_HIT_AREA = 6;

type DragState = {
  rowElement: HTMLTableRowElement;
  rowPos: number;
  startY: number;
  startHeight: number;
};

function tableRowPosition(view: EditorView, row: HTMLTableRowElement) {
  try {
    const $pos = view.state.doc.resolve(view.posAtDOM(row, 0));
    for (let depth = $pos.depth; depth > 0; depth -= 1) {
      if ($pos.node(depth).type.name === "tableRow") {
        return {
          pos: $pos.before(depth),
          height: Math.round(row.getBoundingClientRect().height)
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

function resizableRowFromEvent(view: EditorView, event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element) || !view.dom.contains(target)) return null;

  const cell = target.closest("td,th");
  const row = target.closest("tr");
  if (!(cell instanceof HTMLTableCellElement) || !(row instanceof HTMLTableRowElement)) return null;
  if (cell.rowSpan > 1) return null;

  const rect = cell.getBoundingClientRect();
  const distanceFromBottom = rect.bottom - event.clientY;
  const distanceFromRight = rect.right - event.clientX;
  if (distanceFromBottom < 0 || distanceFromBottom > ROW_RESIZE_HIT_AREA || distanceFromRight <= ROW_RESIZE_HIT_AREA) {
    return null;
  }

  return tableRowPosition(view, row);
}

export const ResizableTableRow = TableRow.extend({
  addAttributes() {
    return {
      rowHeight: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute("height") || element.style.height;
          const value = Number.parseInt(raw, 10);
          return Number.isFinite(value) ? Math.max(MIN_ROW_HEIGHT, value) : null;
        },
        renderHTML: (attributes) => (attributes.rowHeight ? { style: `height: ${attributes.rowHeight}px` } : {})
      }
    };
  },

  addProseMirrorPlugins() {
    let dragging: DragState | null = null;
    let moveHandler: ((event: MouseEvent) => void) | null = null;
    let upHandler: (() => void) | null = null;

    const stopDragging = (view: EditorView) => {
      dragging = null;
      if (moveHandler) window.removeEventListener("mousemove", moveHandler);
      if (upHandler) window.removeEventListener("mouseup", upHandler);
      moveHandler = null;
      upHandler = null;
      view.dom.classList.remove("is-resizing-row");
    };

    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            mousemove: (view, event) => {
              if (!dragging) {
                const hit = Boolean(resizableRowFromEvent(view, event as MouseEvent));
                view.dom.classList.toggle("can-resize-row", hit);
              }
              return false;
            },
            mousedown: (view, event) => {
              const target = resizableRowFromEvent(view, event as MouseEvent);
              if (!target) return false;

              const rowElement = view.nodeDOM(target.pos);
              if (!(rowElement instanceof HTMLTableRowElement)) return false;

              const mouseEvent = event as MouseEvent;
              mouseEvent.preventDefault();
              dragging = {
                rowElement,
                rowPos: target.pos,
                startY: mouseEvent.clientY,
                startHeight: Math.round(rowElement.getBoundingClientRect().height)
              };
              view.dom.classList.add("is-resizing-row");
              view.focus();

              moveHandler = (moveEvent: MouseEvent) => {
                if (!dragging || view.isDestroyed) return;
                const nextHeight = Math.max(
                  MIN_ROW_HEIGHT,
                  Math.round(dragging.startHeight + moveEvent.clientY - dragging.startY)
                );
                view.dispatch(view.state.tr.setNodeAttribute(dragging.rowPos, "rowHeight", nextHeight));
              };
              upHandler = () => {
                if (!view.isDestroyed) stopDragging(view);
              };

              window.addEventListener("mousemove", moveHandler);
              window.addEventListener("mouseup", upHandler);
              return true;
            }
          }
        },
        destroy() {
          if (moveHandler) window.removeEventListener("mousemove", moveHandler);
          if (upHandler) window.removeEventListener("mouseup", upHandler);
        }
      })
    ];
  }
});
