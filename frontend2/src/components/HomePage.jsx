import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';
import { handleSaveBlogs } from '../pages/BlogPage';
import { useSelector } from 'react-redux';
import DisplayBlogs from './DisplayBlogs';
import usePagination from '../hooks/usePagination';

function HomePage() {
    const { token, id: userId } = useSelector((state) => state.user)
    const [page, setPage] = useState(1)
    const { blogs, hasMore } = usePagination("blogs", {}, 1, page)

    return (
        <div className='w-full lg:w-[80%] 2xl:w-[60%] mx-auto flex p-5'>
            <div className='w-full md:w-[65%] md:pr-10'>

           {
            blogs.length > 0 && <DisplayBlogs blogs={blogs}></DisplayBlogs>
           }
           {
            hasMore && 
           <button className='rounded-3xl bg-blue-500 text-white px-7 py-2 cursor-pointer mx-auto' onClick={()=>setPage((prev)=>prev+1)}>Load More</button>
           }
            </div>
            <div className='hidden md:block w-[30%] pl-10 min-h-[calc(100vh_-_70px)]'>
                    <div className=''>
                       <h1 className='text-xl font-semibold mb-4'>Recommended Topics</h1> 
                        <div className='flex flex-wrap'>
                            {
                                ["React","Node js","Mern","Express","blog"].map((tag,index)=>(
                                    <Link to={`/tag/${tag}`}>
                                    <div className='m-2 cursour-poiner bg-gray-300 text-black rounded-full px-7 py-2 flex justify-center items-center hover:text-white hover:bg-black cursor-pointer'>
                                        <p>{tag}</p>
                                    </div>
                                    </Link>
                                ))
                            }
                        </div>
                    </div>
                </div>
        </div>
        // <div className='w-full flex justify-center'>
            
        //     <div className='w-[80%] flex justify-evenly relative'>
        //         <div>

        //             {
        //                 blogs.length > 0 && <DisplayBlogs blogs={blogs}></DisplayBlogs>
        //             }
        //             {
        //                 hasMore &&
        //                 <button className='rounded-3xl bg-blue-500 text-white px-7 py-2 cursor-pointer mx-auto' onClick={() => setPage((prev) => prev + 1)}>Load More</button>
        //             }
        //         </div>
                
        //     </div>


        // </div>
    )
}

export default HomePage
