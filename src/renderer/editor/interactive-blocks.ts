import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { EditorView } from "@tiptap/pm/view";
import type { Editor } from "@tiptap/react";

// 与 schema 类型名对应的可交互块集合（段落、标题、列表、表格、折叠块等）
const INTERACTIVE_TYPE_NAMES = new Set([
  "paragraph",
  "heading",
  "blockquote",
  "codeBlock",
  "bulletList",
  "orderedList",
  "taskList",
  "table",
  "horizontalRule",
  "image",
  "collapsibleBlock"
]);

type BlockPositions = { hoverPos: number; anchorPos: number };

export const interactiveBlocksKey = new PluginKey<BlockPositions>("interactiveBlocks");

function buildDecorations(hoverPos: number, anchorPos: number, state: EditorState): DecorationSet {
  const decorations: Decoration[] = [];
  const add = (pos: number, cls: string) => {
    if (pos < 0) return;
    const node = state.doc.nodeAt(pos);
    if (!node) return;
    decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: cls }));
  };
  add(hoverPos, hoverPos === anchorPos ? "editor-interactive-block is-hovered-block is-current-block" : "editor-interactive-block is-hovered-block");
  if (anchorPos >= 0 && anchorPos !== hoverPos) {
    add(anchorPos, "editor-interactive-block is-current-block");
  }
  return DecorationSet.create(state.doc, decorations);
}

/**
 * 悬停/当前块高亮必须走 Decoration：直接改 PM 拥有的 DOM class 会被
 * MutationObserver 当成外部篡改，触发 markDirty 重建 → class 丢失 → 再加
 * 的每帧循环；拖选时重建会带着 selectionToDOM 用过期选区覆盖原生拖选，
 * 表现为选区闪烁收缩、跨块时选不中。
 */
export const InteractiveBlocksExtension = Extension.create({
  name: "interactiveBlocks",
  addProseMirrorPlugins() {
    return [
      new Plugin<BlockPositions>({
        key: interactiveBlocksKey,
        state: {
          init: () => ({ hoverPos: -1, anchorPos: -1 }),
          apply: (tr, prev) => {
            const meta = tr.getMeta(interactiveBlocksKey);
            if (meta) return meta;
            if (!tr.docChanged) return prev;
            const mapOne = (pos: number) => {
              if (pos < 0) return -1;
              const result = tr.mapping.mapResult(pos, 1);
              return result.deleted ? -1 : result.pos;
            };
            return { hoverPos: mapOne(prev.hoverPos), anchorPos: mapOne(prev.anchorPos) };
          }
        },
        props: {
          decorations(state) {
            const positions = interactiveBlocksKey.getState(state);
            if (!positions) return DecorationSet.empty;
            return buildDecorations(positions.hoverPos, positions.anchorPos, state);
          }
        }
      })
    ];
  }
});

/** 从文档 pos 找到所属可交互块的起始 pos（找不到返回 -1） */
export function interactiveBlockPosAt(state: EditorState, pos: number): number {
  const clamped = Math.max(0, Math.min(pos, state.doc.content.size));
  const $pos = state.doc.resolve(clamped);
  for (let depth = $pos.depth; depth > 0; depth--) {
    if (INTERACTIVE_TYPE_NAMES.has($pos.node(depth).type.name)) {
      return $pos.before(depth);
    }
  }
  return -1;
}

/** 从事件目标 DOM 反查可交互块起始 pos（找不到返回 -1） */
export function interactiveBlockPosFromDom(view: EditorView, target: globalThis.Node | null): number {
  if (!target) return -1;
  let pos: number;
  try {
    pos = view.posAtDOM(target, 0);
  } catch {
    return -1;
  }
  return interactiveBlockPosAt(view.state, pos);
}

export function setInteractiveBlocks(editor: Editor, hoverPos: number, anchorPos: number) {
  editor.view.dispatch(editor.state.tr.setMeta(interactiveBlocksKey, { hoverPos, anchorPos }));
}
