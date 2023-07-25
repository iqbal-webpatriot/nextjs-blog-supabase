import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getLikedPostFromSupabase,
  getSingleBlogPostFromSupabase,
} from "../../service/api";
import { useDispatch, useSelector } from "react-redux";
import { isLikedByUser } from "../../components/Post/PostCard";
import { supabase } from "../../lib/supabaseClient";
import { addLikedBlogByUser } from "../../Redux/Features/blogFeature/blogSlice";
import Head from "next/head";
import NotFound from "../../components/PageNotFound/PageNotFound";
import moment from "moment";
import {toast} from "react-toastify"
export default function Product({ post }) {
  const router = useRouter();
  const { likedBlogByUser } = useSelector((store) => store.blogReducer);
  const dispatch = useDispatch();
  // const { user } = useSelector((store) => store.userReducer);
  const user= JSON.parse(sessionStorage.getItem("user")) || {}
  const [newComment, setNewComment] = useState('');
  const queryClent = useQueryClient();
  const mutaion = useMutation(
    async (likeBody) => {
      try {
        const likedPostResult = await supabase.rpc(
          "toggle_like_state",
          likeBody
        );
      } catch (error) {
        console.log("error", error);
      }
    },
    {
      onSuccess: () => {
        getLikedPostFromSupabase({ user_id: user.id })
          .then((res) => {
            dispatch(addLikedBlogByUser(res.data));
            // console.log(' liked post res',res)
          })
          .catch((err) => {
            console.log("error while getting liked post", err);
          });
        queryClent.invalidateQueries("blogPost");
        queryClent.invalidateQueries("blogDetail");
      },
    }
  );
  const commentMutation = useMutation(
    async (commentBody) => {
      try {
        const commentResult = await supabase.from(
          "comment"

        ).insert(commentBody);
        console.log('new comment ',commentResult)
      } catch (error) {
        console.log("error", error);
      }
    },
    {
      onSuccess: () => {
        setNewComment('');
        queryClent.invalidateQueries("blogPost");
        queryClent.invalidateQueries("blogDetail");
      },
    }
  );
  // console.log('post',post)
  //  console.log('router ',router)
  const { data } = useQuery({
    queryKey: ["blogDetail", router?.query?.id],
    queryFn: async () => {
      const response = await getSingleBlogPostFromSupabase(router?.query?.id);
      // console.log('use query response', response)
      return response.data !== undefined ? response.data : [];
    },
    staleTime: 1000 * 60 * 6,
    refetchInterval: 1000 * 60 * 7,
  });
  console.log("data", data);
  // if (router.isFallback) {
  //   return <h1 className="mt-20">Loading......</h1>;
  // }
  //  const {id}= router.query
  // console.log('data received',data)
  return (
    <>
      {data !== undefined && data.length > 0 ? (
        <>
          <Head>
            <title>{data[0]?.title}</title>
            <meta name="description" content={data[0]?.body} />
            <meta
              name="keywords"
              content="next js, blog, next js blog, next "
            />
            <meta property="og:title" content={data[0]?.title} />
            <meta property="og:description" content={data[0]?.body} />
            <meta property="og:image" content={data[0]?.image} />
            <meta property="og:url" content="URL to the post's page" />
            <meta property="og:type" content="article" />
            <meta property="article:section" content="Blog" />
            <meta property="article:tag" content="nextjs blog" />
            <meta property="article:tag" content="next " />
          </Head>
          <div className="relative  container p-2  mx-auto  ">
            <img
              src={`${data[0]?.image}`}
              className="w-full md:w-3/4 lg:w-3/4 rounded md:mx-auto h-96 shadow shadow-zinc-300 "
            />
            <div className=" w-full md:w-3/4 md:mx-auto">
              <h3 className="   sm:mx-1 text-2xl first-letter:uppercase  font-bold my-2">
                {data[0].title}
              </h3>
              <div className="w-full flex justify-start items-center content-center p-1">
                <h5 className="mr-2  first-letter:uppercase  font-semibold text-red-500 my-1">{`Favorite${
                  data[0]?.like_count > 0 ? "(" + data[0].like_count + ")" : ""
                }`}</h5>
                <svg
                  onClick={() => {
                    if(!user.id){
                      toast.error('Login is required')
                      return
                    }
                    if(data[0]?.id===user.id){
                      toast.warn('You can not like your own post')
                      return
                    }
                    mutaion.mutate({
                      blog_id: data[0].blog_id,
                      user_id: user.id,
                    });
                  }}
                  className="cursor-pointer w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill={`${
                    isLikedByUser(data[0]?.blog_id, user.id, likedBlogByUser)
                      ? "red"
                      : "none"
                  }`}
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="red"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </div>
            </div>
            <div className="w-full md:w-3/4 md:mx-auto p-1">
              <h4 className="font-bold underline">Description</h4>
              <p className="text-gray-500 text-justify">{data[0]?.body}</p>
            </div>
          </div>
          <div className="w-full md:w-3/4 md:mx-auto p-1">
            <div className="container mx-auto px-4 mt-8">
              
              <div className="">
                <h2 className="text-xl font-semibold">{`Comments${data[0]?.comments?'('+data[0]?.comments.length+")":''}`}</h2>
                
              </div>
               {/* Comment creation form */}
               <div className="mt-4">
                <textarea
                  className="w-full px-4 py-2 border rounded"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button
                  disabled={data[0]?.id===user.id && true}
                  className={`bg-blue-500 text-white px-4 py-2 rounded mt-2 ${data[0]?.id===user.id?"opacity-50 cursor-not-allowed":""}`}
                   onClick={(e)=>{
                     e.preventDefault();
                      if(!user.id){
                        toast.error("Login is required")
                        return;
                      }
                      if(newComment===''){
                        toast.error("Comment field is required")
                        return;
                      }
                      commentMutation.mutate({
                        postId: data[0].blog_id,
                        userId: user.id,
                        body:newComment
                      })
                   }}
                >
                 Submit
                </button>
              </div>
              <div className="mt-4 max-h-96 overflow-auto">
                {/* Display existing comments */}
                {data[0]?.comments===null ? (
                  <p className="font-mono">This post has no comment yet...</p>
                ) : (
                  data[0]?.comments.map((comment) => {
                    // Find the user who made the comment
                    // const user = users.find((user) => user.id === comment.userId);
                    return (
                      <div
                        key={comment.c_Id}
                        className="flex items-start flex-wrap border p-4 my-2 shadow-sm rounded-md"
                      >
                        {/* <img
                  // src={user?.profileImage}
                  // alt={user?.name}
                  className="w-8 h-8 rounded-full mr-3"
                /> */}

                        <div className=" w-10 h-10 relative inline-flex items-center justify-center   bg-gray-100 rounded-full dark:bg-gray-600 mr-3">
                          <span className="font-medium text-gray-600 dark:text-gray-300">
                          {comment.user_email?.split('@')[0][0].toUpperCase()}
                          </span>
                        </div>

{/* <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 mr-2">
    <svg className="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
</div> */}

                        <div>
                          <p className="font-semibold"> {comment.user_email?.split('@')[0]}</p>
                          <p>
                            {comment.body}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {/* {new Date(comment.created_at).toLocaleString()} */}
                            {moment(comment.created_at).format("LLL")}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
             
            </div>
          </div>
        </>
      ) : (
        <NotFound />
      )}
    </>
  );
}

// Generates `/posts/1` and `/posts/2`
// export async function getStaticPaths() {
//   return {
//     paths: [{ params: { id: "3" } }],
//     fallback: true, // it shows that when the pregenerated paths are not available then getStaticPaths will call again to generate the requested page using getStaticProps method
//   };
// }

export async function getServerSideProps(context) {
  const queryClient = new QueryClient();
  const { params } = context;

  await queryClient.prefetchQuery(["blogDetail", params.id], async () => {
    const response = await getSingleBlogPostFromSupabase(params.id);
    //  console.log('single blog post', response)
    return response.data;
  });

  return {
    // Passed to the page component as props
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

// export async function getStaticProps(context) {
//   const queryClient = new QueryClient();
//   const { params } = context;

//   await queryClient.prefetchQuery(["blogDetail", params.id], async () => {
//     const response = await getSingleBlogPostFromSupabase(params.id);
//   //  console.log('single blog post', response)
//     return response.data;
//   });

//   return {
//     // Passed to the page component as props
//     props: {
//       dehydratedState: dehydrate(queryClient),
//     },
//   };
// }
