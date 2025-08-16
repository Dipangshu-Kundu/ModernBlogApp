import axios from 'axios'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { addSelectedBlog, changeLikes, removeSelectedBlog } from '../utils/selectedBlogSlice'
import Comment from '../components/Comment'
import { setIsOpen } from '../utils/commentSlice'
import { formatDate } from '../utils/formatDate'
// import jwt from 'jsonwebtoken'
export async function handleSaveBlogs(id, token) {
  try {
    let res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/save-blog/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    toast.success(res.data.message)
    // dispatch(addSelectedBlog(blog))

  } catch (error) {
    toast.error(error.response?.data?.message || error.message || "Something went wrong")

  }
}
export async function handleFollowCreator(id, token) {
  try {
    let res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/follow/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    toast.success(res.data.message)
    // dispatch(addSelectedBlog(blog))

  } catch (error) {
    toast.error(error.response?.data?.message || error.message || "Something went wrong")

  }
}
function BlogPage() {
  const { id } = useParams()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  // const user=JSON.parse(localStorage.getItem("user"))
  // const token=JSON.parse(localStorage.getItem("token"))

  const { token, email, id: userId, profilePic } = useSelector((state) => state.user)
  const { likes, comments, content } = useSelector((state) => state.selectedBlog)
  const { isOpen } = useSelector((state) => state.comment)

  const [blogData, setBlogData] = useState({})
  const [islike, setIsLike] = useState(false)
  async function fetchBlogById() {
    try {
      let { data: { blog } } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`)
      setBlogData(blog)
      dispatch(addSelectedBlog(blog))
      if (blog?.likes?.includes(userId)) {
        setIsLike((prev) => !prev);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong")

    }
  }

  async function handleLike() {
    if (token) {
      let res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs/like/${blogData._id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setIsLike((prev) => !prev);
      dispatch(changeLikes(userId))

      toast.success(res.data.message)

    } else {
      return toast.error("please signin to like this blog")

    }
    console.log(islike + "helo");
    console.log(blogData.likes);
  }

  function handleComment() {
    setIsLike(prev => !prev)
    if (token) {

    } else {
      return toast.error("please signin to like this blog")
      navigate("/signin")
    }
  }
  useEffect(() => {
    fetchBlogById()
    return () => {
      //window.location.pathame //current path
      //location.pathname   //gives the previous path
      dispatch(setIsOpen(false))
      if (window.location.pathname != `/edit/${id}` && window.location.pathname != `/blog/${id}`) {
        dispatch(removeSelectedBlog())
      }
    }
  }, [id])


  return (
    <div className='max-w-[700px] mx-auto p-5'>
      {
        blogData ? <div className='max-w-[700px] mx-auto'>
          <h1 className='mt-10 font-bold text-3xl sm:text-4xl lg:text-6xl capitalize'>{blogData.title}</h1>
          <div className='flex items-center my-5 gap-3'>
            <Link to={`/@${blogData?.creator?.username}`}>
              <div>
                <div onClick={() => setShowPoup((prev) => !prev)} className='w-10 h-10 cursor-pointer'>
                  <img src={profilePic ? profilePic : `https://api.dicebear.com/9.x/initials/svg?seed=${blogData.creator?.name}`} alt="" className='rounded-full w-full h-full object-cover' />
                </div>
              </div>
            </Link>
            <div className='flex flex-col'>
              <div className='flex items-center gap-1'>
                <Link to={`/@${blogData?.creator?.username}`}>
                  <h2 className='text-xl cursor-pointer hover:underline'>{blogData.creator?.name}</h2>
                </Link>
                <p onClick={() => handleFollowCreator(blogData?.creator?._id, token)} className='text-lg my-2 font-medium text-green-700 cursor-pointer hover:underline'>{!blogData?.creator?.followers?.includes(userId) ? "Follow" : "UnFollow"}</p>
              </div>
              <div><span>6 min read</span>
                <span className='mx-2'>{formatDate(blogData.createdAt)}</span></div>
            </div>
          </div>
          <img src={blogData.image} alt="" className='max-w-[400px] max-h-[400px]' />
          {
            token && email == blogData?.creator?.email &&
            <Link to={"/edit/" + blogData.blogId}>
              <button className='bg-green-400 mt-5 px-6 py-4 text-xl rounded'>
                Edit
              </button>
            </Link>
          }
          <div className='flex gap-4 mt-4'>
            <div className='cursor-pointer flex gap-2'>
              {
                islike ? (<i onClick={handleLike} className="fi fi-sr-thumbs-up text-blue-600 text-3xl mt-1"></i>) : (<i onClick={handleLike} className="fi fi-rr-social-network text-3xl mt-1"></i>)
              }
              <p className='text-3xl'>{likes?.length || 0}</p>

            </div>
            <div className='flex gap-2'>
              <i onClick={() =>
                dispatch(setIsOpen())
              } className="fi fi-sr-comment-alt-dots text-3xl mt-1 cursor-pointer"></i>
              <p className='text-3xl'>{comments?.length || 0}</p>

            </div>
            <div className='flex gap-2 cursor-pointer' onClick={(e) => {
              handleSaveBlogs(blogData._id, token)
            }
            }>
              {
                blogData?.totalSaves?.includes(userId) ?
                  <i class="fi fi-sr-bookmark text-3xl mt-1"></i>
                  :
                  <i className="fi fi-rr-bookmark text-3xl mt-1"></i>

              }
            </div>
          </div>
          <div className='my-10'>
            {
              content?.blocks?.map((block) => {
                if (block.type == "header") {
                  if (block.data.level == 2) {
                    return <h2 className='font-bold text-4xl my-4' dangerouslySetInnerHTML={{ __html: block.data.text }}></h2>
                  } else if (block.data.level == 3) {
                    return <h3 className='font-bold text-3xl my-4' dangerouslySetInnerHTML={{ __html: block.data.text }}></h3>
                  } else if (block.data.level == 4) {
                    return <h4 className='font-bold text-2xl my-4' dangerouslySetInnerHTML={{ __html: block.data.text }}></h4>
                  }
                } else if (block.type == "paragraph") {
                  return <p className='my-4' dangerouslySetInnerHTML={{ __html: block.data.text }}></p>
                }
                else if (block.type == "image") {
                  return <div className='my-4'>
                    <img src={block.data.file.url} alt="" />
                    <p className='text-center my-2'>{block.data.caption}</p>
                  </div>
                }
              })
            }
          </div>
        </div> :
          <div>Loading....</div>
      }
      {
        isOpen && <Comment></Comment>
      }

    </div>
  )
}

export default BlogPage
