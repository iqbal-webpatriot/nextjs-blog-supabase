import React, { useEffect, useState } from "react";
import {
  createNewBlogPost,
  getAllBlogPostFromSupabase,
  getAllCategories,
  getAllTags,
} from "../../service/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import withAuth from "../../protectedRoute/auth";
import { useDispatch, useSelector } from "react-redux";
import { addLoggedUserInfo } from "../../Redux/Features/UserFeature/userSlice";
import Head from "next/head";
import Select from 'react-select';
import { addAllCategories, addAllTags } from "../../Redux/Features/blogFeature/blogSlice";

 function NewBlog() {
  const [options,setOptions]=useState([]);
  const [categoryOptions,setCategoryOptions]=useState([])
  const [selectedTags,setSelectedTags]=useState(null);
  const [selectedCategory, setSelectedCategory]=useState(null);
  const dispatch=useDispatch()
  const queryClent = useQueryClient();
  // const {user}= useSelector((store)=>store.userReducer)
  const user= JSON.parse(sessionStorage.getItem("user")) || {}
  const {allTags,allCategories}=useSelector(store=>store.blogReducer)
  const [blogInput, setBlogInput] = useState({
    title: "",
    image: "",
    body: "",
    id: user.id,
  });
  // console.log('blog input',blogInput)
   const[errorMessage,setErrorMessage]=useState({})
  const mutaion = useMutation(
    async (blog) => {
      try {
        const file = blog.image; // Make sure this is a File object
        const filename = `${Date.now()}_${file.name}`; // Use a unique filename
        const { data, error } = await supabase.storage
          .from("blog-medias")
          .upload(filename, file);
        if (error) {
          console.error("Error uploading file:", error);
          return;
        }

        if (data.path) {
          const publicurl = await supabase.storage
            .from("blog-medias")
            .getPublicUrl(`${data.path}`, 60);
          const createPost = await supabase
            .from("blog")
            .insert({ ...blog, image: publicurl?.data?.publicUrl, category:selectedCategory.value }).select();
          // console.log("post created successfully", createPost);
          if(createPost.data[0]?.blog_id){
            const reqbody= selectedTags.map((tag=>({blog_id:createPost.data[0]?.blog_id,tag_id:tag.value,user_id:user.id})))
             const createTags= await supabase.from(
              "blog_tags_junction"
             ).insert(reqbody);
            //  console.log('tags created successfully', createTags)
          }
        }
       

      } catch (error) {
        console.error("Error while uploading image:", error);
      }
    },
    {
      onSuccess: () => {
        queryClent.invalidateQueries("blogPost");
      },
    }
  );
  const handleBlogInput = (e) => {
    let { name, value } = e.target;
    //? removing white spaces form start and end
     value=value.trimStart()
    if (/^[A-Za-z]/.test(value)) {
      value= value.charAt(0).toUpperCase() + value.slice(1);
    }
  
    setBlogInput({ ...blogInput, [name]: value });
    setErrorMessage({})
  };
  const createNewPost = (e) => {
    e.preventDefault();
    const {title,body,image} = blogInput
    if(!title && !image && !body && !selectedCategory && !selectedTags){
      setErrorMessage({
        title:'This field is required',
        image:'This field is required',
        body:'This field is required',
        category:'This field is required',
        tag:'This field is required'
      });
      return
    }
    if(!title ){
      setErrorMessage({
        title:'This field is required',
      });
      return
    }
    if(!image ){
      setErrorMessage({
        image:'This field is required',
      });
      return
    }
    if(!body ){
      setErrorMessage({
        body:'This field is required',
      });
      return
    }
    if(!selectedCategory ){
      setErrorMessage({
        category:'This field is required',
      });
      return
    }
    if(!selectedTags || selectedTags.length==0 ){
      setErrorMessage({
        tag:'This field is required',
      });
      return
    }
    mutaion.mutate(blogInput);
  };
  const testingSupabaseapi = async () => {
    try {
     const blogResult=   await supabase
      .from('blog_with_user_info')
      .select('*')
    
    
    

    
  
    } catch (error) {
      console.log("error supbase data ", error);
    }
  };
  
//  console.log('selected categories: ', selectedCategory)
  // useEffect(()=>{
  //   getAllTags().then((res)=>{
  //     const modifiedoptions= res.data.map((tag)=>({value:tag.tag_id, label:tag.tag_name}));
  //     setOptions(modifiedoptions)
  //     dispatch(addAllTags(modifiedoptions))
    
  //   }).catch((err)=>console.log('error',err));
  //   getAllCategories().then((res)=>{
  //     const modifiedCategoryOptions= res.data.map((category)=>({value:category.category_id, label:category.category_name}));
  //     setCategoryOptions(modifiedCategoryOptions);
  //     dispatch(addAllCategories(modifiedCategoryOptions))
  //   }).catch((err)=>{
  //     console.log('error',err);
  //   })
  //  },[])
  //  console.log('tag selected',selectedTags)
useEffect(()=>{
  setErrorMessage({})
},[selectedCategory,selectedTags])
  return (
    <>
     <Head>
      <title>Create new</title>
    </Head>
      <div className="sm:w-4/5 md:w-1/2 border mb-10   mx-auto p-5 shadow h-auto">
        <h2 className=" text-2xl font-semibold font-serif text-center mb-2 ">
          Create your new blog
        </h2>
        
        <div className="w-full  h-auto">
              <form>
                <div className="mb-6">
                 {errorMessage.title? <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-red-500 dark:text-white"
                  >
                    {errorMessage.title}
                  </label>: <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Blog Title
                  </label>}
                  <input
                    type="text"
                    id="email"
                    name="title"
                    value={blogInput.title}
                    onChange={handleBlogInput}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="i.e what is next js"
                    required
                  />
                </div>
                <div className="mb-6">
                 {
                  errorMessage.image? <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-red-500 dark:text-white"
                >
                {errorMessage.image}
                </label>: <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Blog Image
                </label>
                 }
                  <input
                    type="file"
                    id="email"
                    name="image"
                    // value={blogInput.image}
                    onChange={(e)=>{
                      setBlogInput({...blogInput, image: e.target.files[0]});
                      setErrorMessage({})
                    }}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="name@flowbite.com"
                    required
                  />
                </div>
                <div className="mb-6">
                  <div>
                  {
                    errorMessage.body ?<label
                    htmlFor="message"
                    className="block mb-2 text-sm font-medium text-red-500 dark:text-white"
                  >
                   {errorMessage.body}
                  </label>:<label
                    htmlFor="message"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Blog Content
                  </label>
                  }
                    <textarea
                      id="message"
                      name="body"
                      value={blogInput.body}
                      onChange={handleBlogInput}
                      rows={4}
                      className="block h-20 resize-none p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="start typing..."
                     
                    />
                    
                  </div>
                 
                </div>
                <div className="mb-6">
                  <div>
                  {
                    errorMessage.category ?<label
                    htmlFor="message"
                    className="block mb-2 text-sm font-medium text-red-500 dark:text-white"
                  >
                   {errorMessage.category}
                  </label>:<label
                    htmlFor="message"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                   Choose Category
                  </label>
                  }
                   <Select
                   menuPlacement="top"
                value={selectedCategory}
                onChange={setSelectedCategory}
               options={allCategories}
               
               />
                    
                  </div>
                 
                </div>
                <div className="mb-6">
                  <div>
                  {
                    errorMessage.tag ?<label
                    htmlFor="message"
                    className="block mb-2 text-sm font-medium text-red-500 dark:text-white"
                  >
                   {errorMessage.tag}
                  </label>:<label
                    htmlFor="message"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                   Choose Tags
                  </label>
                  }
                   <Select
                   menuPlacement="top"
                value={selectedTags}
                onChange={setSelectedTags}
                isOptionDisabled={()=> selectedTags && selectedTags.length==5}
               options={allTags}
               isMulti
               />
                    
                  </div>
                 
                </div>
                <button
                  type="submit"
                  onClick={createNewPost}
                  className=" w-40 bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                >
                  {mutaion.status==="loading" && "Posting ..."}
              {mutaion.status==="idle" && "Create Post"}
              {mutaion.status==="success" && "Post Created "}
                </button>
              </form>
            </div>
        
      </div>
    </>
  );
}

export default withAuth(NewBlog)