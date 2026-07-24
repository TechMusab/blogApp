import './CreatePostEditor.scss'

import { memo, useRef } from 'react'

type CreatePostEditorProps = {
  title: string
  excerpt: string
  content: string
  category: string
  categories: string[]
  wordCount: number
  coverImage: string
  isUploadingImage: boolean
  imageError: string
  onTitleChange: (value: string) => void
  onExcerptChange: (value: string) => void
  onContentChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onImageUpload: (file: File) => void
  onRemoveImage: () => void
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
  coverImage,
  isUploadingImage,
  imageError,
  onTitleChange,
  onExcerptChange,
  onContentChange,
  onCategoryChange,
  onImageUpload,
  onRemoveImage,
  onSubmit,
  onClose,
}: CreatePostEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageUpload(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
  return (
    <main className="editor__main">
      <div className="editor__container">
        <div className="editor__header-row">
          <button type="button" className="editor__back-btn" onClick={onClose}>
            ← Back to feed
          </button>
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

          <div className="editor__image-upload">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {coverImage ? (
              <div className="editor__image-preview">
                <img src={coverImage} alt="Cover preview" className="editor__preview-image" />
                <button
                  type="button"
                  className="editor__remove-image-btn"
                  onClick={onRemoveImage}
                  disabled={isUploadingImage}
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="editor__upload-btn"
                onClick={handleUploadClick}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? 'Uploading...' : 'Add Cover Image'}
              </button>
            )}
            
            {imageError && <div className="editor__image-error">{imageError}</div>}
          </div>

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

