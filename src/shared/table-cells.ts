export const TABLE_CELL_COLORS = [
  { value: "#fff3bf", label: "浅黄" },
  { value: "#d3f9d8", label: "浅绿" },
  { value: "#d0ebff", label: "浅蓝" },
  { value: "#ffe3e3", label: "浅红" },
  { value: "#e5dbff", label: "浅紫" },
  { value: "#f1f3f5", label: "浅灰" }
] as const;

const TABLE_CELL_BACKGROUND_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function isTableCellBackgroundColor(value: unknown): value is string {
  return typeof value === "string" && TABLE_CELL_BACKGROUND_COLOR_PATTERN.test(value);
}
