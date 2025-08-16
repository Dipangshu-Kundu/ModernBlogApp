    import React from 'react'
    import { useEffect } from 'react'
    import { useState } from 'react'
    import toast from 'react-hot-toast'
    import { useDispatch, useSelector } from 'react-redux'
    import { login } from '../utils/userSlice'
    import axios from 'axios'
import { Navigate } from 'react-router-dom'

    function EditProfile() {
        const { token, id: userId, name, username, profilePic, bio,email } = useSelector((state) => state.user)
        const dispatch=useDispatch()
        const [userData, setUserData] = useState({
            profilePic: profilePic,
            username: username,
            name: name,
            bio: bio
        })
        const [initialData, setInitialData] = useState({
            profilePic: profilePic,
            username: username,
            name: name,
            bio: bio
        })
        const [isButtonDisabled, setIsButtonDisabled] = useState(false)
        function handleChange(e) {
            const { value, name, files } = e.target
            if (files) {
                setUserData((prevData) => ({ ...prevData, [name]: files[0] }))
            }
            else {
                setUserData((prevData) => ({ ...prevData, [name]: value }))
            }
        }
        async function handleUpdateProfile() {
            setIsButtonDisabled(true)
            const formData=new FormData()
            formData.append("name", userData.name)
            formData.append("username", userData.username)
            if(userData.profilePic){
                formData.append("profilePic", userData.profilePic)
            }
            formData.append("bio", userData.bio)
        

            try {
                const res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log(res);

                toast.success(res?.data?.message)
                dispatch(login({...res?.data?.user,token,email,id:userId}))
            } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong")

            }finally{
                
            }
        }
        useEffect(() => {
            if (initialData) {
                const isEqual = JSON.stringify(userData) == JSON.stringify(initialData)
                setIsButtonDisabled(isEqual)
            }
        }, [userData, initialData])
        return token==null?(
            <Navigate to={'/signin'}></Navigate>
        ): (
            <div className='w-full mx-auto p-5'>
                <div className='w-full md:w-[70%] lg:w-[55%] mx-auto my-10 lg:px-10'>
                    <h1 className='text-center text-3xl font-medium my-4'>Edit Profile</h1>
                    <div>
                        <div className='my-4'>
                            <h2 className='cursor-pointer text-2xl font-semibold my-2'>Photo</h2>
                            <div className='flex items-center justify-center flex-col gap-3'>
                            <label htmlFor="image" className='cursor-pointer'>
                                {
                                    userData?.profilePic ? <img src={typeof (userData?.profilePic) == "string" ? userData?.profilePic : URL.createObjectURL(userData?.profilePic)} alt="" className='aspect-square object-cover border rounded-full' /> :
                                        <div className='w-[150px] h-[150px] bg-white border-2 border-dashed rounded-full aspect-square flex justify-center items-center text-xl'>
                                            <h1>Select Image</h1>
                                        </div>
                                }

                            </label>
                            <h2 className='text-lg text-red-500 font-medium cursor-pointer' onClick={()=>{
                                setUserData((prevData)=>({
                                    ...prevData,profilePic:null
                                }))
                            }}>Remove</h2>
                            </div>

                            <input className='hidden' id="image" type="file" accept=".png,.jpeg,.jpg" placeholder='File'
                                onChange={handleChange} name="profilePic"
                            />
                        </div>
                        <div className='my-4'>
                            <h2 className='cursor-pointer text-2xl font-semibold my-2'>Name</h2>
                            <input id="title" type="text"
                                name="name" placeholder='name'
                                onChange={handleChange}
                                value={userData.name}
                                className='border focus:outline-none rounded-lg w-1/2 p-2 placeholder:text-lg' />
                        </div>
                        <div className='my-4'>

                            <h2 className='cursor-pointer text-2xl font-semibold my-2'>username</h2>
                            <input id="title" type="text" name="username" placeholder='username'
                                onChange={handleChange}
                                value={userData.username}
                                className='border focus:outline-none rounded-lg w-1/2 p-2 placeholder:text-lg' />
                        </div>

                        <div className='my-4 '>
                            <h2 className='cursor-pointer text-2xl font-semibold my-2'>Bio</h2>
                            <textarea
                                type="text"
                                name="bio"
                                placeholder="Enter your Bio..."
                                className="border rounded-lg h-[150px] resize-none drop-shadow w-full p-3 text-lg focus:outline-none"
                                onChange={handleChange}
                                value={userData.bio}
                            />
                        </div>

                        <button disabled={isButtonDisabled} className={`px-7 cursor-pointer py-3 rounded-full text-white my-3 ${isButtonDisabled ? "bg-green-200" : "bg-green-600"}`} onClick={handleUpdateProfile}
                        >Update</button>
                    </div>
                </div>
            </div>
        )
    }

    export default EditProfile
