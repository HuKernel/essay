import type { ReactNode } from "react";
import { PanelLeftOpen, PanelRight, PanelRightClose, Type } from "lucide-react";
import type { SaveState } from "../constants";
import appIconUrl from "../assets/app-icon.png";

type TopBarProps = {
  saveState: SaveState;
  lastEditedText: string;
  showSidebarToggle: boolean;
  onToggleSidebar: () => void;
  formatOpen: boolean;
  onToggleFormat: () => void;
  infoOpen: boolean;
  onToggleInfo: () => void;
  /** 面包屑（位置导航），占顶栏左侧原空白区 */
  children?: ReactNode;
};

const STATUS_TEXT: Record<SaveState, string> = {
  idle: "已保存",
  dirty: "有修改",
  saving: "保存中",
  saved: "已保存",
  error: "保存失败"
};

export function TopBar(props: TopBarProps) {
  const { saveState, lastEditedText, showSidebarToggle, onToggleSidebar, formatOpen, onToggleFormat, infoOpen, onToggleInfo, children } = props;

  return (
    <header className="topbar">
      {showSidebarToggle ? (
        <button
          type="button"
          className="icon-button topbar-nav-toggle sidebar-rail-logo"
          title="展开侧栏"
          aria-label="展开侧栏"
          onClick={onToggleSidebar}
        >
          <span className="toggle-state logo" aria-hidden="true">
            <img src={appIconUrl} alt="" />
          </span>
          <span className="toggle-state expand" aria-hidden="true">
            <PanelLeftOpen size={17} />
          </span>
        </button>
      ) : null}
      {children ? <div className="topbar-breadcrumb">{children}</div> : null}
      <div className="topbar-drag-spacer" aria-hidden="true" />
      <div className="topbar-statuses">
        {lastEditedText ? <span className="save-status last-edited">最后编辑 {lastEditedText}</span> : null}
        <span className={`save-status ${saveState}`}>{STATUS_TEXT[saveState]}</span>
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
      </div>
    </header>
  );
}
