import './CreatePost.scss';

import { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DashboardNavbar } from '../../shared/components/DashboardNavbar';
import { CreatePostEditor } from './components/CreatePostEditor';
import type { RootState } from '../../redux/store';
import { addPost } from '../../redux/slices/posts/postsSlice';
import { addToast } from '../../redux/slices/toasts/toastsSlice';
import { PostsService } from '../../services/PostsService';
import { ImageService } from '../../services/ImageService';

export const CreatePostPage = memo(function CreatePostPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Essays');
  const [quote, setQuote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [visibility, setVisibility] = useState(0);

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

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).filter(Boolean).length;

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

  const handleRemoveImage = () => {
    setCoverImage('');
    setImageError('');
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Only auto-extract tags if there are no manually added tags yet
    if (tags.length === 0) {
      const extractedTags = extractTagsFromContent(newContent);
      if (extractedTags.length > 0) {
        setTags(extractedTags);
      }
    }
  };

  const extractTagsFromContent = (content: string): string[] => {
    // Look for tags at the end of content
    const lines = content.split('\n');
    const lastLine = lines[lines.length - 1]?.trim();
    
    if (lastLine && lastLine.toLowerCase().startsWith('tags:')) {
      const tagString = lastLine.substring(5).trim();
      return tagString.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    }
    
    // Also check for "Tags:" anywhere in content
    const tagMatch = content.match(/Tags:\s*([^\n]+)/i);
    if (tagMatch) {
      const tagString = tagMatch[1].trim();
      return tagString.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    }
    
    return [];
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user || !token) return;
    if (!content.trim()) return;

    setIsSubmitting(true);
    
    // Remove tags line from content before sending (only if it exists)
    let cleanContent = content.trim();
    const lines = cleanContent.split('\n');
    const lastLine = lines[lines.length - 1]?.trim();
    
    if (lastLine && lastLine.toLowerCase().startsWith('tags:')) {
      cleanContent = lines.slice(0, -1).join('\n').trim();
    }
    
    const paragraphs = cleanContent.split(/\n\n+/).filter((p) => p.trim() !== '');

    const requestData: any = {
      title: title.trim(),
      content: cleanContent,
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80',
      category: category,
      featured: false,
      paragraphs,
      visibility,
    };

    if (excerpt.trim()) requestData.excerpt = excerpt.trim();
    if (quote.trim()) requestData.quote = quote.trim();
    if (tags.length > 0) requestData.tags = tags;

    try {
      const post = await PostsService.createPost(requestData, token);
      dispatch(addPost(post));
      dispatch(addToast({ message: 'Blog published successfully', type: 'success' }));
      navigate('/dashboard');
    } catch (error) {
      dispatch(addToast({ message: 'Failed to publish post. Please try again.', type: 'error' }));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  return (
    <div className="create-post-page">
      <DashboardNavbar />

      <CreatePostEditor
        title={title}
        excerpt={excerpt}
        content={content}
        category={category}
        categories={categories}
        quote={quote}
        tags={tags}
        tagInput={tagInput}
        wordCount={wordCount}
        coverImage={coverImage}
        isUploadingImage={isUploadingImage}
        imageError={imageError}
        visibility={visibility}
        onTitleChange={setTitle}
        onExcerptChange={setExcerpt}
        onContentChange={handleContentChange}
        onCategoryChange={setCategory}
        onQuoteChange={setQuote}
        onTagInputChange={setTagInput}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onTagInputKeyDown={handleTagInputKeyDown}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        onVisibilityChange={setVisibility}
        onSubmit={isSubmitting ? (event) => event.preventDefault() : handleSubmit}
        onClose={handleClose}
      />
    </div>
  );
});
