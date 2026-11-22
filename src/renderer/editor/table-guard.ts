import { Plugin, TextSelection, type EditorState } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { Table } from "@tiptap/extension-table";

function findTablePosition(state: EditorState) {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === "table") {
      return { pos: $from.before(depth), node: $from.node(depth) };
    }
  }
  return null;
}

function findTableAroundPosition(state: EditorState, position: number) {
  const $pos = state.doc.resolve(position);
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    if ($pos.node(depth).type.name === "table") {
      return { pos: $pos.before(depth), node: $pos.node(depth) };
    }
  }
  return null;
}

export function redirectClickOutsideTable(view: EditorView, position: number, event: MouseEvent) {
  const table = findTableAroundPosition(view.state, position);
  if (!table) return false;

  const dom = view.nodeDOM(table.pos);
  const tableElement = dom instanceof HTMLTableElement ? dom : dom instanceof Element ? dom.querySelector("table") : null;
  if (!tableElement) return false;

  const rect = tableElement.getBoundingClientRect();
  const outside =
    event.clientX < rect.left - 2 ||
    event.clientX > rect.right + 2 ||
    event.clientY < rect.top - 2 ||
    event.clientY > rect.bottom + 2;
  if (!outside) return false;

  const end = table.pos + table.node.nodeSize;
  view.dispatch(view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(end), 1)));
  return true;
}

export const TableGuardExtension = Table.extend({
  addCommands() {
    return {
      ...this.parent?.(),
      deleteTable:
        () =>
        ({ state, tr, dispatch }) => {
          const table = findTablePosition(state);
          if (!table) return false;
          if (dispatch) {
            const parent = state.doc.resolve(table.pos).parent;
            if (parent.childCount > 1) {
              tr.delete(table.pos, table.pos + table.node.nodeSize);
            } else {
              tr.replaceWith(table.pos, table.pos + table.node.nodeSize, state.schema.nodes.paragraph.create());
            }
            tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(table.pos + 1, tr.doc.content.size))));
          }
          return true;
        }
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleClick(view, position, event) {
            return redirectClickOutsideTable(view, position, event as MouseEvent);
          }
        },
        appendTransaction(_transactions, _oldState, newState) {
          const lastChild = newState.doc.lastChild;
          if (lastChild?.type.name !== "table") return null;
          return newState.tr.insert(newState.doc.content.size, newState.schema.nodes.paragraph.create());
        }
      })
    ];
  }
});
