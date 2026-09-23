import { Clock, FolderOpen, Hash, Star } from "lucide-react";
import type { NoteRecord } from "../../shared/types";
import { formatTime } from "../utils/text";

type WorkspaceHomeProps = {
  notes: NoteRecord[];
  activeId: string;
  allTags: string[];
  onOpenNote: (id: string) => void;
  onOpenAll: () => void;
  onOpenTag: (tag: string) => void;
};

const RECENT_LIMIT = 8;
const TAG_PREVIEW_LIMIT = 3;

function DocRow({ note, active, onOpen }: { note: NoteRecord; active: boolean; onOpen: () => void }) {
  return (
    <button type="button" className={active ? "home-doc-row is-active" : "home-doc-row"} onClick={onOpen}>
      <strong>{note.title || "未命名记录"}</strong>
      <span>{note.excerpt || "空记录"}</span>
      <em>{formatTime(note.updatedAt)}</em>
    </button>
  );
}

export function WorkspaceHome(props: WorkspaceHomeProps) {
  const { notes, activeId, allTags, onOpenNote, onOpenAll, onOpenTag } = props;

  const live = notes.filter((note) => !note.trashedAt);
  const recent = [...live].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, RECENT_LIMIT);
  const favorites = live.filter((note) => note.favoriteAt);
  const tagGroups = allTags
    .map((tag) => ({ tag, notes: live.filter((note) => note.tags.includes(tag)) }))
    .filter((group) => group.notes.length > 0);

  return (
    <div className="workspace-home" aria-label="工作空间主页">
      <div className="home-head">
        <h1>我的空间</h1>
        <p>
          {live.length} 篇文档
          {favorites.length > 0 ? ` · ${favorites.length} 篇收藏` : ""}
          {allTags.length > 0 ? ` · ${allTags.length} 个标签` : ""}
        </p>
      </div>

      <section className="home-section">
        <div className="home-section-head">
          <h2>
            <Clock size={15} aria-hidden="true" /> 最近编辑
          </h2>
          <button type="button" onClick={onOpenAll}>
            查看全部
          </button>
        </div>
        {recent.length > 0 ? (
          <div className="doc-list-grid">
            {recent.map((note) => (
              <DocRow key={note.id} note={note} active={note.id === activeId} onOpen={() => onOpenNote(note.id)} />
            ))}
          </div>
        ) : (
          <p className="doc-list-empty">还没有记录，点左侧「新记录」开始</p>
        )}
      </section>

      {favorites.length > 0 ? (
        <section className="home-section">
          <div className="home-section-head">
            <h2>
              <Star size={15} aria-hidden="true" /> 收藏
            </h2>
          </div>
          <div className="doc-list-grid">
            {favorites.slice(0, RECENT_LIMIT).map((note) => (
              <DocRow key={note.id} note={note} active={note.id === activeId} onOpen={() => onOpenNote(note.id)} />
            ))}
          </div>
        </section>
      ) : null}

      {tagGroups.length > 0 ? (
        <section className="home-section">
          <div className="home-section-head">
            <h2>
              <Hash size={15} aria-hidden="true" /> 标签分类
            </h2>
          </div>
          <div className="home-tag-groups">
            {tagGroups.map((group) => (
              <div key={group.tag} className="home-tag-group">
                <button type="button" className="home-tag-title" onClick={() => onOpenTag(group.tag)}>
                  <Hash size={13} aria-hidden="true" />
                  {group.tag}
                  <em>{group.notes.length}</em>
                </button>
                {group.notes.slice(0, TAG_PREVIEW_LIMIT).map((note) => (
                  <DocRow
                    key={note.id}
                    note={note}
                    active={note.id === activeId}
                    onOpen={() => onOpenNote(note.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {live.length === 0 ? (
        <section className="home-section">
          <div className="home-empty-hero">
            <FolderOpen size={28} aria-hidden="true" />
            <strong>欢迎来到我的空间</strong>
            <p>左侧「新记录」创建第一篇文档，或直接粘贴 Markdown 开始积累</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
