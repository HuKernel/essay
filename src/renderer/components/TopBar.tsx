import { useEffect, useRef, useState } from "react";
import { Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, PanelRight, PanelRightClose, Type } from "lucide-react";
import appIconUrl from "../assets/app-icon.png";
import type { ExportFormat } from "../constants";
import type { BatchExportFormat } from "../../shared/types";
import type { SaveState } from "../constants";

type TopBarProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onCreateNote: () => void;
  onSave: () => void;
  onOpenHistory: () => void;
  onExportNote: (format: ExportFormat) => void;
  onBatchExport: (format: BatchExportFormat) => void;
  onOpenSettings: () => void;
  onHideWindow: () => void;
  onAbout: () => void;
  onQuit: () => void;
  saveState: SaveState;
  formatOpen: boolean;
  onToggleFormat: () => void;
  infoOpen: boolean;
  onToggleInfo: () => void;
};

const STATUS_TEXT: Record<SaveState, string> = {
  idle: "已保存",
  dirty: "有修改",
  saving: "保存中",
  saved: "已保存",
  error: "保存失败"
};

const NOTE_EXPORTS: Array<{ format: ExportFormat; label: string }> = [
  { format: "pdf", label: "导出 PDF" },
  { format: "html", label: "导出 HTML" },
  { format: "md", label: "导出 Markdown" },
  { format: "txt", label: "导出 TXT" },
  { format: "json", label: "导出 JSON" }
];

const BATCH_EXPORTS: Array<{ format: BatchExportFormat; label: string }> = [
  { format: "md", label: "批量导出 Markdown" },
  { format: "html", label: "批量导出 HTML" },
  { format: "txt", label: "批量导出 TXT" },
  { format: "json", label: "批量导出 JSON" }
];

export function TopBar(props: TopBarProps) {
  const { sidebarCollapsed, onToggleSidebar, saveState, formatOpen, onToggleFormat, infoOpen, onToggleInfo } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<"note" | "batch" | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function act(fn: () => void) {
    return () => {
      setMenuOpen(false);
      setExpanded(null);
      fn();
    };
  }

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <img className="topbar-logo" src={appIconUrl} alt="" aria-hidden="true" />
        <div className="titlebar-leading" ref={menuRef}>
          <button
            className="icon-button titlebar-menu-trigger"
            title="菜单"
            aria-label="菜单"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            type="button"
          >
            <MenuIcon size={18} />
          </button>
          {menuOpen ? (
            <div className="titlebar-menu" role="menu" aria-label="应用菜单">
              <button type="button" role="menuitem" onClick={act(props.onCreateNote)}>
                新建记录
              </button>
              <button type="button" role="menuitem" onClick={act(props.onSave)}>
                保存
              </button>
              <button type="button" role="menuitem" onClick={act(props.onOpenHistory)}>
                版本历史
              </button>
              <button
                type="button"
                role="menuitem"
                aria-expanded={expanded === "note"}
                onClick={() => setExpanded((current) => (current === "note" ? null : "note"))}
              >
                导出当前记录
              </button>
              {expanded === "note" ? (
                <div className="titlebar-submenu">
                  {NOTE_EXPORTS.map((item) => (
                    <button
                      key={item.format}
                      type="button"
                      role="menuitem"
                      onClick={act(() => props.onExportNote(item.format))}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                role="menuitem"
                aria-expanded={expanded === "batch"}
                onClick={() => setExpanded((current) => (current === "batch" ? null : "batch"))}
              >
                批量导出记录
              </button>
              {expanded === "batch" ? (
                <div className="titlebar-submenu">
                  {BATCH_EXPORTS.map((item) => (
                    <button
                      key={item.format}
                      type="button"
                      role="menuitem"
                      onClick={act(() => props.onBatchExport(item.format))}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="titlebar-menu-divider" />
              <button type="button" role="menuitem" onClick={act(props.onOpenSettings)}>
                设置
              </button>
              <button type="button" role="menuitem" onClick={act(props.onHideWindow)}>
                隐藏窗口
              </button>
              <button type="button" role="menuitem" onClick={act(props.onAbout)}>
                关于随记
              </button>
              <div className="titlebar-menu-divider" />
              <button type="button" role="menuitem" onClick={act(props.onQuit)}>
                退出
              </button>
            </div>
          ) : null}
        </div>
        <button
          className="icon-button workspace-nav-toggle"
          title={sidebarCollapsed ? "展开左侧栏" : "收起左侧栏"}
          aria-label={sidebarCollapsed ? "展开左侧栏" : "收起左侧栏"}
          onClick={onToggleSidebar}
          type="button"
        >
          {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
      <div className="topbar-drag-spacer" aria-hidden="true" />
      <div className="topbar-statuses">
        <button
          type="button"
          className={formatOpen ? "icon-button topbar-tool-toggle is-active" : "icon-button topbar-tool-toggle"}
          title="格式面板（字体、颜色、对齐）"
          aria-label="格式面板"
          aria-pressed={formatOpen}
          onClick={onToggleFormat}
        >
          <Type size={16} />
        </button>
        <button
          type="button"
          className={infoOpen ? "icon-button topbar-tool-toggle is-active" : "icon-button topbar-tool-toggle"}
          title={infoOpen ? "折叠信息面板" : "展开信息面板"}
          aria-label="信息面板"
          aria-pressed={infoOpen}
          onClick={onToggleInfo}
        >
          {infoOpen ? <PanelRightClose size={16} /> : <PanelRight size={16} />}
        </button>
        <span className={`save-status ${saveState}`}>{STATUS_TEXT[saveState]}</span>
      </div>
    </header>
  );
}
