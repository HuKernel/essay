import { useEffect, useState } from "react";
import { BubbleMenu, EditorContent, FloatingMenu } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import {
  Bold,
  Code,
  Copy,
  Highlighter,
  Italic,
  Link2,
  Plus,
  Repeat2,
  Strikethrough,
  Trash2,
  Type,
  Underline as UnderlineIcon
} from "lucide-react";
import type { BlockMenuCommand } from "../constants";
import { isEmptyParagraphSelection } from "../utils/text";
import { keepEditorFocus } from "./common";
import { EditorErrorBoundary } from "./EditorErrorBoundary";

type EditorAreaProps = {
  editor: Editor | null;
  editorWrapRef: React.Ref<HTMLDivElement>;
  imageInputRef: React.Ref<HTMLInputElement>;
  trashed: boolean;
  blockMenuOpen: boolean;
  blockMenuCommands: BlockMenuCommand[];
  onToggleBlockMenu: () => void;
  onApplyBlockMenuCommand: (command: BlockMenuCommand) => void;
  onHoverBlock: (target: EventTarget | null) => void;
  onLeave: () => void;
  onFocusEnd: () => void;
  onFocus: () => void;
  onImageChosen: (file: File | undefined) => void;
  onEditLink: () => void;
  onOpenFormat: () => void;
};

/** 光标位于列表/任务项内部时隐藏悬浮 +，避免遮住任务复选框 */
function inListItemContext(editor: Editor) {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth - 1; depth > 0; depth -= 1) {
    const name = $from.node(depth).type.name;
    if (name === "taskItem" || name === "listItem") return true;
  }
  return false;
}

type CtxMenuState = {
  x: number;
  y: number;
  node: ProseMirrorNode;
  start: number;
};

/** 支持块类型互转的块（容器类如 callout/表格不做转换） */
const TURNABLE_BLOCKS = new Set([
  "paragraph",
  "heading",
  "blockquote",
  "codeBlock",
  "bulletList",
  "orderedList",
  "taskList"
]);

const TURN_TARGETS: Array<{ id: string; label: string; kind: "node" | "list" }> = [
  { id: "paragraph", label: "正文", kind: "node" },
  { id: "heading1", label: "标题 1", kind: "node" },
  { id: "heading2", label: "标题 2", kind: "node" },
  { id: "heading3", label: "标题 3", kind: "node" },
  { id: "blockquote", label: "引用", kind: "node" },
  { id: "codeBlock", label: "代码块", kind: "node" },
  { id: "bulletList", label: "无序列表", kind: "list" },
  { id: "orderedList", label: "有序列表", kind: "list" },
  { id: "taskList", label: "任务列表", kind: "list" }
];

function blockTypeKey(node: ProseMirrorNode) {
  return node.type.name === "heading" ? `heading${node.attrs.level}` : node.type.name;
}

export function EditorArea(props: EditorAreaProps) {
  const {
    editor,
    editorWrapRef,
    imageInputRef,
    trashed,
    blockMenuOpen,
    blockMenuCommands,
    onToggleBlockMenu,
    onApplyBlockMenuCommand,
    onHoverBlock,
    onLeave,
    onFocusEnd,
    onFocus,
    onImageChosen,
    onEditLink,
    onOpenFormat
  } = props;

  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null);

  useEffect(() => {
    if (!ctxMenu) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCtxMenu(null);
    };
    const onWheel = () => setCtxMenu(null);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
    };
  }, [ctxMenu]);

  function handleContextMenu(event: React.MouseEvent) {
    if (!editor || trashed || !editor.isEditable) return;
    const posInfo = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
    if (!posInfo) return;
    const $pos = editor.state.doc.resolve(posInfo.pos);
    if ($pos.depth < 1) return;
    const node = $pos.node(1);
    const start = $pos.before(1);
    event.preventDefault();
    setCtxMenu({
      x: Math.min(event.clientX, window.innerWidth - 264),
      y: Math.min(event.clientY, window.innerHeight - 396),
      node,
      start
    });
  }

  function runTurnInto(target: string) {
    if (!editor || !ctxMenu) return;
    const blockStart = ctxMenu.start;
    const chain = editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        const resolved = state.doc.resolve(Math.min(blockStart + 1, state.doc.content.size));
        tr.setSelection(TextSelection.near(resolved, 1));
        return true;
      });
    if (target === "paragraph") chain.setParagraph();
    else if (target === "heading1") chain.setHeading({ level: 1 });
    else if (target === "heading2") chain.setHeading({ level: 2 });
    else if (target === "heading3") chain.setHeading({ level: 3 });
    else if (target === "blockquote") chain.toggleWrap("blockquote");
    else if (target === "codeBlock") chain.setNode("codeBlock");
    else if (target === "bulletList") chain.toggleBulletList();
    else if (target === "orderedList") chain.toggleOrderedList();
    else if (target === "taskList") chain.toggleTaskList();
    chain.run();
    setCtxMenu(null);
  }

  function runDuplicate() {
    if (!editor || !ctxMenu) return;
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.insert(ctxMenu.start, ctxMenu.node.copy());
        return true;
      })
      .run();
    setCtxMenu(null);
  }

  function runRemove() {
    if (!editor || !ctxMenu) return;
    const { start, node } = ctxMenu;
    // 文档仅剩一个块时删除会违反 schema（doc 至少一个子块），改为替换成空段落
    if (editor.state.doc.childCount <= 1) {
      editor
        .chain()
        .focus()
        .command(({ tr, state }) => {
          tr.replaceWith(start, start + node.nodeSize, state.schema.nodes.paragraph.create());
          return true;
        })
        .run();
    } else {
      editor.chain().focus().deleteRange({ from: start, to: start + node.nodeSize }).run();
    }
    setCtxMenu(null);
  }

  async function runCopyBlockText() {
    if (!ctxMenu) return;
    try {
      await navigator.clipboard.writeText(ctxMenu.node.textContent);
    } catch {
      // 剪贴板被占用时静默失败，与代码块复制行为一致
    }
    setCtxMenu(null);
  }

  return (
    <div
      ref={editorWrapRef}
      className="editor-wrap"
      onMouseMove={(event) => {
        if (event.buttons !== 0) return;
        onHoverBlock(event.target);
      }}
      onMouseLeave={onLeave}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          event.preventDefault();
          onFocusEnd();
        }
      }}
      onClick={onFocus}
      onContextMenu={handleContextMenu}
    >
      <input
        ref={imageInputRef}
        className="hidden-file-input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          onImageChosen(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      {editor ? (
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 120,
            placement: "top",
            maxWidth: "none",
            offset: [0, 10],
            zIndex: 40000
          }}
          shouldShow={({ editor }) => {
            if (trashed || !editor.isEditable || editor.isActive("codeBlock")) return false;
            const { selection } = editor.state;
            return !selection.empty && selection instanceof TextSelection;
          }}
        >
          <div className="selection-toolbar" role="toolbar" aria-label="文字格式">
            <button
              type="button"
              className={editor.isActive("bold") ? "selection-toolbar-button is-active" : "selection-toolbar-button"}
              onMouseDown={keepEditorFocus}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="加粗（Ctrl+B）"
              aria-label="加粗"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              className={editor.isActive("italic") ? "selection-toolbar-button is-active" : "selection-toolbar-button"}
              onMouseDown={keepEditorFocus}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="斜体（Ctrl+I）"
              aria-label="斜体"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              className={editor.isActive("underline") ? "selection-toolbar-button is-active" : "selection-toolbar-button"}
              onMouseDown={keepEditorFocus}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="下划线（Ctrl+U）"
              aria-label="下划线"
            >
              <UnderlineIcon size={15} />
            </button>
            <button
              type="button"
              className={editor.isActive("strike") ? "selection-toolbar-button is-active" : "selection-toolbar-button"}
              onMouseDown={keepEditorFocus}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="删除线"
              aria-label="删除线"
            >
              <Strikethrough size={15} />
            </button>
            <span className="selection-toolbar-divider" aria-hidden="true" />
            <button
              type="button"
              className={editor.isActive("highlight") ? "selection-toolbar-button is-active" : "selection-toolbar-button"}
              onMouseDown={keepEditorFocus}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              title="高亮"
              aria-label="高亮"
            >
              <Highlighter size={15} />
            </button>
            <button
              type="button"
              className={editor.isActive("code") ? "selection-toolbar-button is-active" : "selection-toolbar-button"}
              onMouseDown={keepEditorFocus}
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="行内代码"
              aria-label="行内代码"
            >
              <Code size={15} />
            </button>
            <button
              type="button"
              className={editor.isActive("link") ? "selection-toolbar-button is-active" : "selection-toolbar-button"}
              onMouseDown={keepEditorFocus}
              onClick={onEditLink}
              title="链接（Ctrl+K）"
              aria-label="链接"
            >
              <Link2 size={15} />
            </button>
            <span className="selection-toolbar-divider" aria-hidden="true" />
            <button
              type="button"
              className="selection-toolbar-button selection-toolbar-more"
              onMouseDown={keepEditorFocus}
              onClick={onOpenFormat}
              title="更多格式（字体、颜色、对齐）"
              aria-label="更多格式"
            >
              <Type size={15} />
            </button>
          </div>
        </BubbleMenu>
      ) : null}
      {editor ? (
        <FloatingMenu
          editor={editor}
          tippyOptions={{
            duration: 120,
            placement: "left-start",
            maxWidth: "none",
            offset: [0, 8],
            zIndex: 40000
          }}
          shouldShow={({ editor }) => isEmptyParagraphSelection(editor) && !trashed && !inListItemContext(editor)}
        >
          <div className="block-insert-anchor">
            <button
              type="button"
              className={blockMenuOpen ? "block-insert-trigger is-open" : "block-insert-trigger"}
              aria-label="插入块"
              title="插入块"
              onMouseDown={(event) => {
                event.preventDefault();
                onToggleBlockMenu();
              }}
            >
              <Plus size={15} />
            </button>
            {blockMenuOpen ? (
              <div className="block-insert-menu" aria-label="块格式菜单">
                {blockMenuCommands.map((command) => (
                  <button
                    key={command.id}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onApplyBlockMenuCommand(command);
                    }}
                  >
                    <strong>{command.label}</strong>
                    <span>{command.hint}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </FloatingMenu>
      ) : null}
      {editor ? (
        <EditorErrorBoundary>
          <EditorContent editor={editor} />
        </EditorErrorBoundary>
      ) : null}
      {ctxMenu ? (
        <div className="block-ctx-backdrop" onMouseDown={() => setCtxMenu(null)} role="presentation">
          <div
            className="block-ctx-menu"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
            role="menu"
            aria-label="块操作"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {TURNABLE_BLOCKS.has(ctxMenu.node.type.name)
              ? TURN_TARGETS.filter((target) => target.id !== blockTypeKey(ctxMenu.node)).map((target) => (
                  <button key={target.id} type="button" role="menuitem" onMouseDown={keepEditorFocus} onClick={() => runTurnInto(target.id)}>
                    <strong>转换为{target.label}</strong>
                  </button>
                ))
              : null}
            {TURNABLE_BLOCKS.has(ctxMenu.node.type.name) ? <span className="block-ctx-divider" aria-hidden="true" /> : null}
            <button type="button" role="menuitem" onMouseDown={keepEditorFocus} onClick={() => void runCopyBlockText()}>
              <Copy size={13} />
              <span>复制块文本</span>
            </button>
            <button type="button" role="menuitem" onMouseDown={keepEditorFocus} onClick={runDuplicate}>
              <Repeat2 size={13} />
              <span>重复块</span>
            </button>
            <button type="button" role="menuitem" className="block-ctx-danger" onMouseDown={keepEditorFocus} onClick={runRemove}>
              <Trash2 size={13} />
              <span>删除块</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
