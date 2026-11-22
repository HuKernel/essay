import type { JSONContent } from "@tiptap/react";

/**
 * 旧折叠块把标题存在节点属性里（attrs.title + 独立 input 编辑），
 * 新结构中标题和内容区都是文档内的真实节点（collapsibleTitle / collapsibleBody），
 * 与 TipTap 官方 Details 扩展的结构一致。此函数递归升级旧形状的折叠块。
 * 幂等：新形状节点（首个子节点是 collapsibleTitle）原样通过。
 */
export function upgradeCollapsibleContent(content: JSONContent): JSONContent {
  return upgradeNode(content);
}

const INLINE_CELL_NODES = new Set(["text", "hardBreak", "mathInline"]);

function normalizeTableCellContent(children: JSONContent[]) {
  const blocks: JSONContent[] = [];
  let inline: JSONContent[] = [];

  const flushInline = () => {
    if (inline.length) {
      blocks.push({ type: "paragraph", content: inline });
      inline = [];
    }
  };

  for (const child of children) {
    if (INLINE_CELL_NODES.has(child.type ?? "")) {
      inline.push(child);
    } else {
      flushInline();
      blocks.push(child);
    }
  }
  flushInline();

  return blocks.length ? blocks : [{ type: "paragraph" }];
}

function collectTableCells(nodes: JSONContent[], cells: JSONContent[] = []) {
  for (const node of nodes) {
    if (node.type === "tableCell" || node.type === "tableHeader") cells.push(node);
    collectTableCells(node.content ?? [], cells);
  }
  return cells;
}

function flattenEmptyGeneratedCollapsibleTables(children: JSONContent[]) {
  const cells = collectTableCells(children);
  if (
    cells.length === 0 ||
    !cells.every((cell) => {
      const only = cell.content?.length === 1 ? cell.content[0] : null;
      return only?.type === "collapsibleBlock" && (only.content?.[1]?.content?.length ?? 0) === 0;
    })
  ) {
    return children;
  }

  for (const cell of cells) {
    const generated = cell.content?.[0];
    const title = generated?.content?.[0];
    cell.content = title?.content?.length ? [{ type: "paragraph", content: title.content }] : [{ type: "paragraph" }];
  }
  return children;
}

function upgradeNode(node: JSONContent): JSONContent {
  let children = (node.content ?? []).map(upgradeNode);

  if (node.type === "table") children = flattenEmptyGeneratedCollapsibleTables(children);
  if (node.type === "tableCell" || node.type === "tableHeader") {
    return { ...node, content: normalizeTableCellContent(children) };
  }

  if (node.type !== "collapsibleBlock" || children[0]?.type === "collapsibleTitle") {
    return children.length ? { ...node, content: children } : { ...node };
  }

  const title = typeof node.attrs?.title === "string" ? node.attrs.title : "";
  const titleNode: JSONContent = title
    ? { type: "collapsibleTitle", content: [{ type: "text", text: title }] }
    : { type: "collapsibleTitle" };

  return {
    type: "collapsibleBlock",
    attrs: { open: node.attrs?.open !== false },
    content: [titleNode, { type: "collapsibleBody", content: children }]
  };
}
