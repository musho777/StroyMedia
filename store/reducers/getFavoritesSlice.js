import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../Api";

export const getFavorites = createAsyncThunk(
    "getFavoritesSlice",
    async (token) => {
      try {
        const result = await api.post("/get-all-likes", {secret_token: token});
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
  
const getFavoritesSlice = createSlice({
    name: "getFavorites",
    initialState: {
      loading: false,
      error: false,
      data: [],
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
  
        .addCase(getFavorites.pending, (state) => {
          state.loading = true;
        })
  
        .addCase(getFavorites.fulfilled, (state, action) => {
          state.data = action.payload.data?.data.rows;
          state.error = false;
          state.loading = false;
        })
  
        .addCase(getFavorites.rejected, (state) => {
          state.error = true;
          state.loading = false;
        });
        
    },
  });
export default getFavoritesSlice.reducer;
  