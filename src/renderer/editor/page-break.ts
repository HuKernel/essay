import { Node } from "@tiptap/core";

/** 分页符：编辑器内显示为虚线标记，打印 / 导出 PDF 时在此处分页 */
export const PageBreakExtension = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,
  selectable: true,
  parseHTML() {
    return [{ tag: 'div[data-type="page-break"]' }];
  },
  renderHTML() {
    return ["div", { "data-type": "page-break" }];
  }
});
