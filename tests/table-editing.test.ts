// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableGuardExtension, redirectClickOutsideTable } from "../src/renderer/editor/table-guard";
import { ResizableTableRow } from "../src/renderer/editor/table-row-resize";
import { StyledTableCell, StyledTableHeader } from "../src/renderer/editor/table-cell-styles";
import { CollapsibleBlockExtensions } from "../src/renderer/editor/collapsible-block";
import { CellSelection } from "@tiptap/pm/tables";
import { upgradeCollapsibleContent } from "../src/shared/content-upgrade";
import { buildHtmlExport } from "../src/main/html-export";
import { markdownToDoc } from "../src/shared/markdown-doc";
import { toMarkdown } from "../src/shared/markdown";

const cell = (text: string, header = false) => ({
  type: header ? "tableHeader" : "tableCell",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }]
});

function tableDoc(before = "前", after = "后") {
  return {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: before }] },
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [cell("abcd", true), cell("efgh", true)]
          },
          {
            type: "tableRow",
            content: [cell("ijkl"), cell("mnop")]
          }
        ]
      },
      { type: "paragraph", content: [{ type: "text", text: after }] }
    ]
  };
}

function createEditor(content = tableDoc()) {
  return new Editor({
    extensions: [
      StarterKit.configure({ trailingNode: false }),
      TableGuardExtension.configure({ resizable: true }),
      ResizableTableRow,
      StyledTableHeader,
      StyledTableCell,
      ...CollapsibleBlockExtensions
    ],
    content
  });
}

function press(editor: Editor, key: "Backspace" | "Delete") {
  const event = new KeyboardEvent("keydown", { key, cancelable: true });
  return editor.view.someProp("handleKeyDown", (handler) => handler(editor.view, event));
}

function textPositions(editor: Editor, text: string) {
  let from = -1;
  let to = -1;
  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.text === text && from < 0) {
      from = pos;
      to = pos + node.nodeSize;
      return false;
    }
    return true;
  });
  if (from < 0) throw new Error(`text not found: ${text}`);
  return { from, to };
}

function cellPositions(editor: Editor) {
  const positions: number[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "tableCell" || node.type.name === "tableHeader") positions.push(pos);
  });
  return positions;
}

function exportNote(content: ReturnType<Editor["getJSON"]>) {
  return buildHtmlExport({
    id: "00000000-0000-0000-0000-000000000001",
    title: "表格",
    excerpt: "",
    tags: [],
    folder: "",
    favoriteAt: null,
    archivedAt: null,
    trashedAt: null,
    pinnedAt: null,
    parentId: null,
    bodyFont: null,
    coverAsset: null,
    pageBg: null,
    content,
    html: "",
    plainText: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  });
}

describe("table editing", () => {
  it("keeps loading legacy cells whose only child is a collapsible block", () => {
    const legacyCell = {
      type: "tableCell",
      content: [
        {
          type: "collapsibleBlock",
          attrs: { open: true },
          content: [{ type: "collapsibleTitle" }, { type: "collapsibleBody" }]
        }
      ]
    };
    const editor = createEditor({
      type: "doc",
      content: [{ type: "table", content: [{ type: "tableRow", content: [legacyCell] }] }]
    });
    expect(editor.state.doc.child(0).child(0).child(0).child(0).type.name).toBe("collapsibleBlock");
    editor.destroy();
  });

  it("keeps an editable paragraph after a table at the document end", () => {
    const editor = createEditor({ type: "doc", content: [{ type: "paragraph" }] });
    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: true });
    const content = editor.getJSON().content!;
    expect(content.at(-1)?.type).toBe("paragraph");
    editor.destroy();
  });

  it("deletes a sole table without leaving its first child block", () => {
    const editor = createEditor({ type: "doc", content: [{ type: "paragraph" }] });
    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: true });
    editor.commands.deleteTable();
    const content = editor.getJSON().content!;
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe("paragraph");
    expect(editor.state.selection.$from.parent.type.name).toBe("paragraph");
    editor.destroy();
  });

  it("deletes a table between paragraphs without leaving cell content", () => {
    const editor = createEditor();
    let cellPos = 0;
    editor.state.doc.descendants((node, pos) => {
      if (!cellPos && node.type.name === "tableCell") cellPos = pos + 2;
    });
    editor.commands.setTextSelection(cellPos);
    editor.commands.deleteTable();
    expect(editor.getJSON().content?.map((node) => node.type)).toEqual(["paragraph", "paragraph"]);
    editor.destroy();
  });

  it("keeps typed text in the paragraph after a table", () => {
    const editor = createEditor({ type: "doc", content: [{ type: "paragraph" }] });
    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: true });
    const end = editor.state.doc.content.size;
    editor.commands.setTextSelection(end);
    editor.commands.insertContent("后文");
    const content = editor.getJSON().content!;
    expect(content.at(-1)).toMatchObject({ type: "paragraph", content: [{ type: "text", text: "后文" }] });
    editor.destroy();
  });

  it("redirects a click outside the table rectangle to the trailing paragraph", () => {
    const editor = createEditor({ type: "doc", content: [{ type: "paragraph" }] });
    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: true });
    let cellPos = 0;
    editor.state.doc.descendants((node, pos) => {
      if (!cellPos && node.type.name === "tableCell") cellPos = pos + 2;
    });
    const tableElement = editor.view.dom.querySelector("table")!;
    const rect = tableElement.getBoundingClientRect();
    const click = new MouseEvent("click", { clientX: rect.right + 20, clientY: rect.top + 2 });
    expect(
      redirectClickOutsideTable(editor.view as never, cellPos, click)
    ).toBe(true);
    expect(editor.state.selection.$from.parent.type.name).toBe("paragraph");
    editor.destroy();
  });

  it("fills inserted cells with paragraphs instead of the highest-priority block", () => {
    const editor = createEditor({ type: "doc", content: [{ type: "paragraph" }] });
    editor.commands.insertTable({ rows: 2, cols: 2, withHeaderRow: true });
    const cellContents = editor.state.doc.nodesBetween(0, editor.state.doc.content.size, (node) => {
      if (node.type.name !== "tableCell" && node.type.name !== "tableHeader") return;
      expect(node.childCount).toBe(1);
      expect(node.child(0).type.name).toBe("paragraph");
    });
    expect(cellContents).toBeFalsy();
    editor.destroy();
  });

  it("allows arbitrary text deletion inside one cell", () => {
    const editor = createEditor();
    const target = textPositions(editor, "abcd");
    editor.commands.setTextSelection({ from: target.from + 1, to: target.to - 1 });

    expect(editor.commands.deleteSelection()).toBe(true);
    expect(editor.state.doc.textContent).toContain("ad");
    expect(cellPositions(editor)).toHaveLength(4);
    editor.destroy();
  });

  it("inserts custom row and column counts", () => {
    const editor = createEditor({ type: "doc", content: [{ type: "paragraph" }] });
    expect(editor.commands.insertTable({ rows: 5, cols: 2, withHeaderRow: true })).toBe(true);

    let tableNode: typeof editor.state.doc.content.firstChild | null = null;
    editor.view.state.doc.descendants((node) => {
      if (node.type.name === "table") {
        tableNode = node;
        return false;
      }
      return true;
    });
    expect(tableNode).toBeTruthy();
    expect(tableNode?.childCount).toBe(5);
    expect(tableNode?.child(0).childCount).toBe(2);
    expect(tableNode?.child(4).childCount).toBe(2);
    expect(tableNode?.child(0).child(0).type.name).toBe("tableHeader");
    expect(tableNode?.child(4).child(0).type.name).toBe("tableCell");
    editor.destroy();
  });

  it("toggles the first column between header and normal cells", () => {
    const editor = createEditor({
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            { type: "tableRow", content: [cell("a"), cell("b")] },
            { type: "tableRow", content: [cell("c"), cell("d")] }
          ]
        }
      ]
    });

    const columnTypes = () => {
      const types: string[] = [];
      editor.state.doc.descendants((node) => {
        if (node.type.name === "tableRow") types.push(node.child(0).type.name);
      });
      return types;
    };
    let positions = cellPositions(editor);
    editor.commands.setCellSelection({ anchorCell: positions[0], headCell: positions[0] });
    expect(editor.chain().focus().toggleHeaderColumn().run()).toBe(true);
    expect(columnTypes()).toEqual(["tableHeader", "tableHeader"]);

    positions = cellPositions(editor);
    editor.commands.setCellSelection({ anchorCell: positions[2], headCell: positions[2] });
    expect(editor.commands.toggleHeaderColumn()).toBe(true);
    expect(columnTypes()).toEqual(["tableCell", "tableCell"]);
    editor.destroy();
  });

  it("inserts columns relative to the selected cell", () => {
    const editor = createEditor();
    const positions = cellPositions(editor);
    editor.commands.setCellSelection({ anchorCell: positions[1], headCell: positions[1] });
    expect(editor.chain().focus().addColumnBefore().run()).toBe(true);
    let firstRowTexts: string[] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === "tableRow" && firstRowTexts.length === 0) {
        firstRowTexts = node.content.content.map((cellNode) => cellNode.textContent);
      }
    });
    expect(firstRowTexts).toEqual(["abcd", "", "efgh"]);

    editor.commands.setCellSelection({ anchorCell: positions[1], headCell: positions[1] });
    expect(editor.chain().focus().addColumnAfter().run()).toBe(true);
    firstRowTexts = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === "tableRow" && firstRowTexts.length === 0) {
        firstRowTexts = node.content.content.map((cellNode) => cellNode.textContent);
      }
    });
    expect(firstRowTexts).toEqual(["abcd", "", "", "efgh"]);
    editor.destroy();
  });

  it("persists and exports safe cell background colors", () => {
    const editor = createEditor();
    const positions = cellPositions(editor);
    editor.commands.setTextSelection(positions[1] + 2);
    editor.commands.setCellAttribute("backgroundColor", "#d0ebff");

    const secondHeader = editor.getJSON().content?.[1]?.content?.[0]?.content?.[1];
    expect(secondHeader?.attrs?.backgroundColor).toBe("#d0ebff");
    expect(editor.getHTML()).toContain('data-cell-background="#d0ebff"');
    expect(exportNote(editor.getJSON())).toContain("background-color: #d0ebff");

    editor.commands.setCellAttribute("backgroundColor", "javascript:alert(1)");
    expect(exportNote(editor.getJSON())).not.toContain("javascript:alert(1)");
    editor.destroy();
  });

  it("upgrades legacy inline-only cells then allows arbitrary deletion", () => {
    const invalid = {
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                { type: "tableCell", content: [{ type: "text", text: "abcdef" }] },
                { type: "tableCell", content: [{ type: "text", text: "ijkl" }] }
              ]
            }
          ]
        }
      ]
    };
    const editor = createEditor(upgradeCollapsibleContent(invalid));
    const target = textPositions(editor, "abcdef");
    editor.commands.setTextSelection({ from: target.from + 1, to: target.to - 1 });
    editor.commands.deleteSelection();

    expect(editor.state.doc.textContent).toContain("af");
    expect(cellPositions(editor)).toHaveLength(2);
    editor.destroy();
  });

  it("clears cell contents without destroying rows or columns", () => {
    const editor = createEditor();
    const positions = cellPositions(editor);
    editor.commands.setCellSelection({ anchorCell: positions[0], headCell: positions[1] });

    expect(press(editor, "Backspace")).toBe(true);
    expect(cellPositions(editor)).toHaveLength(4);
    expect(editor.state.doc.textContent).not.toContain("abcdefgh");
    editor.destroy();
  });

  it("deletes the whole table only when every cell is selected", () => {
    const editor = createEditor();
    const positions = cellPositions(editor);
    const tr = editor.state.tr.setSelection(
      CellSelection.create(editor.state.doc, positions[0], positions[positions.length - 1])
    );
    editor.view.dispatch(tr);

    expect(press(editor, "Delete")).toBe(true);
    expect(editor.getJSON().content?.map((node) => node.type)).toEqual(["paragraph", "paragraph"]);
    editor.destroy();
  });

  it("persists row height for editing and HTML export", () => {
    const editor = createEditor();
    let rowPos = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "tableRow" && rowPos < 0) rowPos = pos;
    });
    editor.view.dispatch(editor.state.tr.setNodeAttribute(rowPos, "rowHeight", 72));

    const row = editor.getJSON().content?.[1]?.content?.[0];
    expect(row?.attrs?.rowHeight).toBe(72);
    expect(editor.getHTML()).toContain("height: 72px");
    expect(
      buildHtmlExport({
        id: "00000000-0000-0000-0000-000000000001",
        title: "表格",
        excerpt: "",
        tags: [],
        folder: "",
        favoriteAt: null,
        archivedAt: null,
        trashedAt: null,
        pinnedAt: null,
        parentId: null,
        bodyFont: null,
        coverAsset: null,
        pageBg: null,
        content: editor.getJSON(),
        html: editor.getHTML(),
        plainText: editor.getText(),
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      })
    ).toContain("height: 72px");
    editor.destroy();
  });

  it("keeps table shape and text through markdown round-trip after deletion", () => {
    const editor = createEditor();
    const target = textPositions(editor, "abcd");
    editor.commands.setTextSelection({ from: target.from + 1, to: target.to - 1 });
    editor.commands.deleteSelection();
    const markdown = toMarkdown(editor.getJSON());
    const restored = markdownToDoc(markdown);

    expect(markdown).toContain("ad");
    expect(restored.content?.[1]?.type).toBe("table");
    expect(restored.content?.[1]?.content?.[0]?.content).toHaveLength(2);
    editor.destroy();
  });
});
