import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Api";

export const getMembersRequest = createAsyncThunk(
  "getMember",
  async ({ token, offset = null, city, role, companyName }) => {
    let roleName;
    role === "Другое"
      ? (roleName = "isother")
      : role === "Собственник КТК"
      ? (roleName = "isownercargo")
      : role === "Экспедитор-sender"
      ? (roleName = "issender")
      : role === "Собственник ПС"
      ? (roleName = "isownerpc")
      : role === "Грузовладелец"
      ? (roleName = "isownercargo")
      : role === "Морская линия"
      ? (roleName = "issealine")
      : null;
    try {
      const result = await api.post("/get-members-data", {
        secret_token: token,
        offset,
        city: city ? city : null,
        role: roleName,
        companyName: companyName ? companyName : null,
      });
      return result;
    } catch (error) {
      return error;
    }
  }
);

const getMembersSlice = createSlice({
  name: "getMembers",
  initialState: {
    loading: false,
    error: false,
    data: [],
    favoriteList: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMembersRequest.pending, (state) => {
        state.loading = true;
        state.favoriteList = [];
      })
      .addCase(getMembersRequest.fulfilled, (state, action) => {
        state.data = action.payload.data?.data?.company;
        state.favoriteList = action.payload.data?.data?.isLike;
        state.error = false;
        state.loading = false;
      })
      .addCase(getMembersRequest.rejected, (state) => {
        state.error = true;
        state.loading = false;
      });
  },
});

export default getMembersSlice.reducer;
