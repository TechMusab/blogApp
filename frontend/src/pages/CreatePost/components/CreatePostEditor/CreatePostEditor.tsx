import './CreatePostEditor.scss'

import { memo } from 'react'

type CreatePostEditorProps = {
  title: string
  excerpt: string
  content: string
  category: string
  categories: string[]
  wordCount: number
  onTitleChange: (value: string) => void
  onExcerptChange: (value: string) => void
  onContentChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSubmit: (event: React.FormEvent) => void
  onClose: () => void
}

export const CreatePostEditor = memo(function CreatePostEditor({
  title,
  excerpt,
  content,
  category,
  categories,
  wordCount,
  onTitleChange,
  onExcerptChange,
  onContentChange,
  onCategoryChange,
  onSubmit,
  onClose,
}: CreatePostEditorProps) {
  return (
    <main className="editor__main">
      <div className="editor__container">
        <div className="editor__header-row">
          <div className="editor__word-count">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>{wordCount} words</span>
          </div>

          <div className="editor__actions">
            <button
              type="button"
              className="editor__publish-btn"
              onClick={onSubmit}
              disabled={!title.trim() || !content.trim()}
            >
              Publish
            </button>
            <button type="button" className="editor__close-btn" onClick={onClose} aria-label="Close editor">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8C8C8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <form className="editor__form" onSubmit={onSubmit}>
          <input
            type="text"
            className="editor__title-input"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Your title"
            required
          />

          <input
            type="text"
            className="editor__excerpt-input"
            value={excerpt}
            onChange={(e) => onExcerptChange(e.target.value)}
            placeholder="A short description (optional)"
          />

          <hr className="editor__divider" />

          <div className="editor__tags-row">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`editor__tag-btn ${category === cat ? 'editor__tag-btn--active' : ''}`}
                onClick={() => onCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <textarea
            className="editor__content-textarea"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Write your post here. Use double line breaks for paragraphs."
            required
          />
        </form>
      </div>
    </main>
  )
})

