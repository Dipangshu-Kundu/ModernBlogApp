import React, { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../utils/userSlice'
import { useEffect } from 'react'
import axios from 'axios'
function NavBar() {
    const { token, name,profilePic ,username} = useSelector((state) => state.user)
    const [showPopup,setShowPoup]=useState(false)
    const [searchQuery,setSearchQuery]=useState("")
    const [showSearchBar,setShowSearchBar]=useState(false)
    const dispatch=useDispatch()
    const navigate=useNavigate()
    function handleLogout(){
        dispatch(logout())
        setShowPoup(false)
    }
   useEffect(()=>{
    if(window.location.pathname != '/search'){
        setSearchQuery(null)
    }
    return ()=>{
        if(window.location.pathname != '/'){
            setShowPoup(false)
        }
    }
   },[window.location.pathname])
    return (
        <>
            <div className='bg-white relative w-full flex justify-between items-center h-[70px] px-[30px] border-b drop-shadow-sm'>
                <div className='flex gap-4 items-center relative'>
                    <Link to={'/'}>
                        <div>
                            <img src={logo} alt="" />
                        </div>
                    </Link>
                    <div className={`relative max-sm:absolute max-sm:z-40  max-sm:top-16 sm:block ${showSearchBar?"max-sm-block":"max-sm:hidden"}`}>
                        <i className="fi fi-rr-search absolute text-lg top-1/2 -translate-y-1/2 mt-1 ml-4 opacity-40"></i>
                        <input type="text" className='bg-gray-100 focus:outline-none max-sm:w-[calc(100vw_-_70px)] rounded-full pl-12 p-2' placeholder='search' 
                        value={searchQuery?searchQuery:""} onChange={(e)=>setSearchQuery(e.target.value)} onKeyDown={(e)=>{
                            if(e.code == "Enter"){
                                if(searchQuery.trim()){
                                    setShowSearchBar(false)
                                    if(showSearchBar){
                                        setSearchQuery("")
                                    }
                                    navigate(`/search?q=${searchQuery.trim()}`)
                                }
                            }
                        }}/>
                    </div>
                </div>

                <div className='flex gap-5 justify-center items-center cursor-pointer'>
                    <i className='fi fi-rr-search text-xl sm:hidden cursor-pointer' onClick={()=>setShowSearchBar((prev)=>!prev)}></i>
                    <Link to={'/add-blog'}>
                        <div className='flex gap-2 items-center'>
                            <i className="fi fi-rr-edit text-2xl t-1"></i>
                            <span className='text-xl hidden sm:inline'>Write</span>
                        </div>
                    </Link>

                    {
                        token ?
                            // <div className='text-xl capitalize'>{name}</div>
                            <div onClick={()=>setShowPoup((prev)=>!prev)} className='w-10 h-10 cursor-pointer'>
                                <img src={profilePic? profilePic:`https://api.dicebear.com/9.x/initials/svg?seed=${name}`} alt="" className='rounded-full w-full h-full object-cover'/>
                            </div>
                            :
                            <div className='flex gap-3 cursor-pointer'>
                                <Link to={'/signup'}>
                                    <button className='bg-blue-500 px-5 py-3 text-white rounded-full cursor-pointer'>SignUp</button>
                                </Link>
                                <Link to={'/signin'}>
                                    <button className='border px-5 py-3 rounded-full cursor-pointer'>SignIn</button>
                                </Link>
                            </div>
                    }
                </div>
                {
                    showPopup?<div onMouseLeave={()=>setShowPoup((prev)=>!prev)} className='w-[150px] bg-gray-50 border absolute z-40 right-2 top-14 rounded-xl drop-shadow-md'>
                        <Link to={`/@${username}`}>
                        <p className='popup rounded-t-xl'>Profile</p>
                        </Link>
                        <Link to={`/edit-profile`}>
                        <p className='popup rounded-t-xl'>Edit Profile</p>
                        </Link>
                        <Link to={`/setting`}>
                        <p className='popup'>Setting</p>
                        </Link>
                    <p className='popup rounded-b-xl' onClick={handleLogout}>Logout</p>
                </div>:null
                }
            </div>
            <Outlet></Outlet>
        </>

    )
}

export default NavBar
