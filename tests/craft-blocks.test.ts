// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BlockRefBlock, PageLinkBlock } from "../src/renderer/editor/craft-blocks";

function createEditor(content: unknown) {
  return new Editor({
    extensions: [StarterKit, PageLinkBlock, BlockRefBlock],
    content
  });
}

describe("craft blocks", () => {
  it("pageLink/blockRef 节点在 schema 中往返并输出 data 属性", () => {
    const editor = createEditor({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "正文" }] },
        { type: "pageLink", attrs: { noteId: "n1", title: "子页面A" } },
        { type: "blockRef", attrs: { refNoteId: "n2", refTitle: "来源笔记", text: "被引用的块" } }
      ]
    });
    const json = editor.getJSON();
    expect(json.content?.map((block) => block.type)).toEqual(["paragraph", "pageLink", "blockRef"]);
    expect(json.content?.[1]?.attrs).toMatchObject({ noteId: "n1", title: "子页面A" });
    expect(json.content?.[2]?.attrs).toMatchObject({ refNoteId: "n2", text: "被引用的块" });
    const html = editor.getHTML();
    expect(html).toContain('data-page-link="n1"');
    expect(html).toContain('data-block-ref="n2"');
    editor.destroy();
  });
});
