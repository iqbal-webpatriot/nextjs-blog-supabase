import { createSlice } from "@reduxjs/toolkit";
const initialState={
    user:{},
    session:{}
}

const userSlice= createSlice({
    name:'userSlice',
    initialState,
    reducers:{
        addLoggedUserInfo:(state,action)=>{
            state.user= action.payload?.user;
            state.session=action.payload?.session
        }
    }
})
export const {addLoggedUserInfo}= userSlice.actions
export default userSlice.reducer