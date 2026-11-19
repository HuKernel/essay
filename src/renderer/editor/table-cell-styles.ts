import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { isTableCellBackgroundColor } from "../../shared/table-cells";

function cellBackgroundColorAttributes() {
  return {
    backgroundColor: {
      default: null,
      parseHTML: (element: HTMLElement) => {
        const color = element.getAttribute("data-cell-background") || element.style.backgroundColor;
        return isTableCellBackgroundColor(color) ? color : null;
      },
      renderHTML: (attributes: Record<string, unknown>) => {
        const color = attributes.backgroundColor;
        return isTableCellBackgroundColor(color)
          ? { "data-cell-background": color, style: `background-color: ${color}` }
          : {};
      }
    }
  };
}

export const StyledTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...cellBackgroundColorAttributes()
    };
  }
});

export const StyledTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...cellBackgroundColorAttributes()
    };
  }
});
