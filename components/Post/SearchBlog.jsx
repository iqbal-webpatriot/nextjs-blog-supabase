import React, { useEffect, useState } from "react";
import { getAllBlogPostFromSupabase, getAllCategories, getAllTags } from "../../service/api";
import { addAllCategories, addAllTags, addSearchedBlogPost, updateTotalBlogsCount } from "../../Redux/Features/blogFeature/blogSlice";
import { useDispatch, useSelector } from "react-redux";

export default function SearchBlog({loadMoreLimit}) {
    const [searchInput,setSearchInput]=useState('');
    const [selectedCategory,setSelectCategory] = useState('')
    const {allTags,allCategories,blogs}=useSelector((store)=>store.blogReducer)
    console.log('selected category',selectedCategory)
    const dispatch=useDispatch();

    useEffect(() => {
        const delayDebounceFn = setTimeout(async() => {
             if(searchInput.length>2){
               const searchResult= await getAllBlogPostFromSupabase(searchInput,selectedCategory,loadMoreLimit);
                  // console.log('search result: ', searchResult)
                dispatch(addSearchedBlogPost(searchResult.data));
                dispatch(updateTotalBlogsCount(searchResult.count))
                
             }
             else if(blogs.length==0 || searchInput.length<2){
              const searchResult= await getAllBlogPostFromSupabase(searchInput,selectedCategory,loadMoreLimit);
          
              dispatch(addSearchedBlogPost(searchResult.data));
              dispatch(updateTotalBlogsCount(searchResult.count))
             }
        }, 500); // Wait for 1 second before executing the search function
    
        return () => clearTimeout(delayDebounceFn);
      }, [searchInput,selectedCategory,loadMoreLimit]);
    
      useEffect(()=>{
        //! condition to run api only once 
        if(allCategories.length ==0 && allTags.length ==0){
          getAllTags().then((res)=>{
            const modifiedoptions= res.data.map((tag)=>({value:tag.tag_id, label:tag.tag_name}));
            
            dispatch(addAllTags(modifiedoptions))
          
          }).catch((err)=>console.log('error',err));
          getAllCategories().then((res)=>{
            const modifiedCategoryOptions= res.data.map((category)=>({value:category.category_id, label:category.category_name}));
            dispatch(addAllCategories(modifiedCategoryOptions))
          }).catch((err)=>{
            console.log('error',err);
          })
        }
       },[])
  return (
    <>
      <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/2 p-2 border flex items-center content-center gap-2 justify-evenly mx-auto mb-2 ">
      <div className="flex-1">
        <select
        onChange={(e)=>setSelectCategory(e.target.value)}
          id="countries"
          className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        >
          <option value={''}>Choose category </option>
           {allCategories.length>0 && allCategories.map((category)=>{
            return (
                <option key={category.value} value={category.value}>{category.label}</option>
            )
           })}
        </select>
      </div>
      <div className=" bg-white dark:bg-gray-900   flex-1 ">
        <div className="relative ">
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
            onChange={(e) => {setSearchInput(e.target.value)}}
            className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder=" search blog..."
          />
        </div>
      </div>
      </div>
    </>
  );
}
