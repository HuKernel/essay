import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { FileText, Quote } from "lucide-react";

/** 打开指定笔记：通过全局事件通知 App 层（解耦 NodeView 与编辑器闭包）；blockText 用于定位到具体块 */
export function requestOpenNote(noteId: string, blockText?: string) {
  window.dispatchEvent(new CustomEvent("suiji:open-note", { detail: { noteId, blockText } }));
}

function PageLinkView({ node }: NodeViewProps) {
  const noteId = String(node.attrs.noteId ?? "");
  const title = String(node.attrs.title || "未命名子页面");
  const layout = String(node.attrs.layout || "default");
  const emoji = String(node.attrs.emoji || "");
  return (
    <NodeViewWrapper className="page-link-wrap">
      <button
        type="button"
        className={layout === "compact" ? "page-link-card is-compact" : "page-link-card"}
        data-page-link={noteId}
        onClick={() => requestOpenNote(noteId)}
        title="打开子页面"
      >
        {emoji ? (
          <span className="page-link-emoji" aria-hidden="true">{emoji}</span>
        ) : (
          <FileText size={16} />
        )}
        <span className="page-link-title">{title}</span>
        <span className="page-link-hint">子页面</span>
      </button>
    </NodeViewWrapper>
  );
}

export const PageLinkBlock = Node.create({
  name: "pageLink",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      noteId: { default: "" },
      title: { default: "" },
      layout: {
        default: "default",
        parseHTML: (element) => element.getAttribute("data-layout") || "default",
        renderHTML: (attributes) => (attributes.layout && attributes.layout !== "default" ? { "data-layout": attributes.layout } : {})
      },
      emoji: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-emoji") || "",
        renderHTML: (attributes) => (attributes.emoji ? { "data-emoji": attributes.emoji } : {})
      }
    };
  },
  parseHTML() {
    return [{ tag: "div[data-page-link]" }];
  },
  renderHTML({ node }) {
    return ["div", mergeAttributes({ "data-page-link": node.attrs.noteId }, this.options.HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(PageLinkView);
  }
});

function BlockRefView({ node }: NodeViewProps) {
  const refNoteId = String(node.attrs.refNoteId ?? "");
  return (
    <NodeViewWrapper className="block-ref-wrap">
      <button
        type="button"
        className="block-ref-card"
        data-block-ref={refNoteId}
        onClick={() => requestOpenNote(refNoteId, String(node.attrs.text || ""))}
        title={`跳转到「${node.attrs.refTitle || "来源笔记"}」的引用块`}
      >
        <Quote size={14} />
        <span className="block-ref-text">{String(node.attrs.text || "")}</span>
        <span className="block-ref-source">{String(node.attrs.refTitle || "未命名记录")}</span>
      </button>
    </NodeViewWrapper>
  );
}

export const BlockRefBlock = Node.create({
  name: "blockRef",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      refNoteId: { default: "" },
      refTitle: { default: "" },
      text: { default: "" }
    };
  },
  parseHTML() {
    return [{ tag: "div[data-block-ref]" }];
  },
  renderHTML({ node }) {
    return ["div", mergeAttributes({ "data-block-ref": node.attrs.refNoteId }, this.options.HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(BlockRefView);
  }
});
