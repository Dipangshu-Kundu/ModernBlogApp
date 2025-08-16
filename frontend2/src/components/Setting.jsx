import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Navigate, useNavigate } from 'react-router-dom'
import { updateData } from '../utils/userSlice'
function Setting() {
    const { token, id: userId,showLikedBlogs,showSavedBlogs } = useSelector((state) => state.user)
    const [data,setData]=useState({
        showLikedBlogs,
        showSavedBlogs
    })
    const navigate=useNavigate()
    const dispatch=useDispatch()
    async function handleVisibility(){
          try {
            const res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/change-saved-liked-blog-visibility`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(res);
            // console.log(URL.createObjectURL(blogData.image));
            dispatch(updateData(data))
            toast.success(res?.data?.message)
            navigate(-1)
        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
    }
   return token==null?(
            <Navigate to={'/signin'}></Navigate>
        ):(
    <div className='w-full mx-auto p-5 md:w-[800px] flex flex-col  justify-center items-center h-[calc(100vh-90px)]'>
        <div className='w-full'>
        <h1 className='my-10 text-2xl font-semibold text-left'>Settings</h1>
        </div>
       <div className='my-4 w-full'>
                <h2 className='cursor-pointer text-2xl font-semibold my-2'>Show Saved Blogs?</h2>
                <select
                    value={data.showSavedBlogs}
                    className="border rounded-lg drop-shadow w-full p-3 text-lg focus:outline-none"
                    onChange={(e) =>
                        setData((prev) => ({
                            ...prev,
                            showSavedBlogs: e.target.value === "true"?true:false
                        }))
                    }
                >
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
        </div>
       <div className='my-4 w-full'>
                <h2 className='cursor-pointer text-2xl font-semibold my-2'>Show Liked Blogs?</h2>
                <select
                    value={data.showLikedBlogs}
                    className="border rounded-lg drop-shadow w-full p-3 text-lg focus:outline-none"
                    onChange={(e) =>
                        setData((prev) => ({
                            ...prev,
                            showLikedBlogs: e.target.value === "true"?true:false
                        }))
                    }
                >
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
        </div>
        <button className='cursor-pointer bg-blue-500 tex-lg py-4 px-7 rounded-full font-semibold text-white my-6' 
        onClick={handleVisibility}
        >
            Update
        </button>
    </div>
  )
}

export default Setting
