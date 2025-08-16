import React from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/formatDate'
import { useSelector } from 'react-redux'

function DisplayBlogs({blogs}) {
    const { token, id: userId } = useSelector((state) => state.user)
  return (
    <div>
      {
                blogs.length>0?
                blogs.map((blog) => (
                    <Link to={"/blog/" + blog?.blogId}>
                        <div className='w-full my-8 flex justify-between'>
                            <div className='w-[60%] flex flex-col gap-2'>
                                <div>
                                    {/* <img src="" alt="" /> */}
                                    <p >{blog?.creator?.name}</p>
                                </div>
                                <h2 className='font-bold text-xl sm:text-2xl'>{blog?.title}</h2>
                                <h4 className='line-clamp-2'>{blog?.description}</h4>
                                <div className='flex gap-5'>
                                    <p>{formatDate(blog?.createdAt)}</p>
                                    <div className='flex gap-4'>
                                        <div className='cursor-pointer flex gap-2'>
                                            <i className="fi fi-rr-social-network text-lg mt-1"></i>
                                            <p className='text-lg'>{blog?.likes?.length || 0}</p>
                                        </div>
                                        <div className='flex gap-2'>
                                            <i className="fi fi-sr-comment-alt-dots text-lg mt-1"></i>
                                            <p className='text-lg'>{blog?.comments?.length || 0}</p>
                                        </div>
                                        <div className='flex gap-2 cursor-pointer' onClick={(e) => {
                                            e.preventDefault()
                                            handleSaveBlogs(blog?._id, token)
                                        }
                                        }>
                                            {
                                                blog?.totalSaves?.includes(userId) ?
                                                    <i className="fi fi-sr-bookmark text-lg mt-1"></i>
                                                    :
                                                    <i className="fi fi-rr-bookmark text-lg mt-1"></i>

                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='w-[40%] sm:w-[30%]'>
                                {
                                    blog?.image ? <img src={blog?.image} alt="" /> : <img src="https://res.cloudinary.com/dv5bcbdjc/image/upload/v1752944152/blog%20app/svhiiv65dcry6btqloic.jpg" alt="" />
                                }
                            </div>
                        </div>
                    </Link>

                ))
                :<h1 className='my-4 text-2xl font-semibold '>No Data Found</h1>
            }
    </div>
  )
}

export default DisplayBlogs
