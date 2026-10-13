import { Node } from "@tiptap/core";

/** 块组合：把多个顶级块包进一个可整体移动的容器（右键可取消组合） */
export const BlockGroupExtension = Node.create({
  name: "blockGroup",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: 'div[data-type="block-group"]' }];
  },
  renderHTML() {
    return ["div", { "data-type": "block-group" }, 0];
  }
});
