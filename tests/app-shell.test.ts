import { describe, expect, it, vi } from "vitest";
import { buildApplicationMenuTemplate, buildTrayMenuTemplate } from "../src/main/app-shell";
import { DEFAULT_SETTINGS } from "../src/main/security";

function callbacks() {
  return {
    appQuit: vi.fn(),
    hideWindow: vi.fn(),
    onAbout: vi.fn(),
    onClipboardNote: vi.fn(async () => ({ id: "note-1" })),
    sendMenu: vi.fn(),
    showWindow: vi.fn()
  };
}

describe("app shell templates", () => {
  it("应用菜单包含导出和设置入口", () => {
    const template = buildApplicationMenuTemplate(callbacks());
    const fileMenu = template[0];
    expect(fileMenu.label).toBe("文件");
    expect(fileMenu.submenu).toBeTruthy();
    const labels = (fileMenu.submenu as Array<{ label?: string }>).map((item) => item.label).filter(Boolean);
    expect(labels).toContain("导出当前记录");
    expect(labels).toContain("批量导出记录");
    expect(labels).toContain("设置");
  });

  it("隐藏窗口不占用 Escape（Esc 保留给弹窗/查找的取消）", () => {
    const template = buildApplicationMenuTemplate(callbacks());
    const fileMenu = template[0];
    const hideItem = (fileMenu.submenu as Array<{ label?: string; accelerator?: string }>).find(
      (item) => item.label === "隐藏窗口"
    );
    expect(hideItem).toBeTruthy();
    expect(hideItem?.accelerator).toBeUndefined();
  });

  it("快捷键总览经帮助菜单 accelerator 激活，设置不绑定菜单快捷键", () => {
    const template = buildApplicationMenuTemplate(callbacks());
    const helpMenu = template.find((menu) => menu.label === "帮助");
    expect(helpMenu).toBeTruthy();
    const shortcutsItem = (helpMenu?.submenu as Array<{ label?: string; accelerator?: string }>).find(
      (item) => item.label === "快捷键总览"
    );
    expect(shortcutsItem).toBeTruthy();
    expect(shortcutsItem?.accelerator).toBe("CommandOrControl+/");

    const fileMenu = template[0];
    const settingsItem = (fileMenu.submenu as Array<{ label?: string; accelerator?: string }>).find(
      (item) => item.label === "设置"
    );
    expect(settingsItem).toBeTruthy();
    // Ctrl+, 由渲染层 keydown 处理（openSettings 幂等早退），菜单不重复登记 accelerator
    expect(settingsItem?.accelerator).toBeUndefined();
  });

  it("托盘菜单包含快捷键展示和剪贴板入口", () => {
    const template = buildTrayMenuTemplate(
      {
        ...DEFAULT_SETTINGS,
        hasPrivacyPin: false,
        storageUnlocked: true
      },
      callbacks()
    );
    const labels = template.map((item) => item.label).filter(Boolean);
    expect(labels).toContain("保存剪贴板为记录");
    expect(labels).toContain("快捷键：Ctrl + Alt + J");
  });
});
