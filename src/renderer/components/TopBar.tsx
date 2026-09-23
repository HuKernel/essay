import { PanelRight, PanelRightClose, Type } from "lucide-react";
import type { SaveState } from "../constants";

type TopBarProps = {
  saveState: SaveState;
  lastEditedText: string;
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

export function TopBar(props: TopBarProps) {
  const { saveState, lastEditedText, formatOpen, onToggleFormat, infoOpen, onToggleInfo } = props;

  return (
    <header className="topbar">
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
