import { describe, expect, it } from "vitest";
import { upgradeCollapsibleContent } from "../src/shared/content-upgrade";
import { toMarkdown } from "../src/shared/markdown";
import type { JSONContent } from "@tiptap/react";

function legacyDoc(blocks: JSONContent[]): JSONContent {
  return { type: "doc", content: blocks };
}

describe("upgradeCollapsibleContent", () => {
  it("旧形折叠块升级为标题/内容节点，保留标题、展开态与正文", () => {
    const upgraded = upgradeCollapsibleContent(
      legacyDoc([
        {
          type: "collapsibleBlock",
          attrs: { title: "笔记", open: false },
          content: [{ type: "paragraph", content: [{ type: "text", text: "正文" }] }]
        }
      ])
    );

    expect(upgraded.content?.[0]).toEqual({
      type: "collapsibleBlock",
      attrs: { open: false },
      content: [
        { type: "collapsibleTitle", content: [{ type: "text", text: "笔记" }] },
        {
          type: "collapsibleBody",
          content: [{ type: "paragraph", content: [{ type: "text", text: "正文" }] }]
        }
      ]
    });
  });

  it("缺省 open 视为展开（旧默认值）", () => {
    const upgraded = upgradeCollapsibleContent(
      legacyDoc([{ type: "collapsibleBlock", attrs: { title: "x" }, content: [] }])
    );
    expect(upgraded.content?.[0]?.attrs).toEqual({ open: true });
  });

  it("空标题升级出不带内容的标题节点", () => {
    const upgraded = upgradeCollapsibleContent(
      legacyDoc([{ type: "collapsibleBlock", attrs: { title: "", open: true }, content: [] }])
    );
    expect(upgraded.content?.[0]?.content?.[0]).toEqual({ type: "collapsibleTitle" });
    expect(upgraded.content?.[0]?.content?.[1]).toEqual({ type: "collapsibleBody", content: [] });
  });

  it("递归升级嵌套的旧形折叠块", () => {
    const upgraded = upgradeCollapsibleContent(
      legacyDoc([
        {
          type: "collapsibleBlock",
          attrs: { title: "外层", open: true },
          content: [
            { type: "collapsibleBlock", attrs: { title: "内层", open: false }, content: [] }
          ]
        }
      ])
    );

    const outerBody = upgraded.content?.[0]?.content?.[1];
    expect(outerBody?.type).toBe("collapsibleBody");
    expect(outerBody?.content?.[0]?.content?.[0]).toEqual({
      type: "collapsibleTitle",
      content: [{ type: "text", text: "内层" }]
    });
  });

  it("幂等：新形状重复升级结果不变", () => {
    const once = upgradeCollapsibleContent(
      legacyDoc([
        { type: "collapsibleBlock", attrs: { title: "t", open: true }, content: [] }
      ])
    );
    expect(upgradeCollapsibleContent(once)).toEqual(once);
  });

  it("无关节点原样通过", () => {
    const doc = legacyDoc([
      { type: "paragraph", content: [{ type: "text", text: "hi" }] }
    ]);
    expect(upgradeCollapsibleContent(doc)).toEqual(doc);
  });
});

describe("toMarkdown 折叠块", () => {
  function newCollapsible(title: string, body: JSONContent[] = []): JSONContent {
    return {
      type: "collapsibleBlock",
      attrs: { open: true },
      content: [
        title
          ? { type: "collapsibleTitle", content: [{ type: "text", text: title }] }
          : { type: "collapsibleTitle" },
        { type: "collapsibleBody", content: body }
      ]
    };
  }

  it("导出为层级化列表结构", () => {
    const md = toMarkdown(
      legacyDoc([
        newCollapsible("清单", [
          { type: "paragraph", content: [{ type: "text", text: "内容" }] },
          newCollapsible("子项")
        ])
      ])
    );
    expect(md).toBe("- 清单\n  内容\n  - 子项\n");
  });

  it("空标题回退为占位文案", () => {
    const md = toMarkdown(legacyDoc([newCollapsible("")]));
    expect(md).toBe("- 空折叠块\n");
  });
});

describe("旧表格单元格结构升级", () => {
  it("把直接内联文字包进段落，保留单元格属性与文字 marks", () => {
    const upgraded = upgradeCollapsibleContent({
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  attrs: { colspan: 2, rowspan: 1 },
                  content: [{ type: "text", text: "旧内容", marks: [{ type: "bold" }] }]
                },
                { type: "tableHeader" }
              ]
            }
          ]
        }
      ]
    });

    const cell = upgraded.content?.[0]?.content?.[0]?.content?.[0];
    expect(cell).toMatchObject({
      type: "tableCell",
      attrs: { colspan: 2, rowspan: 1 },
      content: [{ type: "paragraph", content: [{ type: "text", text: "旧内容", marks: [{ type: "bold" }] }] }]
    });
    expect(upgraded.content?.[0]?.content?.[0]?.content?.[1]).toEqual({
      type: "tableHeader",
      content: [{ type: "paragraph" }]
    });
  });

  it("修复 Tiptap 3 升级期间生成的空折叠块表格单元格", () => {
    const badCell = {
      type: "tableCell",
      content: [
        {
          type: "collapsibleBlock",
          attrs: { open: true },
          content: [{ type: "collapsibleTitle" }, { type: "collapsibleBody" }]
        }
      ]
    };
    const upgraded = upgradeCollapsibleContent({
      type: "table",
      content: [{ type: "tableRow", content: [badCell] }]
    });
    expect(upgraded.content?.[0]?.content?.[0]).toEqual({
      type: "tableCell",
      content: [{ type: "paragraph" }]
    });
  });

  it("升级幂等，不重复包裹合法单元格", () => {
    const once = upgradeCollapsibleContent({
      type: "tableCell",
      content: [{ type: "paragraph", content: [{ type: "text", text: "x" }] }]
    });
    expect(upgradeCollapsibleContent(once)).toEqual(once);
  });
});
