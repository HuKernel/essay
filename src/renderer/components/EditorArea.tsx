import { useEffect, useState } from "react";
import { BubbleMenu, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import { NodeRange, type Node as ProseMirrorNode } from "@tiptap/pm/model";
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Boxes,
  ChevronsDown,
  ChevronsUp,
  Code,
  Copy,
  FileOutput,
  Highlighter,
  Italic,
  Link2,
  Repeat2,
  Strikethrough,
  Trash2,
  Type,
  Underline as UnderlineIcon
} from "lucide-react";
import { HR_VARIANTS, HR_VARIANT_LABELS, type HRVariant } from "../editor/hr-variant";
import { keepEditorFocus } from "./common";
import { EditorErrorBoundary } from "./EditorErrorBoundary";
import { requestOpenNote } from "../editor/craft-blocks";

type EditorAreaProps = {
  editor: Editor | null;
  editorWrapRef: React.Ref<HTMLDivElement>;
  imageInputRef: React.Ref<HTMLInputElement>;
  trashed: boolean;
  onHoverBlock: (target: EventTarget | null) => void;
  onLeave: () => void;
  onFocusEnd: () => void;
  onFocus: () => void;
  onImageChosen: (file: File | undefined) => void;
  onEditLink: () => void;
  onOpenFormat: () => void;
  /** 把一段顶级块范围提取为子页面（原位替换为卡片） */
  onPromoteToSubpage: (range: { from: number; to: number }) => void;
};

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
    onHoverBlock,
    onLeave,
    onFocusEnd,
    onFocus,
    onImageChosen,
    onEditLink,
    onOpenFormat,
    onPromoteToSubpage
  } = props;

  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null);
  const [subPages, setSubPages] = useState<Array<{ noteId: string; title: string }>>([]);

  // 文末子页面网格：跟随编辑实时聚合文档内的 pageLink 块
  useEffect(() => {
    if (!editor) {
      setSubPages([]);
      return;
    }
    let lastKey = "";
    const update = () => {
      const items: Array<{ noteId: string; title: string }> = [];
      editor.state.doc.descendants((node) => {
        if (node.type.name === "pageLink") {
          items.push({ noteId: String(node.attrs.noteId ?? ""), title: String(node.attrs.title || "未命名子页面") });
        }
        return true;
      });
      const key = items.map((item) => `${item.noteId}:${item.title}`).join("|");
      if (key !== lastKey) {
        lastKey = key;
        setSubPages(items);
      }
    };
    update();
    editor.on("transaction", update);
    return () => {
      editor.off("transaction", update);
    };
  }, [editor]);

  /** 选区覆盖的顶级块范围（提升为子页面用） */
  function selectionBlockRange() {
    if (!editor) return null;
    const { selection } = editor.state;
    if (selection.empty) return null;
    const start = editor.state.doc.resolve(selection.from).before(1);
    const end = editor.state.doc.resolve(selection.to).after(1);
    return start < end && start >= 0 && end <= editor.state.doc.content.size ? { from: start, to: end } : null;
  }

  useEffect(() => {
    if (!ctxMenu) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCtxMenu(null);
    };
    // 页面滚动时关闭菜单；鼠标在菜单内滚动（菜单自身 overflow 滚动）不关闭
    const onWheel = (event: WheelEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".block-ctx-menu")) return;
      setCtxMenu(null);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
    };
  }, [ctxMenu]);

  function handleContextMenu(event: React.MouseEvent) {
    if (!editor || trashed || !editor.isEditable) return;
    // hr 只有 1px 高，posAtCoords 会落到相邻块；posAtDOM 对 leaf 节点的
    // 边界归属也不可靠。右键命中 hr 时反向遍历文档，用 view.nodeDOM 精确匹配。
    let node: ProseMirrorNode | null = null;
    let start = -1;
    const hrEl = event.target instanceof Element ? event.target.closest("hr") : null;
    if (hrEl) {
      editor.state.doc.descendants((candidate, pos) => {
        if (candidate.type.name === "horizontalRule" && editor.view.nodeDOM(pos) === hrEl) {
          node = candidate;
          start = pos;
          return false;
        }
        return true;
      });
    }
    if (!node || start < 0) {
      const posInfo = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
      if (!posInfo) return;
      const $pos = editor.state.doc.resolve(posInfo.pos);
      if ($pos.depth < 1) return;
      node = $pos.node(1);
      start = $pos.before(1);
    }
    const targetNode: ProseMirrorNode | null = node;
    const targetStart: number = start;
    if (!targetNode || targetStart < 0) return;
    event.preventDefault();
    setCtxMenu({
      x: Math.min(event.clientX, window.innerWidth - 264),
      y: Math.min(event.clientY, window.innerHeight - 396),
      node: targetNode,
      start: targetStart
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

  /** 把选区覆盖的顶级块包进组合容器 */
  function runGroupSelection() {
    if (!editor) return;
    const range = selectionBlockRange();
    if (!range) return;
    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        const $from = state.doc.resolve(range.from);
        const $to = state.doc.resolve(range.to);
        tr.wrap(new NodeRange($from, $to, 0), [{ type: state.schema.nodes.blockGroup }]);
        return true;
      })
      .run();
  }

  /** 取消组合：选区覆盖组内全部块后 lift 出容器 */
  function runUngroup() {
    if (!editor || !ctxMenu) return;
    const { start, node } = ctxMenu;
    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        const innerFrom = start + 1;
        const innerTo = start + node.nodeSize - 1;
        if (innerTo <= innerFrom) return false;
        tr.setSelection(TextSelection.create(state.doc, innerFrom, innerTo));
        return true;
      })
      .lift("blockGroup")
      .run();
    setCtxMenu(null);
  }

  /** 切换子页面卡片布局 */
  function runSetPageLinkLayout(layout: "default" | "compact") {
    if (!editor || !ctxMenu) return;
    const { start, node } = ctxMenu;
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.setNodeMarkup(start, undefined, { ...node.attrs, layout });
        return true;
      })
      .run();
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

  function runSetHrVariant(variant: HRVariant) {
    if (!editor || !ctxMenu) return;
    const { start, node } = ctxMenu;
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.setNodeMarkup(start, undefined, { ...node.attrs, variant });
        return true;
      })
      .run();
    setCtxMenu(null);
  }

  /** 顶级块四向移动：delete 后按目标索引重插 */
  function runMoveBlock(direction: "up" | "down" | "top" | "bottom") {
    if (!editor || !ctxMenu) return;
    const { start, node } = ctxMenu;
    const size = node.nodeSize;
    editor
      .chain()
      .focus()
      .command(({ tr, state }) => {
        // forEach 签名是 (child, offset, index)：必须用第三个参数做索引
        let index = -1;
        state.doc.forEach((_child, offset, i) => {
          if (index < 0 && offset === start) index = i;
        });
        if (index < 0 || state.doc.childCount < 2) return false;
        const count = state.doc.childCount;
        const target =
          direction === "up" ? index - 1 : direction === "down" ? index + 1 : direction === "top" ? 0 : count - 1;
        if (target < 0 || target >= count || target === index) return false;
        tr.delete(start, start + size);
        // 删除后共 count-1 块；bottom 的 target 越界一格 → 追加到文档末尾
        let insertPos = tr.doc.content.size;
        if (target < tr.doc.childCount) {
          tr.doc.forEach((_child, offset, i) => {
            if (i === target) insertPos = offset;
          });
        }
        tr.insert(insertPos, node);
        return true;
      })
      .run();
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
            <button
              type="button"
              className="selection-toolbar-button"
              onMouseDown={keepEditorFocus}
              onClick={() => {
                const range = selectionBlockRange();
                if (range) onPromoteToSubpage(range);
              }}
              title="把选中内容所在块提升为子页面"
              aria-label="提升为子页面"
            >
              <FileOutput size={15} />
            </button>
            <button
              type="button"
              className="selection-toolbar-button"
              onMouseDown={keepEditorFocus}
              onClick={runGroupSelection}
              title="把选中的块组合成整体"
              aria-label="组合块"
            >
              <Boxes size={15} />
            </button>
          </div>
        </BubbleMenu>
      ) : null}
      {editor ? (
        <EditorErrorBoundary>
          <EditorContent editor={editor} />
        </EditorErrorBoundary>
      ) : null}
      {!trashed && subPages.length > 0 ? (
        <section className="subpage-grid-section" aria-label="子页面">
          <h3 className="subpage-grid-title">子页面 · {subPages.length}</h3>
          <div className="subpage-grid">
            {subPages.map((page) => (
              <button
                key={page.noteId}
                type="button"
                className="subpage-grid-card"
                onClick={() => requestOpenNote(page.noteId)}
                title={`打开「${page.title}」`}
              >
                <strong>{page.title}</strong>
                <em>子页面</em>
              </button>
            ))}
          </div>
        </section>
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
            {ctxMenu.node.type.name === "horizontalRule" ? (
              <>
                <span className="block-ctx-label">分隔线样式</span>
                {HR_VARIANTS.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    role="menuitem"
                    className={
                      (ctxMenu.node.attrs.variant || "solid") === variant
                        ? "block-ctx-item is-active"
                        : "block-ctx-item"
                    }
                    onMouseDown={keepEditorFocus}
                    onClick={() => runSetHrVariant(variant)}
                  >
                    <span className={`hr-sample hr-sample-${variant}`} aria-hidden="true" />
                    <span>{HR_VARIANT_LABELS[variant]}</span>
                  </button>
                ))}
                <span className="block-ctx-divider" aria-hidden="true" />
              </>
            ) : null}
            {ctxMenu.node.type.name === "pageLink" ? (
              <>
                <span className="block-ctx-label">卡片样式</span>
                <button
                  type="button"
                  role="menuitem"
                  className={(ctxMenu.node.attrs.layout || "default") === "default" ? "block-ctx-item is-active" : "block-ctx-item"}
                  onMouseDown={keepEditorFocus}
                  onClick={() => runSetPageLinkLayout("default")}
                >
                  <span>标准卡片</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={ctxMenu.node.attrs.layout === "compact" ? "block-ctx-item is-active" : "block-ctx-item"}
                  onMouseDown={keepEditorFocus}
                  onClick={() => runSetPageLinkLayout("compact")}
                >
                  <span>紧凑行内</span>
                </button>
                <span className="block-ctx-divider" aria-hidden="true" />
              </>
            ) : null}
            {ctxMenu.node.type.name === "blockGroup" ? (
              <button type="button" role="menuitem" onMouseDown={keepEditorFocus} onClick={runUngroup}>
                <Boxes size={13} />
                <span>取消组合</span>
              </button>
            ) : null}
            <span className="block-ctx-move" role="group" aria-label="移动区块">
              <button type="button" title="移到顶部" aria-label="移到顶部" onMouseDown={keepEditorFocus} onClick={() => runMoveBlock("top")}>
                <ChevronsUp size={14} />
              </button>
              <button type="button" title="上移一格" aria-label="上移一格" onMouseDown={keepEditorFocus} onClick={() => runMoveBlock("up")}>
                <ArrowUp size={14} />
              </button>
              <button type="button" title="下移一格" aria-label="下移一格" onMouseDown={keepEditorFocus} onClick={() => runMoveBlock("down")}>
                <ArrowDown size={14} />
              </button>
              <button type="button" title="移到底部" aria-label="移到底部" onMouseDown={keepEditorFocus} onClick={() => runMoveBlock("bottom")}>
                <ChevronsDown size={14} />
              </button>
            </span>
            <button
              type="button"
              role="menuitem"
              onMouseDown={keepEditorFocus}
              onClick={() => {
                onPromoteToSubpage({ from: ctxMenu.start, to: ctxMenu.start + ctxMenu.node.nodeSize });
                setCtxMenu(null);
              }}
            >
              <FileOutput size={13} />
              <span>提升为子页面</span>
            </button>
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
