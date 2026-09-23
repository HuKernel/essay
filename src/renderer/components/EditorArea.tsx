import { BubbleMenu, EditorContent, FloatingMenu } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import { Bold, Code, Highlighter, Italic, Link2, Plus, Strikethrough, Type, Underline as UnderlineIcon } from "lucide-react";
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
    </div>
  );
}
