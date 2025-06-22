import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string;
  email: string;
  walletAddress: string;
  profilePicture: string;
  ticketsOwned: string[];
  eventsCreated: string[];
  isLoggedIn: boolean;
}

const initialState: UserState = {
  name: "",
  email: "",
  walletAddress: "",
  profilePicture: "https://i.pinimg.com/736x/c7/e5/3b/c7e53b9868b5e924b4f7bb19993ce2d7.jpg",
  ticketsOwned: [],
  eventsCreated: [],
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Omit<UserState, "isLoggedIn">>) {
      console.log("setUser action called with payload:", action.payload);
      const newState = { ...action.payload, isLoggedIn: true };
      console.log("New user state:", newState);
      return newState;
    },
    logout(state) {
      console.log("logout action called");
      return { ...initialState };
    },
    updateTickets(state, action: PayloadAction<string[]>) {
      state.ticketsOwned = action.payload;
    },
    updateEvents(state, action: PayloadAction<string[]>) {
      state.eventsCreated = action.payload;
    },
  },
});

export const { setUser, logout, updateTickets, updateEvents } = userSlice.actions;
export default userSlice.reducer;
