import './EditPostModal.scss';

import { memo, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CreatePostEditor } from '../../../pages/CreatePost/components/CreatePostEditor';
import type { Post } from '../../../types';
import { PostsService } from '../../../services/PostsService';
import { ImageService } from '../../../services/ImageService';
import { useDispatch, useSelector } from 'react-redux';
import { updatePost } from '../../../redux/slices/posts/postsSlice';
import { addToast } from '../../../redux/slices/toasts/toastsSlice';
import type { RootState } from '../../../redux/store';

type EditPostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
};

export const EditPostModal = memo(function EditPostModal({ isOpen, onClose, post }: EditPostModalProps) {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Essays');
  const [quote, setQuote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [visibility, setVisibility] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  const categories = [
    'Science',
    'Photography',
    'Urbanism',
    'Technology',
    'Culture',
    'Travel',
    'Essays',
    'Design',
  ];

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setExcerpt(post.excerpt || '');
      setContent(post.content);
      setCategory(post.category);
      setQuote(post.quote || '');
      setTags(post.tags || []);
      setCoverImage(post.coverImage || '');
      setVisibility(post.visibility || 0);
    }
  }, [post]);

  const handleImageUpload = async (file: File) => {
    setImageError('');

    const validation = ImageService.validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || 'Invalid image file');
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await ImageService.uploadImage(file, token || '', 'posts');
      setCoverImage(result.url);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const paragraphs = content.split(/\n\n+/).filter((p) => p.trim() !== '');
      const requestData: any = {
        title: title.trim(),
        content: content.trim(),
        coverImage: coverImage || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80',
        category: category,
        featured: post.featured,
        paragraphs,
        visibility,
      };

      if (excerpt.trim()) requestData.excerpt = excerpt.trim();
      if (quote.trim()) requestData.quote = quote.trim();
      if (tags.length > 0) requestData.tags = tags;

      const updatedPost = await PostsService.updatePost(post.id, requestData, token);
      dispatch(updatePost(updatedPost));
      dispatch(addToast({ message: 'Post updated successfully', type: 'success' }));
      onClose();
    } catch (error) {
      console.error('Failed to update post:', error);
      dispatch(addToast({ message: 'Failed to update post', type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="edit-post-modal">
      <div className="edit-post-modal__backdrop" onClick={handleClose} />
      <div className="edit-post-modal__content">
        <div className="edit-post-modal__header">
          <h2>Edit Post</h2>
          <button type="button" className="edit-post-modal__close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        <div className="edit-post-modal__body">
          <CreatePostEditor
            title={title}
            excerpt={excerpt}
            content={content}
            category={category}
            categories={categories}
            quote={quote}
            tags={tags}
            tagInput={tagInput}
            wordCount={content.trim() === '' ? 0 : content.trim().split(/\s+/).filter(Boolean).length}
            coverImage={coverImage}
            isUploadingImage={isUploadingImage}
            imageError={imageError}
            visibility={visibility}
            onTitleChange={setTitle}
            onExcerptChange={setExcerpt}
            onContentChange={setContent}
            onCategoryChange={setCategory}
            onQuoteChange={setQuote}
            onTagInputChange={setTagInput}
            onAddTag={() => {
              const trimmedTag = tagInput.trim();
              if (trimmedTag && !tags.includes(trimmedTag)) {
                setTags([...tags, trimmedTag]);
                setTagInput('');
              }
            }}
            onRemoveTag={(tag) => setTags(tags.filter((t) => t !== tag))}
            onTagInputKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const trimmedTag = tagInput.trim();
                if (trimmedTag && !tags.includes(trimmedTag)) {
                  setTags([...tags, trimmedTag]);
                  setTagInput('');
                }
              }
            }}
            onImageUpload={handleImageUpload}
            onRemoveImage={() => {
              setCoverImage('');
              setImageError('');
            }}
            onVisibilityChange={setVisibility}
            onSubmit={isSubmitting ? (e) => e.preventDefault() : handleSubmit}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
});
