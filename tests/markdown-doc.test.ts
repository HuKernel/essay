import { describe, expect, it } from "vitest";
import { looksLikeMarkdown, markdownToDoc } from "../src/shared/markdown-doc";
import { toMarkdown } from "../src/shared/markdown";

describe("looksLikeMarkdown", () => {
  it("含围栏判定为 markdown", () => {
    expect(looksLikeMarkdown("```bash\ndir\n```")).toBe(true);
    expect(looksLikeMarkdown("  ```Plain Text\ndism.exe")).toBe(true);
    expect(looksLikeMarkdown("说明\n~~~\ncode\n~~~")).toBe(true);
  });

  it("普通文本、无围栏 markdown、脚本注释不误判", () => {
    expect(looksLikeMarkdown("# 标题\n\n- 列表项")).toBe(false);
    expect(looksLikeMarkdown("# 注释\nprint(1)")).toBe(false);
    expect(looksLikeMarkdown("普通段落文本")).toBe(false);
  });
});

describe("markdown 粘贴解析（FlowUs 错乱回归）", () => {
  it("说明文字在代码块外，代码换行保留，语言来自 info", () => {
    const md = [
      "注意:如果有提示不是内部命令安装如下",
      "",
      "查看版本和安装ubuntu",
      "```Plain Text",
      "dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart",
      "wsl --set-default-version 2",
      "```"
    ].join("\n");

    const doc = markdownToDoc(md);
    const blocks = doc.content ?? [];
    expect(blocks[0]).toMatchObject({ type: "paragraph" });
    expect(blocks[1]).toMatchObject({ type: "paragraph" });
    expect(blocks[1]?.content?.[0]?.text).toBe("查看版本和安装ubuntu");
    expect(blocks[2]).toMatchObject({
      type: "codeBlock",
      attrs: { language: "Plain" }
    });
    const codeText = blocks[2]?.content?.[0]?.text ?? "";
    expect(codeText).toContain("dism.exe");
    expect(codeText).toContain("\n");
    expect(codeText).not.toContain("```");
    expect(codeText).not.toContain("查看版本");
  });
});

describe("toMarkdown 新块导出", () => {
  it("pageLink/blockRef 导出为可跳转的 markdown 链接", () => {
    const md = toMarkdown({
      type: "doc",
      content: [
        { type: "pageLink", attrs: { noteId: "abc", title: "子页面" } },
        { type: "blockRef", attrs: { refNoteId: "def", refTitle: "来源", text: "引用内容" } }
      ]
    });
    expect(md).toContain("[子页面](suiji-note://abc)");
    expect(md).toContain("引用内容");
    expect(md).toContain("[来源](suiji-note://def)");
  });
});

describe("文件写回 round-trip（saveNote 同步写回原文件）", () => {
  it("导入→序列化→写回内容不丢首个 heading、不重复标题、幂等", () => {
    const md = "# 项目方案\n\n第一段正文\n\n- 要点一\n- 要点二\n";
    const written = toMarkdown(markdownToDoc(md));
    expect(written.startsWith("# 项目方案")).toBe(true);
    expect(written.match(/^# 项目方案/gm)).toHaveLength(1);
    expect(written).toContain("第一段正文");
    expect(written).toContain("要点一");
    // 换一种方式再打开（重新导入）得到同样内容
    expect(toMarkdown(markdownToDoc(written))).toBe(written);
  });
});
