import { createSlice } from "@reduxjs/toolkit";
//!state 
const initialState={
    blogs:[],
    likedBlogByUser:[],
    allBlogsOfLoggedUser:[],
    editBlogPost:{},
    allTags:[],
    allCategories:[],
    loadMore:5,
    totalBlogsCount:0
   }

const blogSlice= createSlice({
    name:'blogSlice',
    initialState,
    reducers:{
         addAllBlogsOfLoggedUser:(state,action)=>{
            state.allBlogsOfLoggedUser= action.payload
         },
         addLikedBlogByUser:(state,action)=>{
            state.likedBlogByUser=action.payload
         },
         addEditBlogPost:(state,action)=>{
            state.editBlogPost= action.payload
         },
         addAllTags:(state,action)=>{state.allTags= action.payload},
         addAllCategories:(state,action)=>{state.allCategories= action.payload},
         addSearchedBlogPost:(state,action)=>{
            state.blogs= action.payload
         },
         updateLoadMoreCount:(state,action)=>{
            state.loadMore+=5
         },
         updateTotalBlogsCount:(state,action)=>{
            state.totalBlogsCount=action.payload
         },
         resetBlogStateOnLogout:(state,action)=>{
            state.allBlogsOfLoggedUser=[]
            state.likedBlogByUser=[]
            state.editBlogPost={}
            state.loadMore=5
            
         }
    }
})
export const {addAllBlogsOfLoggedUser,resetBlogStateOnLogout,updateTotalBlogsCount,updateLoadMoreCount,addLikedBlogByUser,addEditBlogPost,addAllTags,addAllCategories,addSearchedBlogPost}= blogSlice.actions
export default blogSlice.reducer