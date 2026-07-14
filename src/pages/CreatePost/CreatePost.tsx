import './CreatePost.scss'

import { memo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../../shared/components/DashboardNavbar'
import CreatePostEditor from './components/CreatePostEditor'
import type { RootState } from '../../redux/store'
import { addPost } from '../../redux/slices/posts/postsSlice'
import type { Post } from '../../types'

const CreatePostPage = memo(function CreatePostPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Essays')

  const categories = ['Science', 'Photography', 'Urbanism', 'Technology', 'Culture', 'Travel', 'Essays', 'Design']

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).filter(Boolean).length

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!user) return
    if (!title.trim() || !content.trim()) return

    const paragraphs = content.split(/\n\n+/).filter((p) => p.trim() !== '')

    const post: Post = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      excerpt: excerpt.trim() || 'A short description of this post.',
      content: content.trim(),
      coverImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80',
      category,
      author: user.name,
      avatar: user.avatar,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
      likes: 0,
      likedBy: [],
      comments: 0,
      featured: false,
      paragraphs,
      commentsList: [],
    }

    dispatch(addPost(post))
    navigate('/dashboard')
  }

  const handleClose = () => {
    navigate('/dashboard')
  }

  return (
    <div className="create-post-page">
      <DashboardNavbar />

      <CreatePostEditor
        title={title}
        excerpt={excerpt}
        content={content}
        category={category}
        categories={categories}
        wordCount={wordCount}
        onTitleChange={setTitle}
        onExcerptChange={setExcerpt}
        onContentChange={setContent}
        onCategoryChange={setCategory}
        onSubmit={handleSubmit}
        onClose={handleClose}
      />
    </div>
  )
})

export default CreatePostPage
