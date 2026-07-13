import { memo, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { useNavigate, useParams } from 'react-router-dom'

import DashboardNavbar from '../../shared/components/DashboardNavbar'

import ArticleHeader from './components/ArticleHeader'

import ArticleContent from './components/ArticleContent'

import ArticleDiscussion from './components/ArticleDiscussion'

import type { RootState } from '../../redux/store'

import { toggleLike, addComment } from '../../redux/slices/posts/postsSlice'




const SinglePostPage = memo(function SinglePostPage() {

  const { id } = useParams()

  const navigate = useNavigate()

  const dispatch = useDispatch()

  const post = useSelector((state: RootState) => state.posts.find((entry) => entry.id === id))

  const user = useSelector((state: RootState) => state.auth.user)

  const hasLiked =

    !!user && (post?.likedBy ?? []).includes(user.id)

  const [commentText, setCommentText] = useState('')



  if (!post) {

    return (

      <div className="article-page">

        <DashboardNavbar />

        <div className="article__container">

          <p className="article__not-found">Post not found.</p>

        </div>

      </div>

    )

  }



  const paragraphs = post.paragraphs ?? [post.content]

  const commentsList = post.commentsList ?? []

  const totalComments = post.comments



  const handleLike = () => {

    if (user) {

      dispatch(

        toggleLike({

          postId: post.id,

          userId: user.id,

        })

      )

    }

  }



  const handleSendComment = (e: React.FormEvent) => {

    e.preventDefault()



    if (!commentText.trim()) return



    const newComment = {

      id: Date.now().toString(),

      author: user?.name || 'Mara Voss',

      avatar: user?.avatar || 'MV',

      text: commentText.trim(),

      date: new Date().toLocaleDateString('en-US', {

        month: 'short',

        day: 'numeric',

        year: 'numeric',

      }),

    }



    dispatch(

      addComment({

        postId: post.id,

        comment: newComment,

      })

    )



    setCommentText('')

  }



  return (

    <div className="article-page">

      <DashboardNavbar />



      <article className="article">

        <div className="article__container">

          <ArticleHeader post={post} onBack={() => navigate('/dashboard')} />



          <ArticleContent post={post} paragraphs={paragraphs} />



          <ArticleDiscussion

            likes={post.likes}

            hasLiked={hasLiked}

            totalComments={totalComments}

            commentsList={commentsList}

            userAvatar={user?.avatar || 'MV'}

            commentText={commentText}

            onLike={handleLike}

            onCommentChange={setCommentText}

            onSendComment={handleSendComment}
            postId={post.id}

          />

        </div>

      </article>

    </div>

  )

})



export default SinglePostPage

