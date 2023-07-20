import React from "react";
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
export default function Product({ post }) {
  const router = useRouter();
  const { likedBlogByUser } = useSelector((store) => store.blogReducer);
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.userReducer);
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
  // console.log('post',post)
//  console.log('router ',router)
  const { data } = useQuery({
    queryKey: ["blogDetail", router?.query?.id],
    queryFn: async () => {
      const response = await getSingleBlogPostFromSupabase(router?.query?.id);
      // console.log('use query response', response)
      return response.data!==undefined ?response.data :[];
    },
    staleTime: 1000 * 60 * 6,
    refetchInterval: 1000 * 60 * 7,
  });
  // if (router.isFallback) {
  //   return <h1 className="mt-20">Loading......</h1>;
  // }
  //  const {id}= router.query
  // console.log('data received',data)
  return (
    <>
     {data !==undefined && data.length>0 ? (
      <>
       <Head>
        <title>{data[0]?.title }</title>
        <meta name="description" content={data[0]?.body} />
        <meta name="keywords" content="next js, blog, next js blog, next " />
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
          <h3 className="  sm:mx-1 text-1xl first-letter:uppercase  font-medium my-2">
            {data[0].title}
          </h3>
          <div className="w-full flex justify-start items-center content-center p-1">
            <h5 className="mr-2  first-letter:uppercase  font-semibold text-red-500 my-1">{`Favorite${
              data[0]?.like_count > 0 ? "(" + data[0].like_count + ")" : ""
            }`}</h5>
            <svg
              onClick={() => {
                if (!user.id) {
                  return;
                }
                mutaion.mutate({ blog_id: data[0].blog_id, user_id: user.id });
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
      </>
     ):<NotFound/>}
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