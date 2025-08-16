import axios from 'axios'
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import DisplayBlogs from '../components/DisplayBlogs'
import usePagination from '../hooks/usePagination'

function SearchBlogs() {
    const [searchParams, setSearchParams] = useSearchParams()
    const {tag}=useParams()
    const [page, setPage] = useState(1)
    const q = searchParams.get("q")
    const query=tag?{tag:tag.toLowerCase().replace(" ","-")}:{search:q}
    const {blogs,hasMore}=usePagination("search-blogs",query,1,page)
    return (
        <div className='w-full p-5 sm:w-[80%] md:w-[60%] mg:w-[55%] mx-auto'>
            <h1 className='my-20 text-4xl text-gray-500 font-bold'>Results for <span className='text-black'>{tag?tag:q}</span></h1>
            {
            blogs.length > 0 && <DisplayBlogs blogs={blogs}></DisplayBlogs>
           }
           {
            hasMore && 
           <button className='rounded-3xl bg-blue-500 text-white px-7 py-2 cursor-pointer mx-auto' onClick={()=>setPage((prev)=>prev+1)}>Load More</button>
           }
        </div>
    )
}

export default SearchBlogs
