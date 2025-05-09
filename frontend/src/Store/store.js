import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import  reducer   from "./features/taskSlice"
console.log("store js(FE)");
const store = configureStore({
  reducer: {
    user: userReducer,
    task: reducer,
    
  },
});

export default store;
