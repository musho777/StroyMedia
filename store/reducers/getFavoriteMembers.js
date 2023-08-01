import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../Api";

export const getFavoriteMembers = createAsyncThunk(
    "getFavoriteMembersSlicer",
    async (token) => {
      try {
        console.log(token)
        const result = await api.post("/get-favorite-members", {secret_token: token});
        
        return result;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          let error = err;
          if (!error.response) {
            throw err;
          }
          return rejectWithValue(error.response.data);
        }
        throw err;
      }
    }
  );

  
  
export const getFavoriteMembersSlicer = createSlice({
    name: "getFavoriteMembers",
    initialState: {
      loading: false,
      error: false,
      data: [],
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
  
        .addCase(getFavoriteMembers.pending, (state) => {
          state.loading = true;
        })
  
        .addCase(getFavoriteMembers.fulfilled, (state, action) => {
          state.data = action.payload.data?.data.users;
          state.error = false;
          state.loading = false;
        })
  
        .addCase(getFavoriteMembers.rejected, (state) => {
          state.error = true;
          state.loading = false;
        });
        
    },
  });
export default getFavoriteMembersSlicer.reducer;