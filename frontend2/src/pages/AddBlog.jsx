import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header'
import List from '@editorjs/list';
import Embed from '@editorjs/embed'
import ImageTool from '@editorjs/image'
import { setIsOpen } from '../utils/commentSlice'
import { removeSelectedBlog } from '../utils/selectedBlogSlice'

function AddBlog() {
    const { id } = useParams()
    const editorjsRef = useRef(null)
    const formData = new FormData()
    const { token } = useSelector((slice) => slice.user)
    const { title, description, image, content,tags,draft } = useSelector(slice => slice.selectedBlog)
    
    const [blogData, setBlogData] = useState({
        title: "",
        description: "",
        image: null,
        content: "",
        tags: [],
        draft: false
    })
    const navigate = useNavigate()
    const dispatch = useDispatch()
    // const navigate=useNavigate()
    // useEffect(()=>{
    //     if(!token){
    //         return navigate('/signin')
    //     }
    // },[])

    async function handlePostBlog() {

        formData.append("title", blogData.title)
        formData.append("description", blogData.description)
        formData.append("image", blogData.image)
        formData.append("content", JSON.stringify(blogData.content))
        formData.append("tags",JSON.stringify(blogData?.tags))
        formData.append("draft",blogData.draft)
        blogData?.content?.blocks?.forEach((block) => {
            if (block.type == "image") {
                formData.append("images", block.data.file.image)
            }
        })

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(res);
            console.log(URL.createObjectURL(blogData.image));

            toast.success(res.data.message)
            navigate("/")
        } catch (error) {
            toast.error(error.response.data.message)
        }


    }
    async function handleUpdateBlog() {
        const formData = new FormData();
        formData.append("title", blogData.title)
        formData.append("description", blogData.description)
        formData.append("image", blogData.image)
        formData.append("content", JSON.stringify(blogData.content))
        formData.append("tags",JSON.stringify(blogData?.tags))
        formData.append("draft",blogData.draft)
        let existingImages = []
        blogData?.content?.blocks?.forEach((block) => {
            if (block.type == "image") {//only valid for new images since older images we have converted them to secure_url and public_id
                if (block.data.file.image) {
                    formData.append("images", block.data.file.image)
                }
                else {
                    existingImages.push({
                        url: block.data.file.url,
                        imageId: block.data.file.imageId
                    })
                }
            }

        })
        // for(let data of formData.entries()){

        // }

        formData.append("existingImages", JSON.stringify(existingImages))
        try {
            const res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/blogs/` + id, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(res);
            // console.log(URL.createObjectURL(blogData.image));

            if (res?.data?.success) {
                toast.success(res.data.message);
                navigate("/");
            } else {
                toast.error(res.data.message || "Update may have failed");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)

        }


    }

    async function fetchBlogById() {
        // try {
        //     let res = await axios.get(`http://localhost:3000/api/v1/blogs/${id}`)
        // setBlogData({
        //     title: res.data.blog.title,
        //     description: res.data.blog.description,
        //     image: res.data.blog.image
        // })
        // } catch (error) {
        //     toast.error(error.response.data.message)
        // }
        setBlogData({
            title: title,
            description: description,
            image: image,
            content: content,
            draft:draft,
            tags:tags
        })

    }

    function initializeEditorJs() {
        editorjsRef.current = new EditorJS({
            holder: "editor",
            placeholder: "Write something",
            data: content,
            tools: {
                header: {
                    class: Header,
                    inlineToolbar: true,
                    config: {
                        placeholder: "Enter header",
                        levels: [2, 3, 4],
                        default: 3
                    }
                },
                list: {
                    class: List,
                    inlineToolbar: true
                },
               
                embed: {
                    class: Embed,
                    inlineToolbar: true
                },
                image: {
                    class: ImageTool,
                    config: {
                        uploader: {
                            uploadByFile: async (image) => {
                                return {
                                    success: 1,
                                    file: {
                                        url: URL.createObjectURL(image),
                                        image
                                    }
                                };
                            }
                        }
                    }
                }
            },

            onChange: async () => {
                let data = await editorjsRef.current.save();
                setBlogData((blogData) => ({ ...blogData, content: data }))

            }
        })

    }
    function handleKeyDown(e){
        const tag=e.target.value.toLowerCase();
        
        if(e.code == "Space"){
            e.preventDefault();
        }

       

        if(e.code =="Enter" && tag != ""){
            if(blogData?.tags?.length >= 10){
            e.target.value=""
            return toast.error("You can add up to max of 10 tags")
        }
        if(blogData?.tags?.includes(tag)){
            e.target.value="";
            return toast.error("This tag is already added")
        }
            setBlogData((prev)=>({...prev,tags:[...prev.tags,tag]}))
            e.target.value=""
        }
    }
    function deleteTag(index){
        const updatedTags=blogData.tags.filter((tag,tagIndex)=>tagIndex !=  index)
        setBlogData((prev)=>({...prev,tags:updatedTags}))
    }
    useEffect(() => {
        if (id) {
            fetchBlogById()
        }
    }, [id])
    useEffect(() => {
        if (editorjsRef.current == null) {
            initializeEditorJs()
        }
        // return () => {
        // editorjsRef.current = null;
        // }
        return () => {
            //window.location.pathame //current path
            //location.pathname   //gives the previous path
            editorjsRef.current = null;
            dispatch(setIsOpen(false))
            if (window.location.pathname != `/edit/${id}` && window.location.pathname != `/blog/${id}`) {
                dispatch(removeSelectedBlog())
            }
        }
    }, [])
    return token == null ? <Navigate to={'/signin'}></Navigate> :
        (<div className='p-5 w-full sm:w-[500px] lg:w-[1000px] mx-auto'>
            <div className='lg:flex lg:justify-between gap-8'>
                <div className='my-4 lg:w-3/6'>
                    <h2 className='cursor-pointer text-2xl font-semibold my-2'>Image</h2>
                    <label htmlFor="image" className='cursor-pointer'>
                        {
                            blogData.image ? <img src={typeof (blogData.image) == "string" ? blogData.image : URL.createObjectURL(blogData.image)} alt="" className='aspect-video object-cover border rounded-lg' /> :
                                <div className='bg-white border rounded-lg opacity-50 aspect-video flex justify-center items-center text-4xl'>
                                    <h1>Select Image</h1>
                                </div>
                        }

                    </label>

                    <input className='hidden' id="image" type="file" accept=".png,.jpeg,.jpg" placeholder='File' onChange={(e) => setBlogData((blogData) => ({ ...blogData, image: e.target.files[0] }))} />
                </div>
                <div className='lg:w-3/6'>
                    <div className='my-4'>

                        <h2 className='cursor-pointer text-2xl font-semibold my-2'>Title</h2>
                        <input id="title" type="text" placeholder='title' onChange={(e) => setBlogData((blogData) => ({ ...blogData, title: e.target.value }))} value={blogData.title} className='border focus:outline-none rounded-lg w-1/2 p-2 placeholder:text-lg' />
                    </div>

                    <div className='my-4 '>
                        <h2 className='cursor-pointer text-2xl font-semibold my-2'>Tags</h2>
                        <input
                            type="text"
                            placeholder="Tags..."
                            className="border rounded-lg drop-shadow w-full p-3 text-lg focus:outline-none"
                            onKeyDown={(e)=>handleKeyDown(e)} 
                        />
                        <div className='flex justify-between my-2'>
                             <p className='text-xs my-1 opacity-50'>*Click On  Enter to Add Tag</p> <p className='text-xs my-1 opacity-50'>{10-blogData?.tags?.length} Tags Remaining</p>
                        </div>
                        <div className='flex flex-wrap'>
                            {
                                blogData?.tags?.map((tag,index)=>(
                                    <div className='m-2 bg-gray-300 text-black rounded-full px-7 py-2 flex justify-center items-center gap-3 hover:text-white hover:bg-black cursor-pointer'>
                                        <p>{tag}</p>
                                        <i className='fi fi-sr-cross-circle mt-1 text-xl cursor-pointer' onClick={()=>deleteTag(index)}></i>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* //description */}
            <div className='my-4 '>
                <h2 className='cursor-pointer text-2xl font-semibold my-2'>Description</h2>
                <textarea
                    type="text"
                    placeholder="Enter your Description..."
                    className="border rounded-lg h-[150px] resize-none drop-shadow w-full p-3 text-lg focus:outline-none"
                    onChange={(e) => setBlogData((blogData) => ({ ...blogData, description: e.target.value }))}
                    value={blogData.description}
                />
            </div>

            {/* //draft */}
            <div className='my-4 '>
                <h2 className='cursor-pointer text-2xl font-semibold my-2'>Draft</h2>
                <select
                    value={blogData.draft}
                    className="border rounded-lg drop-shadow w-full p-3 text-lg focus:outline-none"
                    onChange={(e) =>
                        setBlogData((prev) => ({
                            ...prev,
                            draft: e.target.value === "true"?true:false
                        }))
                    }
                >
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </div>



            <div className='my-4'>
                <h2 className='cursor-pointer text-2xl font-semibold my-2'>Content</h2>
                <div id="editor" className='min-h-[20px]' ></div>
            </div>
            <button className='cursor-pointer bg-blue-500 tex-lg py-4 px-7 rounded-full font-semibold text-white my-6' onClick={id ? handleUpdateBlog : handlePostBlog}>{blogData.draft?"Save as Draft":id ? "UpdateBlog" : "Post Blog"}</button>
        </div>)
}

export default AddBlog
