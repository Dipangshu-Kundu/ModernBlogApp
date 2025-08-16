import { createSlice } from "@reduxjs/toolkit";

const commentSlice=createSlice({
    name:"commentSLice",
    initialState:{
        isOpen:false
    },
    reducers:{
        setIsOpen(state,action){
            state.isOpen=action.payload==false?false:!state.isOpen
        }
    }
})
export const {setIsOpen}=commentSlice.actions
export default commentSlice.reducer