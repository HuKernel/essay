import {
  CalendarDays,
  FileDown,
  Link2,
  ListTree,
  Pencil,
  TextSearch
} from "lucide-react";
import type { ExportFormat, OutlineItem } from "../constants";

export type BacklinkItem = {
  id: string;
  title: string;
  kind: "linked" | "unlinked";
};

type InfoPanelProps = {
  open: boolean;
  /** 回收站笔记：标签等编辑入口只读 */
  readOnly: boolean;
  createdAt: string;
  updatedAt: string;
  chars: number;
  readingMinutes: number;
  folder: string;
  tags: string[];
  metaEditorOpen: boolean;
  onToggleMetaEditor: () => void;
  tagsDraft: string;
  onTagsChange: (value: string) => void;
  folderDraft: string;
  onFolderChange: (value: string) => void;
  onTagClick: (tag: string) => void;
  onFolderClick: (folder: string) => void;
  backlinks: BacklinkItem[];
  onJump: (id: string) => void;
  onExport: (format: ExportFormat) => void;
  outlineItems: OutlineItem[];
  onJumpToOutline: (item: OutlineItem) => void;
};

const EXPORTS: Array<{ format: ExportFormat; label: string }> = [
  { format: "md", label: "Markdown" },
  { format: "pdf", label: "PDF" },
  { format: "html", label: "HTML" },
  { format: "txt", label: "TXT" },
  { format: "json", label: "JSON" }
];

const fullDate = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export function InfoPanel(props: InfoPanelProps) {
  const { open, readOnly } = props;

  return (
    <aside className={open ? "info-panel is-open" : "info-panel"} aria-label="知识助手">
      <header className="info-panel-header">
        <strong>知识助手</strong>
      </header>

      <div className="info-panel-body">
        <section className="info-group">
          <span className="info-label">
            <CalendarDays size={12} aria-hidden="true" /> 概览
          </span>
          <dl className="info-rows">
            <div className="info-row">
              <dt>创建时间</dt>
              <dd>{fullDate.format(new Date(props.createdAt))}</dd>
            </div>
            <div className="info-row">
              <dt>更新时间</dt>
              <dd>{fullDate.format(new Date(props.updatedAt))}</dd>
            </div>
            <div className="info-row">
              <dt>字数</dt>
              <dd>{props.chars} 字</dd>
            </div>
            <div className="info-row">
              <dt>阅读时间</dt>
              <dd>约 {props.readingMinutes} 分钟</dd>
            </div>
          </dl>
        </section>

        <section className="info-group">
          <span className="info-label">
            <ListTree size={12} aria-hidden="true" /> 目录
          </span>
          {props.outlineItems.length > 0 ? (
            <nav className="info-outline-list" aria-label="当前文档目录">
              {props.outlineItems.map((item, index) => (
                <button
                  key={`${item.pos}-${index}`}
                  type="button"
                  className={`info-outline-link info-outline-level-${item.level}`}
                  onClick={() => props.onJumpToOutline(item)}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          ) : (
            <span className="info-empty">用标题组织内容后，这里会出现目录</span>
          )}
        </section>

        <section className="info-group">
          <span className="info-label">
            <Pencil size={12} aria-hidden="true" /> 属性
            {!readOnly ? (
              <button type="button" className="info-label-action" onClick={props.onToggleMetaEditor}>
                {props.metaEditorOpen ? "收起" : "编辑"}
              </button>
            ) : null}
          </span>
          <div className="info-chip-row">
            {props.folder ? (
              <button
                type="button"
                className="info-chip info-chip-folder"
                onClick={() => props.onFolderClick(props.folder)}
              >
                {props.folder}
              </button>
            ) : null}
            {props.tags.map((tag) => (
              <button key={tag} type="button" className="info-chip" onClick={() => props.onTagClick(tag)}>
                {tag}
              </button>
            ))}
            {!props.folder && props.tags.length === 0 ? <span className="info-empty">暂无文件夹与标签</span> : null}
          </div>
          {props.metaEditorOpen && !readOnly ? (
            <div className="info-edit-row">
              <input
                className="tags-input"
                value={props.tagsDraft}
                onChange={(event) => props.onTagsChange(event.target.value)}
                placeholder="标签，用逗号分隔"
              />
              <input
                className="folder-input"
                value={props.folderDraft}
                onChange={(event) => props.onFolderChange(event.target.value)}
                placeholder="文件夹"
              />
            </div>
          ) : null}
        </section>

        <section className="info-group">
          <span className="info-label">
            <Link2 size={12} aria-hidden="true" /> 关联文档
          </span>
          {props.backlinks.length > 0 ? (
            <div className="info-backlink-list">
              {props.backlinks.map((item) => (
                <button
                  key={`${item.kind}-${item.id}`}
                  type="button"
                  className="info-backlink-item"
                  onClick={() => props.onJump(item.id)}
                >
                  {item.kind === "linked" ? <Link2 size={13} /> : <TextSearch size={13} />}
                  <span>{item.title}</span>
                  <em>{item.kind === "linked" ? "链接" : "提及"}</em>
                </button>
              ))}
            </div>
          ) : (
            <span className="info-empty">没有其它文档提及这篇</span>
          )}
        </section>

        <section className="info-group">
          <span className="info-label">
            <FileDown size={12} aria-hidden="true" /> 导出
          </span>
          <div className="info-export-grid">
            {EXPORTS.map((item) => (
              <button
                key={item.format}
                type="button"
                className="info-export-button"
                onClick={() => props.onExport(item.format)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
