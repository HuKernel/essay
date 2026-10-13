import HorizontalRule from "@tiptap/extension-horizontal-rule";

export const HR_VARIANTS = ["solid", "dotted", "washi"] as const;
export type HRVariant = (typeof HR_VARIANTS)[number];

export const HR_VARIANT_LABELS: Record<HRVariant, string> = {
  solid: "实线",
  dotted: "点线",
  washi: "和纸胶带"
};

/** 分隔线样式变体：实线（默认）/ 点线 / 和纸胶带 */
export const HrVariantExtension = HorizontalRule.extend({
  addAttributes() {
    return {
      variant: {
        default: "solid",
        parseHTML: (element) => element.getAttribute("data-variant") || "solid",
        renderHTML: (attributes) => ({ "data-variant": attributes.variant || "solid" })
      }
    };
  }
});
