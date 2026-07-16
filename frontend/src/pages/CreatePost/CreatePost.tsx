import './CreatePost.scss'

import { memo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../../shared/components/DashboardNavbar'
import CreatePostEditor from './components/CreatePostEditor'
import type { RootState } from '../../redux/store'
import { addPost } from '../../redux/slices/posts/postsSlice'
import { PostsService } from '../../services/PostsService'

const CreatePostPage = memo(function CreatePostPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Essays')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = ['Science', 'Photography', 'Urbanism', 'Technology', 'Culture', 'Travel', 'Essays', 'Design']

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).filter(Boolean).length

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!user || !token) return
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    const paragraphs = content.split(/\n\n+/).filter((p) => p.trim() !== '')

    try {
      const post = await PostsService.createPost(
        {
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          content: content.trim(),
          coverImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80',
          category,
          featured: false,
          paragraphs,
        },
        token,
      )

      dispatch(addPost(post))
      navigate('/dashboard')
    } finally {
      setIsSubmitting(false)
    }
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
        onSubmit={isSubmitting ? (event) => event.preventDefault() : handleSubmit}
        onClose={handleClose}
      />
    </div>
  )
})

export default CreatePostPage
