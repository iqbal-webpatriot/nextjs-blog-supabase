
import { Inter } from "@next/font/google";
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import PostCard from "../components/Post/PostCard";
import { useDispatch, useSelector } from "react-redux";
import { QueryClient, dehydrate, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllBlogPost, getAllBlogPostFromSupabase, getAllTags, getLikedPostFromSupabase, getTotalBlogsCount } from "../service/api";
// import { createClient } from "@supabase/supabase-js";
import { supabase } from '../lib/supabaseClient';
import { useCallback, useEffect, useState } from "react";
import { addAllBlogsOfLoggedUser, addAllTags, addLikedBlogByUser, addSearchedBlogPost, updateLoadMoreCount, updateTotalBlogsCount } from "../Redux/Features/blogFeature/blogSlice";
import { addLoggedUserInfo } from "../Redux/Features/UserFeature/userSlice";
import Head from "next/head";
import SearchBlog from "../components/Post/SearchBlog";
import ScrollToTopButton from "../components/Post/ScrollToTop";
import LoadMore from "../components/LoadMore/LoadMore";
import { ToastContainer } from 'react-toastify';

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  // console.log(posts);
  const queryClient=useQueryClient()
  const dispatch=useDispatch();
  const [likedPostId,setLikedPostId]=useState([]);
  // const {user}=useSelector((store)=>store.userReducer);
  const user= JSON.parse(sessionStorage.getItem("user")) ||{}
  const {blogs,likedBlogByUser,loadMore,totalBlogsCount}=useSelector((store)=>store.blogReducer);
  const [loadMoreLimit,setLoadMoreLimit]=useState(5)
  const [isVisible, setIsVisible] = useState(false); //! toggle load more component visibility
  const [searchInput,setSearchInput]=useState('');
  const [selectedCategory,setSelectCategory] = useState('')
  const fetchLikedPosts = useCallback(async () => {
  if( likedBlogByUser.length==0){
      getLikedPostFromSupabase({user_id:user.id}).then((res)=>{
        setLikedPostId(res.data);
        dispatch(addLikedBlogByUser(res.data))
        // console.log(' liked post res',res)
      }).catch((err)=>{
        console.log('error while getting liked post',err)
      })
     }
  }, [user,likedBlogByUser]);

  // updating blog store with letest data 
  //  dispatch(addAllBlogPosts(posts))
  //**  for blog post catching
  const {data,isLoading,isError,error,isFetched,isFetching}= useQuery({ queryKey: ['blogPost'], queryFn:async()=>{
    const response= await getAllBlogPostFromSupabase(searchInput,selectedCategory,loadMore);
    return response.data

  }, 
  staleTime: 1000 * 60 * 6, refetchInterval:1000*60*7 });

  useEffect(()=>{
    dispatch(addSearchedBlogPost(data))
    if(user.id){
      fetchLikedPosts()
    }
    if(totalBlogsCount==0){
      getTotalBlogsCount(searchInput,selectedCategory).then((count)=>{
    
        dispatch(updateTotalBlogsCount(count.count))
        console.log('total blogs count',count)
      }).catch((error)=>{
        console.log('error',error)
      })
    }
 },[isFetching])

 useEffect(()=>{  
  dispatch(addSearchedBlogPost(data))
    if(user.id){
      const loggedUserBlogList= data.filter((blog)=>blog.id===user.id);
      dispatch(addAllBlogsOfLoggedUser(loggedUserBlogList))
    }
   
 },[user.id])
//!Load more component effect 


  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollPosition === documentHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleLoadMore=()=>{
    // queryClient.invalidateQueries('blogPost')
   dispatch(updateLoadMoreCount())
    
    
  }
  //!updating redux store after loading more posts
  useEffect(()=>{
   if(loadMore>5){
    getAllBlogPostFromSupabase(searchInput,selectedCategory,loadMore).then((res)=>{
          setIsVisible(false)
      dispatch(addSearchedBlogPost(res.data));
    }).catch((err)=>{
     console.log('err',err)
    });
   }
    // console.log('search result: ', searchResult)
  },[loadMore])
  // console.log('load more limit ',loadMoreLimit)
  // console.log('is fetching ',isFetching)
  return (
    <>
    {/* <!-- Container for demo purpose --> */}
    <Head>
      <title>Next js </title>
    </Head>
 <div className="container   px-6 mx-auto">
 <SearchBlog loadMoreLimit={loadMore}/>
  {/* <!-- Section: Design Block --> */}
  <section className="mb-32    text-gray-800 text-center md:text-left">

    <h2 className="text-3xl font-bold mb-12 text-center">Latest Articles</h2>
     
   {blogs.length>0 ? blogs.map((post,index)=>{
    return <PostCard key={post.blog_id} id={index} post={post} likedPostId={likedBlogByUser}/>
   }):<p className="text-center ">No records found</p>}

   
<ScrollToTopButton scrollThreshold={300}/>
<LoadMore onLoadMore={handleLoadMore} isVisible={isVisible}  blogs={blogs} totalBlogsCount={totalBlogsCount}/>
  </section>
  {/* <!-- Section: Design Block --> */}

</div>
    </>
  );
}

// //! pre rendering using SSR => Server Side Rendering
export async function getServerSideProps(ctx) {
  // Create a QueryClient instance
  const queryClient = new QueryClient();
  // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  try {
 
    // Call prefetchQuery to fetch data and update cache
    await queryClient.prefetchQuery(['blogPost'], async () => {
      // const response = await getAllBlogPost();
       const response= await getAllBlogPostFromSupabase();
      //  console.log('response',response)
      // console.log("blog post api called",response)
      if (response.status!=200) {
        throw new Error('Failed to fetch data');
      }
      // console.log('prefetchQuery has run')
      return response.data;
    });

   
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}




// pre rendering using SSG=> Static Site Generation 
// export async  function getStaticProps(){
//   const {data}= await axios.get(
//     "http://localhost:7000/blogs"
//    );
   
//    return {props:{
//      posts:data,
    
//    }
//   , 
//   revalidate: 60 // will show updated data after 60 seconds
//   }
  
// } 
// const queryClient= new QueryClient();




