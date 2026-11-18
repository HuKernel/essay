// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { CellSelection } from "@tiptap/pm/tables";
import { upgradeCollapsibleContent } from "../src/shared/content-upgrade";
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
    extensions: [StarterKit, Table.configure({ resizable: true }), TableRow, TableHeader, TableCell],
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

describe("table editing", () => {
  it("allows arbitrary text deletion inside one cell", () => {
    const editor = createEditor();
    const target = textPositions(editor, "abcd");
    editor.commands.setTextSelection({ from: target.from + 1, to: target.to - 1 });

    expect(editor.commands.deleteSelection()).toBe(true);
    expect(editor.state.doc.textContent).toContain("ad");
    expect(cellPositions(editor)).toHaveLength(4);
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
