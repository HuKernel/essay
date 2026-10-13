import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  CheckSquare,
  ChevronDown,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Sigma,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { BlockFormat } from "../editor/block-format";
import { FORMAT_COLORS, FONT_PRESETS, type FontPresetId } from "../constants";
import { keepEditorFocus } from "./common";

type FormatPanelProps = {
  editor: Editor | null;
  editorDisabled: boolean;
  currentBlockFormat: BlockFormat;
  currentColorValue: string;
  currentFontPresetId: FontPresetId;
  settingsReady: boolean;
  open: boolean;
  onClose: () => void;
  onSetTextPreset: (preset: "heading-1" | "heading-2" | "heading-3" | "body" | "caption") => void;
  onApplyBlockFormat: (attributes: Partial<BlockFormat>) => void;
  onCustomColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  customColorInputRef: { current: HTMLInputElement | null };
  onFontPreset: (presetId: FontPresetId) => void;
  onInsertCollapsibleBlock: () => void;
  onInsertImageUrl: () => void;
  onInsertMathBlock: () => void;
  onEditLink: () => void;
  tableToolbarVisible: boolean;
  onRunTableCommand: (command: () => boolean) => void;
};

type CustomBlockStyle = {
  id: string;
  name: string;
  attrs: Partial<BlockFormat>;
};

const CUSTOM_STYLES_KEY = "suiji.custom-block-styles";

function loadCustomStyles(): CustomBlockStyle[] {
  try {
    const raw = window.localStorage.getItem(CUSTOM_STYLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.name === "string" && item.attrs && typeof item.attrs === "object").slice(0, 24)
      : [];
  } catch {
    return [];
  }
}

export function FormatPanel(props: FormatPanelProps) {
  const {
    editor,
    editorDisabled,
    currentBlockFormat,
    currentColorValue,
    currentFontPresetId,
    settingsReady,
    open,
    onClose,
    onSetTextPreset,
    onApplyBlockFormat,
    onCustomColorChange,
    customColorInputRef,
    onFontPreset,
    onInsertCollapsibleBlock,
    onInsertImageUrl,
    onInsertMathBlock,
    onEditLink,
    tableToolbarVisible,
    onRunTableCommand
  } = props;

  const disabled = !editor || editorDisabled;
  const [customStyles, setCustomStyles] = useState<CustomBlockStyle[]>(loadCustomStyles);
  const [styleNaming, setStyleNaming] = useState(false);
  const [styleNameDraft, setStyleNameDraft] = useState("");

  useEffect(() => {
    window.localStorage.setItem(CUSTOM_STYLES_KEY, JSON.stringify(customStyles));
  }, [customStyles]);

  function saveStyleWithName() {
    const name = styleNameDraft.trim();
    setStyleNaming(false);
    if (!name) return;
    const attrs: Partial<BlockFormat> = {
      textRole: currentBlockFormat.textRole,
      colorToken: currentBlockFormat.colorToken,
      customColor: currentBlockFormat.customColor,
      focusMode: currentBlockFormat.focusMode,
      cardMode: currentBlockFormat.cardMode
    };
    setCustomStyles((current) => [...current, { id: `${Date.now()}-${name}`, name, attrs }].slice(-24));
  }

  return (
    <aside
      className={open ? "format-panel is-floating is-open" : "format-panel is-floating"}
      aria-label="格式工具"
      aria-hidden={!open}
    >
      <div className="format-panel-header">
        <strong>格式</strong>
        <span className="format-panel-chip">Aa</span>
        <button type="button" className="icon-button format-panel-close" title="收起" aria-label="收起格式面板" onClick={onClose}>
          <X size={15} />
        </button>
      </div>

      <div className="format-panel-group">
        <span className="format-panel-label">文本</span>
        <div className="format-grid format-grid-text">
          <button
            type="button"
            className={editor?.isActive("heading", { level: 1 }) ? "format-button is-active" : "format-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => onSetTextPreset("heading-1")}
            disabled={disabled}
          >
            <Heading1 size={16} />
            标题
          </button>
          <button
            type="button"
            className={editor?.isActive("heading", { level: 2 }) ? "format-button is-active" : "format-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => onSetTextPreset("heading-2")}
            disabled={disabled}
          >
            <Heading2 size={16} />
            副标题
          </button>
          <button
            type="button"
            className={editor?.isActive("heading", { level: 3 }) ? "format-button is-active" : "format-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => onSetTextPreset("heading-3")}
            disabled={disabled}
          >
            <Heading3 size={16} />
            小标题
          </button>
          <button
            type="button"
            className={
              editor?.isActive("paragraph") && currentBlockFormat.textRole !== "caption"
                ? "format-button is-active"
                : "format-button"
            }
            onMouseDown={keepEditorFocus}
            onClick={() => onSetTextPreset("body")}
            disabled={disabled}
          >
            <AlignLeft size={16} />
            正文
          </button>
          <button
            type="button"
            className={
              editor?.isActive("paragraph") && currentBlockFormat.textRole === "caption"
                ? "format-button is-active"
                : "format-button"
            }
            onMouseDown={keepEditorFocus}
            onClick={() => onSetTextPreset("caption")}
            disabled={disabled}
          >
            <Info size={16} />
            说明
          </button>
        </div>
      </div>

      <div className="format-panel-group">
        <span className="format-panel-label">样式</span>
        <div className="format-grid compact">
          <button
            type="button"
            className={editor?.isActive("bold") ? "format-icon-button is-active" : "format-icon-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={disabled}
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className={editor?.isActive("italic") ? "format-icon-button is-active" : "format-icon-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={disabled}
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className={editor?.isActive("underline") ? "format-icon-button is-active" : "format-icon-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            disabled={disabled}
          >
            <UnderlineIcon size={16} />
          </button>
          <button
            type="button"
            className={editor?.isActive("strike") ? "format-icon-button is-active" : "format-icon-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            disabled={disabled}
          >
            <Strikethrough size={16} />
          </button>
          <button
            type="button"
            className={editor?.isActive("highlight") ? "format-icon-button is-active" : "format-icon-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            disabled={disabled}
          >
            <Highlighter size={16} />
          </button>
          <button
            type="button"
            className={editor?.isActive("link") ? "format-icon-button is-active" : "format-icon-button"}
            onMouseDown={keepEditorFocus}
            onClick={onEditLink}
            disabled={disabled}
          >
            <Link2 size={16} />
          </button>
        </div>
      </div>

      <div className="format-panel-group">
        <span className="format-panel-label">对齐</span>
        <div className="format-grid compact">
          <button
            type="button"
            className={editor?.isActive({ textAlign: "left" }) ? "format-icon-button is-active" : "format-icon-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            disabled={disabled}
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            className={
              editor?.isActive({ textAlign: "center" }) ? "format-icon-button is-active" : "format-icon-button"
            }
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
            disabled={disabled}
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            className={editor?.isActive({ textAlign: "right" }) ? "format-icon-button is-active" : "format-icon-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            disabled={disabled}
          >
            <AlignRight size={16} />
          </button>
        </div>
      </div>

      <div className="format-panel-group">
        <span className="format-panel-label">块</span>
        <div className="format-grid">
          <button
            type="button"
            className={editor?.isActive("bulletList") ? "format-button is-active" : "format-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={disabled}
          >
            <List size={16} />
            列表
          </button>
          <button
            type="button"
            className={editor?.isActive("orderedList") ? "format-button is-active" : "format-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
          >
            <ListOrdered size={16} />
            编号
          </button>
          <button
            type="button"
            className={editor?.isActive("taskList") ? "format-button is-active" : "format-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
            disabled={disabled}
          >
            <CheckSquare size={16} />
            任务
          </button>
          <button
            type="button"
            className={editor?.isActive("collapsibleBlock") ? "format-button is-active" : "format-button"}
            onMouseDown={keepEditorFocus}
            onClick={onInsertCollapsibleBlock}
            disabled={disabled}
          >
            <ChevronDown size={16} />
            折叠块
          </button>
          <button
            type="button"
            className="format-button"
            onMouseDown={keepEditorFocus}
            onClick={onInsertMathBlock}
            disabled={disabled}
            title="插入公式（Ctrl/Cmd + Shift + E）"
          >
            <Sigma size={16} />
            公式
          </button>
          <button
            type="button"
            className={editor?.isActive("codeBlock") ? "format-button is-active" : "format-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            disabled={disabled}
          >
            <Code2 size={16} />
            代码
          </button>
          <button
            type="button"
            className="format-button"
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            disabled={disabled}
            title="插入分割线（右键可切换样式）"
          >
            <Minus size={16} />
            分割线
          </button>
          <button
            type="button"
            className="format-button"
            onMouseDown={keepEditorFocus}
            onClick={onInsertImageUrl}
            disabled={disabled}
            title="插入网络图片链接"
          >
            <Link2 size={16} />
            图链
          </button>
          <button
            type="button"
            className={tableToolbarVisible ? "format-button is-active" : "format-button"}
            onMouseDown={keepEditorFocus}
            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            disabled={disabled}
          >
            <Table2 size={16} />
            表格
          </button>
        </div>
      </div>

      <div className="format-panel-group">
        <span className="format-panel-label">装饰</span>
        <div className="format-grid">
          <button
            type="button"
            className={
              currentBlockFormat.focusMode
                ? "format-button format-decor-button is-active"
                : "format-button format-decor-button"
            }
            onMouseDown={keepEditorFocus}
            onClick={() => onApplyBlockFormat({ focusMode: !currentBlockFormat.focusMode })}
            disabled={disabled}
          >
            <span className="format-decor-chip format-decor-chip-focus" aria-hidden="true">
              <span className="format-decor-focus-bar" />
              <span>焦点</span>
            </span>
          </button>
          <button
            type="button"
            className={
              currentBlockFormat.cardMode
                ? "format-button format-decor-button is-active"
                : "format-button format-decor-button"
            }
            onMouseDown={keepEditorFocus}
            onClick={() => onApplyBlockFormat({ cardMode: !currentBlockFormat.cardMode })}
            disabled={disabled}
          >
            <span className="format-decor-chip format-decor-chip-card" aria-hidden="true">
              <span>块</span>
            </span>
          </button>
        </div>
      </div>

      <div className="format-panel-group">
        <span className="format-panel-label">我的样式</span>
        <div className="format-style-list">
          {customStyles.length === 0 && !styleNaming ? (
            <span className="format-style-empty">把当前块格式保存成可复用样式</span>
          ) : null}
          {customStyles.map((style) => (
            <span key={style.id} className="format-style-row">
              <button
                type="button"
                className="format-style-apply"
                onMouseDown={keepEditorFocus}
                onClick={() => onApplyBlockFormat(style.attrs)}
                disabled={disabled}
                title={`套用「${style.name}」`}
              >
                {style.name}
              </button>
              <button
                type="button"
                className="format-style-delete"
                aria-label={`删除样式「${style.name}」`}
                onClick={() => setCustomStyles((current) => current.filter((item) => item.id !== style.id))}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {styleNaming ? (
            <span className="format-style-row format-style-naming">
              <input
                autoFocus
                value={styleNameDraft}
                placeholder="样式名"
                aria-label="样式名"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveStyleWithName();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setStyleNaming(false);
                  }
                }}
                onChange={(event) => setStyleNameDraft(event.target.value)}
              />
              <button type="button" className="format-style-delete" title="保存" aria-label="保存样式" onClick={saveStyleWithName}>
                <Check size={12} />
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="format-style-save"
              onMouseDown={keepEditorFocus}
              onClick={() => {
                setStyleNameDraft("");
                setStyleNaming(true);
              }}
              disabled={disabled}
            >
              存为样式
            </button>
          )}
        </div>
      </div>

      <div className="format-panel-group">
        <span className="format-panel-label">颜色</span>
        <div className="format-color-grid">
          {FORMAT_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              className={
                currentBlockFormat.colorToken === color.id ? "format-color-button is-active" : "format-color-button"
              }
              style={{ "--format-swatch": color.swatch } as React.CSSProperties}
              title={color.label}
              aria-label={color.label}
              onMouseDown={keepEditorFocus}
              onClick={() => onApplyBlockFormat({ colorToken: color.id, customColor: "" })}
              disabled={disabled}
            >
              {currentBlockFormat.colorToken === color.id ? <Check size={14} /> : null}
            </button>
          ))}
          <button
            type="button"
            className={
              currentBlockFormat.customColor
                ? "format-color-button format-color-button-rainbow is-active"
                : "format-color-button format-color-button-rainbow"
            }
            title="自定义颜色"
            aria-label="自定义颜色"
            onMouseDown={keepEditorFocus}
            onClick={() => customColorInputRef.current?.click()}
            disabled={disabled}
          >
            {currentBlockFormat.customColor ? <Check size={14} /> : null}
          </button>
        </div>
        <input
          ref={customColorInputRef}
          className="format-color-input"
          type="color"
          value={currentColorValue}
          onChange={onCustomColorChange}
        />
      </div>

      <div className="format-panel-group">
        <span className="format-panel-label">字体</span>
        <div className="format-font-grid">
          {FONT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={currentFontPresetId === preset.id ? "format-font-button is-active" : "format-font-button"}
              title={preset.label}
              aria-label={preset.label}
              style={
                {
                  "--format-font-family":
                    preset.family ||
                    'var(--editor-font-family, "SF Pro Text", "PingFang SC", "Helvetica Neue", sans-serif)'
                } as React.CSSProperties
              }
              onMouseDown={keepEditorFocus}
              onClick={() => onFontPreset(preset.id)}
              disabled={!settingsReady}
            >
              <span className="format-font-preview">{preset.preview}</span>
              <span className="format-font-label">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {tableToolbarVisible && editor ? (
        <div className="format-panel-group">
          <span className="format-panel-label">表格</span>
          <div className="format-grid">
            <button
              type="button"
              className="format-button"
              onMouseDown={keepEditorFocus}
              onClick={() => onRunTableCommand(() => editor.chain().focus().addRowBefore().run())}
            >
              上插行
            </button>
            <button
              type="button"
              className="format-button"
              onMouseDown={keepEditorFocus}
              onClick={() => onRunTableCommand(() => editor.chain().focus().addRowAfter().run())}
            >
              下插行
            </button>
            <button
              type="button"
              className="format-button"
              onMouseDown={keepEditorFocus}
              onClick={() => onRunTableCommand(() => editor.chain().focus().addColumnBefore().run())}
            >
              左插列
            </button>
            <button
              type="button"
              className="format-button"
              onMouseDown={keepEditorFocus}
              onClick={() => onRunTableCommand(() => editor.chain().focus().addColumnAfter().run())}
            >
              右插列
            </button>
            <button
              type="button"
              className="format-button"
              onMouseDown={keepEditorFocus}
              onClick={() => onRunTableCommand(() => editor.chain().focus().deleteRow().run())}
            >
              删行
            </button>
            <button
              type="button"
              className="format-button"
              onMouseDown={keepEditorFocus}
              onClick={() => onRunTableCommand(() => editor.chain().focus().deleteColumn().run())}
            >
              删列
            </button>
            <button
              type="button"
              className="format-button"
              onMouseDown={keepEditorFocus}
              onClick={() => onRunTableCommand(() => editor.chain().focus().mergeCells().run())}
            >
              合并所选
            </button>
            <button
              type="button"
              className="format-button"
              onMouseDown={keepEditorFocus}
              onClick={() => onRunTableCommand(() => editor.chain().focus().splitCell().run())}
            >
              拆分单元格
            </button>
            <button
              type="button"
              className="format-button"
              onMouseDown={keepEditorFocus}
              onClick={() => onRunTableCommand(() => editor.chain().focus().toggleHeaderRow().run())}
            >
              表头行
            </button>
            <button
              type="button"
              className="format-button danger"
              onMouseDown={keepEditorFocus}
              onClick={() => onRunTableCommand(() => editor.chain().focus().deleteTable().run())}
            >
              删表
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
