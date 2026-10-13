import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import type { ColorToken, TextRole } from "../constants";

export type DoodleStyle = "none" | "sketch" | "marker" | "wavy" | "circle" | "double";

export const DOODLE_STYLES: Array<{ id: DoodleStyle; label: string }> = [
  { id: "none", label: "无" },
  { id: "sketch", label: "手绘框" },
  { id: "marker", label: "荧光笔" },
  { id: "wavy", label: "波浪线" },
  { id: "circle", label: "圈选" },
  { id: "double", label: "双线框" }
];

const DOODLE_IDS = new Set(DOODLE_STYLES.map((style) => style.id));

function normalizeDoodle(value: string | null): DoodleStyle {
  if (value === "true") return "sketch"; // 旧数据布尔编码
  if (value && DOODLE_IDS.has(value as DoodleStyle)) return value as DoodleStyle;
  return "none";
}

export type BlockFormat = {
  textRole: TextRole;
  focusMode: boolean;
  cardMode: boolean;
  doodleMode: DoodleStyle;
  colorToken: ColorToken;
  customColor: string;
};

export const BlockFormatExtension = Extension.create({
  name: "blockFormat",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          textRole: {
            default: "body",
            parseHTML: (element) => element.getAttribute("data-text-role") || "body",
            renderHTML: (attributes) =>
              attributes.textRole && attributes.textRole !== "body" ? { "data-text-role": attributes.textRole } : {}
          },
          focusMode: {
            default: false,
            parseHTML: (element) => element.getAttribute("data-focus-mode") === "true",
            renderHTML: (attributes) => (attributes.focusMode ? { "data-focus-mode": "true" } : {})
          },
          cardMode: {
            default: false,
            parseHTML: (element) => element.getAttribute("data-card-mode") === "true",
            renderHTML: (attributes) => (attributes.cardMode ? { "data-card-mode": "true" } : {})
          },
          doodleMode: {
            default: "none",
            parseHTML: (element) => normalizeDoodle(element.getAttribute("data-doodle-mode")),
            renderHTML: (attributes) => {
              const value = normalizeDoodle(typeof attributes.doodleMode === "string" ? attributes.doodleMode : null);
              return value !== "none" ? { "data-doodle-mode": value } : {};
            }
          },
          colorToken: {
            default: "default",
            parseHTML: (element) => (element.getAttribute("data-color-token") as ColorToken | null) || "default",
            renderHTML: (attributes) =>
              attributes.colorToken && attributes.colorToken !== "default"
                ? { "data-color-token": attributes.colorToken }
                : {}
          },
          customColor: {
            default: "",
            parseHTML: (element) => element.getAttribute("data-custom-color") || "",
            renderHTML: (attributes) =>
              attributes.customColor
                ? {
                    "data-custom-color": attributes.customColor,
                    style: `--node-accent: ${attributes.customColor}; color: ${attributes.customColor};`
                  }
                : {}
          }
        }
      }
    ];
  }
});

export function getCurrentBlockFormat(editor: Editor | null): BlockFormat {
  if (!editor) {
    return {
      textRole: "body",
      focusMode: false,
      cardMode: false,
      doodleMode: "none",
      colorToken: "default",
      customColor: ""
    };
  }
  const attrs = editor.isActive("heading") ? editor.getAttributes("heading") : editor.getAttributes("paragraph");
  return {
    textRole: (attrs.textRole as TextRole | undefined) ?? "body",
    focusMode: Boolean(attrs.focusMode),
    cardMode: Boolean(attrs.cardMode),
    doodleMode: normalizeDoodle(typeof attrs.doodleMode === "string" ? attrs.doodleMode : null),
    colorToken: (attrs.colorToken as ColorToken | undefined) ?? "default",
    customColor: typeof attrs.customColor === "string" ? attrs.customColor : ""
  };
}
