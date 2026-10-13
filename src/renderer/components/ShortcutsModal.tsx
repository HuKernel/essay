import { X } from "lucide-react";

type ShortcutGroup = {
  label: string;
  items: Array<[string, string]>;
};

const GROUPS: ShortcutGroup[] = [
  {
    label: "通用",
    items: [
      ["Ctrl + Alt + J", "呼出 / 隐藏窗口（全局，可在设置改）"],
      ["Ctrl + K", "命令面板（命令 + 笔记）"],
      ["Ctrl + O", "快速跳转笔记"],
      ["Ctrl + P 同 Ctrl + K", "命令面板别名"],
      ["Ctrl + Shift + F", "专注模式开 / 关"],
      ["Ctrl + ,", "打开设置"],
      ["Esc", "按层级关闭弹窗 / 退出专注模式"]
    ]
  },
  {
    label: "编辑",
    items: [
      ["Ctrl + B / I / U", "加粗 / 斜体 / 下划线"],
      ["Ctrl + Shift + X", "删除线（Word 习惯）"],
      ["Ctrl + Shift + H", "高亮"],
      ["Ctrl + E", "行内代码（选中文本后）"],
      ["Ctrl + K（选中文字）", "插入链接"],
      ["Ctrl + Shift + E", "插入 TeX 公式块"],
      ["$公式$", "输入 $x^2$ 自动转行内公式"],
      ["[[", "笔记互链（输入时触发）"],
      ["/", "斜杠菜单插入块"],
      ["Tab / Shift + Tab", "折叠块缩进 / 反缩进"],
      ["右键块", "类型互转 / 移动 / 复制 / 删除"]
    ]
  },
  {
    label: "查找",
    items: [
      ["Ctrl + F", "文档内查找"],
      ["Ctrl + H", "查找并替换"],
      ["Enter / Shift + Enter", "下一个 / 上一个匹配"],
      ["正则按钮", "切换正则模式（替换支持 $1..$9）"]
    ]
  },
  {
    label: "标签页",
    items: [
      ["Ctrl + T", "新建标签页"],
      ["Ctrl + W", "关闭当前标签页"],
      ["Ctrl + Tab", "切换到下一个标签页"],
      ["Ctrl + 点击（列表）", "在新标签页打开"]
    ]
  }
];

type ShortcutsModalProps = {
  onClose: () => void;
};

export function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal shortcuts-modal"
        role="dialog"
        aria-modal="true"
        aria-label="快捷键总览"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-kicker">效率</span>
          <h2>快捷键</h2>
          <p className="modal-description">按通用 / 编辑 / 查找 / 标签页分组。</p>
        </div>
        <div className="shortcuts-body">
          {GROUPS.map((group) => (
            <section key={group.label} className="shortcuts-group" aria-label={group.label}>
              <h3>{group.label}</h3>
              <dl>
                {group.items.map(([keys, desc]) => (
                  <div key={keys + desc} className="shortcuts-row">
                    <dt>
                      {keys.split(" + ").map((part, index) => (
                        <span key={`${part}-${index}`}>
                          {index > 0 ? <em aria-hidden="true">+</em> : null}
                          <kbd>{part}</kbd>
                        </span>
                      ))}
                    </dt>
                    <dd>{desc}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" className="primary" onClick={onClose}>
            <X size={14} /> 关闭
          </button>
        </div>
      </div>
    </div>
  );
}
