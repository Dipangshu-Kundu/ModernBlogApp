import axios from 'axios'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { formatDate } from '../utils/formatDate'
import { handleFollowCreator, handleSaveBlogs } from './BlogPage'
import { useSelector } from 'react-redux'
import DisplayBlogs from '../components/DisplayBlogs'
function ProfilePage() {
    const { username } = useParams()
    const [userData, setUserData] = useState(null)
    const { token, id: userId,profilePic } = useSelector((state) => state.user)
    const location=useLocation()
    const navigate=useNavigate()
    // function renderComponent(){
    //     if(location.pathname == `/${username}`){
    //         return <DisplayBlogs blogs={userData?.blogs?.filter((blog)=>!blog.draft)}></DisplayBlogs>
    //     }
    //     else if(location.pathname == `/${username}/saved-blogs`){
    //         return (
    //              <>
    //              {userData._id == userId?
    //              <DisplayBlogs blogs={userData.saveBlogs}></DisplayBlogs>:
    //              (<Navigate to={`/${username}`}></Navigate>)}
    //             </>
    //         )
    //     }else if(location.pathname == `/${username}/draft-blogs`){

    //         return (
    //             <>
    //              {userData._id == userId?
    //              <DisplayBlogs blogs={userData?.blogs?.filter((blog)=>blog.draft)}></DisplayBlogs>:
    //              (<Navigate to={`/${username}`}></Navigate>)}
    //             </>
    //         )
    //     }
    //     else{
    //         return (
    //              <>
    //              {userData._id == userId?
    //              <DisplayBlogs blogs={userData?.likeBlogs}></DisplayBlogs>:
    //              (<Navigate to={`/${username}`}></Navigate>)}
    //             </>
    //         )
    //     }
    // }
    function renderComponent(){
    if(location.pathname == `/${username}`){
        return <DisplayBlogs blogs={userData?.blogs?.filter((blog)=>!blog.draft)} />
    }
    else if(location.pathname == `/${username}/saved-blogs`){
        return userData.showSavedBlogs || userData._id == userId
            ? <DisplayBlogs blogs={userData.saveBlogs} />
            : <Navigate to={`/${username}`} />
    }
    else if(location.pathname == `/${username}/draft-blogs`){
        return userData._id == userId
            ? <DisplayBlogs blogs={userData?.blogs?.filter((blog)=>blog.draft)} />
            : <Navigate to={`/${username}`} />
    }
    else if(location.pathname == `/${username}/liked-blogs`){
        return userData.showLikedBlogs || userData._id == userId
            ? <DisplayBlogs blogs={userData?.likeBlogs} />
            : <Navigate to={`/${username}`} />
    }
}

    useEffect(() => {
        async function fetchUserDetails() {
            try {
    
                
                let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${username.split("@")[1]}`)
                 
                
                setUserData(res?.data?.user)
            } catch (error) {

                toast.error(error?.response?.data?.message || "Something error occurred")
                console.log(error);

            }
        }
        fetchUserDetails()
    }, [username])
    
    return (
        <div className='w-full flex justify-center'>
            {
                userData ? (
                    <div className='w-[80%] flex max-lg:flex-col-reverse justify-evenly'>
                        <div className='max-lg:w-full w-[50%]'>
                            <div className='justify-between my-10 hidden sm:flex'>
                                <p className='text-4xl font-bold'>{userData.name}</p>
                                <i className="fi fi-bs-menu-dots cursor-pointer opacity-70"></i>
                            </div>
                            <div className='my-4'>
                                <nav className='my-4'>
                                    <ul className='flex gap-6'>
                                        <li>
                                            <Link to={`/${username}`} className={`${location.pathname == `/${username}`? "border-b-2 border-black":""} pb-1`}>Home</Link>
                                        </li>
                                        {
                                            userData.showSavedBlogs || userData._id == userId? <li>
                                            <Link to={`/${username}/saved-blogs`} className={`${location.pathname == `/${username}/saved-blogs`? "border-b-2 border-black":""} pb-1`}>Saved <span className='hidden sm:inline'>Blogs</span></Link>
                                        </li>:null
                                        }
                                       {
                                        userData.showLikedBlogs || userData._id == userId?<li>
                                            <Link to={`/${username}/liked-blogs`} className={`${location.pathname == `/${username}/liked-blogs`? "border-b-2 border-black":""} pb-1`}>Liked <span className='hidden sm:inline'>Blogs</span></Link>
                                        </li>:null
                                       }
                                        
                                        {
                                            userData._id == userId?<li>
                                            <Link to={`/${username}/draft-blogs`} className={`${location.pathname == `/${username}/draft-blogs`? "border-b-2 border-black":""} pb-1`}>Draft <span className='hidden sm:inline'>Blogs</span></Link>
                                        </li>:null
                                        }
                                        
                                    </ul>
                                </nav>

                                {
                                    renderComponent()
                                }
                                {/* <div>
                                    {
                                        userData?.blogs.map((blog) => (
                                            <Link to={"blog/" + blog.blogId}>
                                                <div className='w-full my-8 flex justify-between'>
                                                    <div className='w-[60%] flex flex-col gap-2'>
                                                        <div>
                                                            <p >{blog.creator.name}</p>
                                                        </div>
                                                        <h2 className='font-bold text-xl'>{blog.title}</h2>
                                                        <h4 className='line-clamp-2'>{blog.description}</h4>
                                                        <div className='flex gap-5'>
                                                            <p>{formatDate(blog.createdAt)}</p>
                                                            <div className='flex gap-4'>
                                                                <div className='cursor-pointer flex gap-2'>
                                                                    <i className="fi fi-rr-social-network text-lg mt-1"></i>
                                                                    <p className='text-lg'>{blog.likes?.length || 0}</p>
                                                                </div>
                                                                <div className='flex gap-2'>
                                                                    <i className="fi fi-sr-comment-alt-dots text-lg mt-1"></i>
                                                                    <p className='text-lg'>{blog.comments?.length || 0}</p>
                                                                </div>
                                                                <div className='flex gap-2 cursor-pointer' onClick={(e) => {
                                                                    e.preventDefault()
                                                                    handleSaveBlogs(blog._id, token)
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
                                                    <div className='w-[25%]'>
                                                        {
                                                            blog.image ? <img src={blog.image} alt="" /> : <img src="https://res.cloudinary.com/dv5bcbdjc/image/upload/v1752944152/blog%20app/svhiiv65dcry6btqloic.jpg" alt="" />
                                                        }
                                                    </div>
                                                </div>
                                            </Link>

                                        ))
                                    }
                                </div> */}

                                
                            </div>
                        </div>
                        <div className="max-lg:w-full w-[20%] lg:border-l max-lg:flex max-lg:flex-col lg:pl-10 lg:min-h-[calc(100vh_-_70px)]">
                            <div className='my-10'>
                                <div className='w-20 h-20 mb-20'>
                                    <img src={profilePic?profilePic:`https://api.dicebear.com/9.x/initials/svg?seed=${userData.name}`} alt="" className='rounded-full' />
                                </div>
                                <p className='text-base max-md:text-lg font-meidum my-3'>{userData.name}</p>
                                <p>{userData?.followers?.length} Followers</p>
                                {/* <p className='text-slate-600'>22.9K Followers</p>         */}
                                <p className='text-slate-600 text-sm font-normal my-3'>{userData?.bio}</p>
                                {
                                    userId == userData._id?(
                                        <Link to={`/edit-profile`}>
                                        <button className="bg-green-500 max-lg:w-full px-8 py-3 rounded-full text-white my-3 cursor-pointer">Edit Profile</button>
                                        </Link>
                                    ):(<button onClick={() => handleFollowCreator(userData._id, token)} className="bg-green-500 max-lg:w-full px-8 py-3 rounded-full text-white my-3 cursor-pointer">Follow</button>)
                                }
                                <div className='my-6 w-full hidden lg:block'>
                                    <h2 className='font-semibold'>Following</h2>
                                    <div className='my-5'>
                                        {
                                            userData?.following?.map((user) => (
                                                <div className='flex justify-between items-center'>
                                                    <Link to={`/@${user.username}`}>
                                                    <div className='flex gap-2 items-center'>
                                                        <div className='w-4 h-4'>
                                                            <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`} alt="" className='rounded-full' />
                                                        </div>
                                                        <p className='text-base font-meidum my-3 hover:underline cursor-pointer'>{user.name}</p>
                                                    </div>
                                                    </Link>
                                                    <i class="fi fi-rr-menu-dots"></i>
                                                </div>

                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>) : <h1>Loading...</h1>
            }

        </div>
    )
}

export default ProfilePage
