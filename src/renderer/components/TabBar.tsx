import { Plus, X } from "lucide-react";

export type TabItem = { noteId: string; title: string; dirty: boolean };

type TabBarProps = {
  tabs: TabItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onClose: (index: number) => void;
  onNew: () => void;
};

/** 多标签条：仅在多于一个标签时渲染 */
export function TabBar({ tabs, activeIndex, onSelect, onClose, onNew }: TabBarProps) {
  if (tabs.length <= 1) return null;
  return (
    <div className="tabbar" role="tablist" aria-label="笔记标签页">
      {tabs.map((tab, index) => (
        <div
          key={tab.noteId}
          role="tab"
          aria-selected={index === activeIndex}
          className={index === activeIndex ? "tabbar-tab is-active" : "tabbar-tab"}
        >
          <button type="button" className="tabbar-tab-label" onClick={() => onSelect(index)} title={tab.title}>
            <span className="tabbar-tab-title">{tab.title || "未命名记录"}</span>
            {tab.dirty ? <span className="tabbar-tab-dot" aria-label="有修改" /> : null}
          </button>
          <button type="button" className="tabbar-tab-close" aria-label="关闭标签页" onClick={() => onClose(index)}>
            <X size={11} />
          </button>
        </div>
      ))}
      <button type="button" className="tabbar-new" onClick={onNew} title="新建标签页（Ctrl+T）" aria-label="新建标签页">
        <Plus size={13} />
      </button>
    </div>
  );
}
