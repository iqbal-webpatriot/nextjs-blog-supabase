import React, { useEffect, useState } from "react";
import withAuth from "../../protectedRoute/auth";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  addAllBlogsOfLoggedUser,
  addAllCategories,
  addAllTags,
  addEditBlogPost,
} from "../../Redux/Features/blogFeature/blogSlice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { allBlogPostOfLoggedUser, deleteTags, getAllCategories, getAllTags, searchAllBlogPostOfLoggedUser } from "../../service/api";
import Head from "next/head";
import ConfirmModal from "../Modal/ConfirmModal";
import CommonModal from "../Modal/CommonModal";

function UserBlogs() {
  const queryClient = useQueryClient();
  const { allBlogsOfLoggedUser } = useSelector((store) => store.blogReducer);
  const [searchInput,setSearchInput]=useState('');
  // const { user } = useSelector((store) => store.userReducer);
  const user= JSON.parse(sessionStorage.getItem("user"))
  const dispatch = useDispatch();
   const [isModalOpen,setIsModalOpen] = useState(false);
   const [confirmDelete,setConfirmDelete] = useState(false);
   const [deleteBlogInfo,setDeleteBlogInfo] = useState(null);

  const mutation = useMutation(
    async (deleteBody) => {
      const imagePath = deleteBody.image.substring(
        deleteBody.image.lastIndexOf("/") + 1
      );
      try {
        //!deleting all likes entry for this blog post from likes table if exist
         if(deleteBody.like_count>0){
            const deltedRes= await supabase.from('user_likes').delete().eq('blog_id',deleteBody.blog_id)
            // console.log('deleted entry counts',deltedRes)
         } 
         //!removing tags for deleted blog entry
         if(deleteBody.tags_id){
          const deletedTags= await deleteTags(deleteBody.tags_id,user.id)
          // console.log('deleted tags ',deletedTags);
         }
        //!deleting blog entry
        const updatedBlogResult = await supabase
          .from("blog")
          .delete()
          .match({id:deleteBody.id, blog_id:deleteBody.blog_id});
         
          //!removing image for deleted blog entry
          const fileDeleteResult = await supabase.storage
          .from("blog-medias")
          .remove([imagePath]);
           

          // console.log('file deleted',fileDeleteResult)
        const remaingBlogsOfLoggedUser = await allBlogPostOfLoggedUser(user.id)
        dispatch(addAllBlogsOfLoggedUser(remaingBlogsOfLoggedUser.data));
        // console.log("blog content deleted", updatedBlogResult);
        // console.log("remaing result of logged user", remaingBlogsOfLoggedUser);
      } catch (error) {
        console.log("error", error);
      }
    },
    {
      onSuccess: () => {
        setConfirmDelete(false)
        setDeleteBlogInfo(null)
        queryClient.invalidateQueries("blogPost");
        // queryClient.invalidateQueries('blogDetail');
      },
    }
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(async() => {
         if(searchInput.length>2){
           const searchResult= await searchAllBlogPostOfLoggedUser(user.id,searchInput);
      
            dispatch(addAllBlogsOfLoggedUser(searchResult.data));
            
            
         }
         else{
     const allresult= await allBlogPostOfLoggedUser(user.id);
     dispatch(addAllBlogsOfLoggedUser(allresult.data));
         }
    }, 500); // Wait for 1 second before executing the search function

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const openModalHandler=()=>{
    setIsModalOpen(true)
  }
  const closeModalHandler=()=>{
    {setIsModalOpen(false)
    }};
   const deleteBlogPostHandler=()=>{
      setConfirmDelete(true)
   }

   useEffect(()=>{
    if(confirmDelete){
       mutation.mutate(deleteBlogInfo)

    }
   },[confirmDelete,deleteBlogInfo])
  return (
    <>
    <Head>
      <title>All blogs</title>
    </Head>
      <div className="container mx-auto  border  ">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg p-3">
          {/*! search bar */}
          <div className="pb-4 bg-white dark:bg-gray-900 w-52 mx-10 my-2 ">
            <label htmlFor="table-search" className="sr-only">
              Search
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="table-search"
                onChange={(e)=>{setSearchInput(e.target.value)}}
                className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search your blog... "
              />
            </div>
          </div>
          {/* table start */}
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  <span className="sr-only">Image</span>
                </th>
                <th scope="col" className="px-6 py-3">
                  Posted Blog
                </th>
                <th scope="col" className="px-6 py-3 ">
                  Description
                </th>
                <th scope="col" className="px-6 py-3">
                  Edit
                </th>
                <th scope="col" className="px-6 py-3">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              
              {allBlogsOfLoggedUser && allBlogsOfLoggedUser.length>0? allBlogsOfLoggedUser.map((blog) => {
                  return (
                    <tr
                      key={blog.blog_id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="w-32 p-4">
                        <img
                          src={`${blog.image}`}
                          alt="Apple Watch"
                        />
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {blog.title}
                      </td>
                      <td className="px-6 py-4   ">
                        <p className="truncate w-96  ">{blog.body}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        <Link
                          href={`/blog/edit/${blog.blog_id}`}
                          onClick={() => {
                            dispatch(addEditBlogPost(blog));
                          }}
                          className="font-medium text-green-600 dark:green-red-500 hover:underline"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href=""
                          onClick={(e) => {
                            e.preventDefault();
                             openModalHandler()
                             setDeleteBlogInfo({
                              id: blog.id,
                              blog_id: blog.blog_id,
                              image:blog.image,
                              tags_id:blog.btj_tags_id,
                              like_count:blog.like_count
                            })
                            
                          }}
                          className="font-medium text-red-600 dark:text-red-500 hover:underline"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  );
                }) : <tr>
                  <td></td>
                  <td></td>
                  <td className="p-2">No records found</td>
                  <td></td>
                  </tr>}
               
            </tbody>
          </table>
        </div>
      </div>
    
      <CommonModal open={isModalOpen} onClose={closeModalHandler}>
      <ConfirmModal open={isModalOpen} deleteBlogPostHandler={deleteBlogPostHandler} closeModalHandler={closeModalHandler}/>
      </CommonModal>
    </>
  );
}

export default withAuth(UserBlogs);
