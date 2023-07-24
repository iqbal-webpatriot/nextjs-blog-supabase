import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment/moment";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../lib/supabaseClient";
import { getLikedPostFromSupabase } from "../../service/api";
import { addLikedBlogByUser } from "../../Redux/Features/blogFeature/blogSlice";
import {toast} from 'react-toastify'
export  const isLikedByUser =(blogId,userId,blogData)=>{
     if(blogData && blogData.length>0){
      // console.log('is liked status ',blogData.some((cur)=>cur.user_id==userId && cur.blog_id==blogId && cur.is_liked==true))
      return blogData.some((cur)=>cur.user_id==userId && cur.blog_id==blogId && cur.is_liked==true)
     }
     return false
}
export default function PostCard({ post, id ,likedPostId}) {
  const queryClent = useQueryClient();
  const dispatch=useDispatch()
  const mutaion = useMutation(
     async (likeBody) => {
        try {
          const likedPostResult= await supabase.rpc("toggle_like_state",likeBody);
          // console.log('like post result',likedPostResult)
            //  const isLikedAllready= likedPostId.some((curPost)=> curPost.blog_id==likeBody.blog_id && curPost.user_id==likeBody.user_id && curPost.is_liked==true);
            //  console.log('isliked already',isLikedAllready)
            //  if(isLikedAllready.length>0){
            //   // have to unlike the post
            //   const likedPostResult= await supabase.from("user_likes").update({is_liked:false}).match(likeBody);
            // console.log('blog unliked result ', likedPostResult)
            //  }
            //  else{
            //   const likedPostResult= await supabase.from("user_likes").insert({...likeBody,is_liked:true}).select("user_id,blog_id,is_liked");
            // console.log('blog liked result ', likedPostResult)
            //  }
        } catch (error) {
          console.log('error', error);
        }
    },
    {
      onSuccess: () => {
        dispatch(addLikedBlogByUser([]))
        queryClent.invalidateQueries("blogPost");
      },
    }
  );
  // const {user}=useSelector((store)=>store.userReducer)
  const user= JSON.parse(sessionStorage.getItem("user")) || {}
  return (
    <div key={id} className="grid  md:grid-cols-2 gap-x-6 xl:gap-x-12 items-center mb-12">
      <div
        className={` h-full mb-6 md:mb-0 ${id%2==1?"md:order-2":""}`}
        //style={{order:id%2===1?2:0}}
      >
        <div
          className="relative border overflow-hidden bg-no-repeat bg-cover  ripple shadow-lg rounded-lg"
          data-mdb-ripple="true"
          data-mdb-ripple-color="light"
        >
          <Image
              loader={(src)=>post?.image}
            src={`${post?.image}?t=${Date.now()}`}
            className=" w-full max-h-screen"
            alt="Louvre"
              width={50}
             height={50}
            
             
             
          />
          <Link href={`/blog/${post.blog_id}`}>
            <div
              className="absolute top-0 right-0 bottom-0 left-0 w-full h-full overflow-hidden bg-fixed opacity-0 hover:opacity-100 transition duration-300 ease-in-out"
              style={{ backgroundColor: "rgba(251, 251, 251, 0.2)" }}
            ></div>
          </Link>
        </div>
      </div>

      <div className="mb-6 md:mb-0  h-full">
        <h3 className="text-2xl font-bold mb-3">{post.title}</h3>
        <div className="mb-3  text-red-600 font-medium text-md flex items-center content-center justify-center md:justify-start">
        {`Favorite${post?.like_count>0?"("+post.like_count+")":' '} `}
          <svg
            onClick={() => {
              if(!user.id){
                toast.error('Login is required')
                return
              }
              if(post.id===user.id){
                toast.warn('You can not like your own post')
                return
              }
              mutaion.mutate({ user_id:user.id,blog_id:post.blog_id});
            }}
            className={`cursor-pointer w-5 h-5 ml-1`}
            xmlns="http://www.w3.org/2000/svg"
            fill={`${ isLikedByUser(post.blog_id,user.id,likedPostId) ? "red" : "none"}`}
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>

        </div>
        <p className="text-gray-500 mb-1">
          <small>
            Published <b>{moment(post.created_at).format("LL")}</b> by
            {user.id==post.id?<span className="text-gray-900 font-bold ml-1">
              You
            </span>:<span className="text-gray-900 ml-1">
              {post.email?.split('@')[0]}
            </span>}
          </small>
        </p>
        {post.category_name && <p className="text-gray-500 mb-2">
          <small>
             Category : 
            
          </small>
          <span className="text-sm pl-2"><b>{post.category_name}</b></span>
        </p>}
        {post.tags&& <div className="w-full overflow-x-auto h-7 mb-1  ">
          <small>Tags: </small>
          {post.tags.map((tag,index)=>{
            return (
              <span key={index} className="bg-green-100 border border-green-500 text-green-800 text-xs font-medium mr-2 p-1 rounded dark:bg-green-900 dark:text-green-300">{tag}</span>
            )
          })}
          </div>}
        <div className="text-gray-500 text-justify">{post.body.length>1000?post.body.substring(0,1000):post.body}
        {post.body.length>1000 &&  <small className="text-blue-400"><Link href={`/blog/${post.blog_id}`}>Read more...</Link></small>}
        </div>
        
      </div>
    </div>
  );
}
